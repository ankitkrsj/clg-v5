const express = require('express');
const Game = require('../models/Game');
const Bet = require('../models/Bet');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const AdminSettings = require('../models/AdminSettings');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Global variables to manage game state
let gameCreationInProgress = false;
let continuousGamesEnabled = false;
let gameCreationTimeout = null;
let gameCheckInterval = null;

// Start game monitoring when server starts
const startGameMonitoring = () => {
  if (gameCheckInterval) {
    clearInterval(gameCheckInterval);
  }
  
  gameCheckInterval = setInterval(async () => {
    try {
      if (!continuousGamesEnabled) return;
      
      const activeGame = await Game.findOne({ 
        status: { $in: ['waiting', 'betting'] } 
      }).sort({ createdAt: -1 });

      if (!activeGame) {
        if (continuousGamesEnabled) {
          await createNewGameSafely();
        }
        return;
      }

      const now = new Date();
      
      // Check if waiting game should start betting
      if (activeGame.status === 'waiting' && now >= activeGame.startTime) {
        activeGame.status = 'betting';
        await activeGame.save();
        console.log(`Game #${activeGame.gameNumber} started betting`);
      }
      
      // Check if betting game should end
      if (activeGame.status === 'betting') {
        const settings = await AdminSettings.findOne();
        const bettingDuration = (settings?.gameDuration || 60) * 1000;
        const bettingEndTime = new Date(activeGame.startTime.getTime() + bettingDuration);
        
        if (now >= bettingEndTime) {
          await endGameAndProcessBets(activeGame);
          
          // Schedule next game creation
          if (continuousGamesEnabled) {
            setTimeout(async () => {
              await createNewGameSafely();
            }, 3000); // 3 seconds delay
          }
        }
      }
    } catch (error) {
      console.error('Error in game monitoring:', error);
    }
  }, 2000); // Check every 2 seconds
};

// Get current game
router.get('/current', auth, async (req, res) => {
  try {
    let game = await Game.findOne({ 
      status: { $in: ['waiting', 'betting'] } 
    }).sort({ createdAt: -1 });

    res.json({ game });
  } catch (error) {
    console.error('Get current game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Safe game creation with proper locking and unique game numbers
async function createNewGameSafely() {
  if (gameCreationInProgress) {
    console.log('Game creation already in progress, skipping...');
    return null;
  }

  gameCreationInProgress = true;
  
  try {
    // Double-check if a game already exists
    const existingGame = await Game.findOne({ 
      status: { $in: ['waiting', 'betting'] } 
    }).sort({ createdAt: -1 });

    if (existingGame) {
      console.log('Game already exists, skipping creation');
      return existingGame;
    }

    // Get the next game number safely with atomic operation
    const lastGame = await Game.findOne().sort({ gameNumber: -1 });
    const nextGameNumber = lastGame ? lastGame.gameNumber + 1 : 1;
    
    // Create the game with retry logic for duplicate key errors
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      try {
        const gameData = {
          gameNumber: nextGameNumber + attempts,
          status: 'waiting',
          startTime: new Date(Date.now() + 5000) // Start in 5 seconds
        };
        
        const game = new Game(gameData);
        await game.save();
        
        console.log(`Successfully created game #${game.gameNumber}`);
        return game;
      } catch (error) {
        if (error.code === 11000) { // Duplicate key error
          attempts++;
          console.log(`Duplicate key error, retrying with gameNumber ${nextGameNumber + attempts}`);
          
          if (attempts >= maxAttempts) {
            console.log('Max attempts reached for game creation');
            return null;
          }
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Error in createNewGameSafely:', error);
    return null;
  } finally {
    gameCreationInProgress = false;
  }
}

// Helper function to end game and process bets
async function endGameAndProcessBets(game) {
  try {
    const resultNumber = game.fixedResult !== null ? game.fixedResult : Math.floor(Math.random() * 10);
    const resultColor = resultNumber === 0 ? 'green' : (resultNumber % 2 === 0 ? 'red' : 'green');
    const resultSize = resultNumber >= 5 ? 'big' : 'small';

    game.status = 'completed';
    game.endTime = new Date();
    game.resultNumber = resultNumber;
    game.resultColor = resultColor;
    game.resultSize = resultSize;
    await game.save();

    console.log(`Game #${game.gameNumber} ended with result: ${resultNumber} (${resultColor}, ${resultSize})`);

    // Process bets
    const bets = await Bet.find({ gameId: game._id, result: 'pending' });
    
    for (const bet of bets) {
      let isWin = false;
      let multiplier = 1;

      switch (bet.betType) {
        case 'number':
          isWin = parseInt(bet.betValue) === resultNumber;
          multiplier = 9;
          break;
        case 'color':
          isWin = bet.betValue === resultColor;
          multiplier = 2;
          break;
        case 'size':
          isWin = bet.betValue === resultSize;
          multiplier = 2;
          break;
      }

      bet.result = isWin ? 'win' : 'loss';
      bet.payout = isWin ? bet.amount * multiplier : 0;
      await bet.save();

      if (isWin) {
        // Update wallet
        const wallet = await Wallet.findOne({ userId: bet.userId });
        if (wallet) {
          wallet.balance += bet.payout;
          await wallet.save();
        }

        // Create transaction
        const transaction = new Transaction({
          userId: bet.userId,
          type: 'win',
          amount: bet.payout,
          description: `Won $${bet.payout} from ${bet.betType} bet on ${bet.betValue} (Game #${game.gameNumber})`,
          status: 'approved'
        });
        await transaction.save();
      }
    }

    console.log(`Processed ${bets.length} bets for game #${game.gameNumber}`);
  } catch (error) {
    console.error('Error ending game and processing bets:', error);
    throw error;
  }
}

// Place bet
router.post('/bet', auth, async (req, res) => {
  try {
    const { gameId, betType, betValue, amount } = req.body;

    // Validate game
    const game = await Game.findById(gameId);
    if (!game || game.status !== 'betting') {
      return res.status(400).json({ error: 'Game is not accepting bets' });
    }

    // Check if user already has a bet for this game
    const existingBet = await Bet.findOne({ userId: req.user._id, gameId });
    if (existingBet) {
      return res.status(400).json({ error: 'You have already placed a bet for this game' });
    }

    // Check wallet balance
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create bet
    const bet = new Bet({
      userId: req.user._id,
      gameId,
      betType,
      betValue,
      amount
    });
    await bet.save();

    // Update wallet balance
    wallet.balance -= amount;
    await wallet.save();

    // Create transaction
    const transaction = new Transaction({
      userId: req.user._id,
      type: 'bet',
      amount: -amount,
      description: `Bet $${amount} on ${betType}: ${betValue} (Game #${game.gameNumber})`,
      status: 'approved'
    });
    await transaction.save();

    res.json({ message: 'Bet placed successfully', bet });
  } catch (error) {
    console.error('Place bet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's bet for current game
router.get('/current-bet', auth, async (req, res) => {
  try {
    const currentGame = await Game.findOne({ 
      status: { $in: ['waiting', 'betting', 'completed'] } 
    }).sort({ createdAt: -1 });

    if (!currentGame) {
      return res.json({ bet: null, game: null });
    }

    const bet = await Bet.findOne({ 
      userId: req.user._id, 
      gameId: currentGame._id 
    });

    res.json({ bet, game: currentGame });
  } catch (error) {
    console.error('Get current bet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's recent bets
router.get('/user-bets', auth, async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user._id })
      .populate('gameId')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ bets });
  } catch (error) {
    console.error('Get user bets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create new game
router.post('/create', adminAuth, async (req, res) => {
  try {
    const game = await createNewGameSafely();
    if (game) {
      res.json({ message: 'Game created successfully', game });
    } else {
      res.status(400).json({ error: 'Failed to create game' });
    }
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: End game
router.put('/:id/end', adminAuth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status === 'completed') {
      return res.status(400).json({ error: 'Game is already completed' });
    }

    await endGameAndProcessBets(game);

    res.json({ message: 'Game ended successfully', game });
  } catch (error) {
    console.error('End game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Start continuous games
router.post('/start-continuous', adminAuth, async (req, res) => {
  try {
    // Enable continuous games
    continuousGamesEnabled = true;
    
    // End any current games first
    await Game.updateMany(
      { status: { $in: ['waiting', 'betting'] } },
      { status: 'completed', endTime: new Date() }
    );

    // Start game monitoring
    startGameMonitoring();

    // Create first game
    const game = await createNewGameSafely();
    
    if (game) {
      res.json({ message: 'Continuous games started', game });
    } else {
      res.status(400).json({ error: 'Failed to start continuous games' });
    }
  } catch (error) {
    console.error('Start continuous games error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Stop continuous games
router.post('/stop-continuous', adminAuth, async (req, res) => {
  try {
    // Disable continuous games
    continuousGamesEnabled = false;
    
    // Clear intervals
    if (gameCheckInterval) {
      clearInterval(gameCheckInterval);
      gameCheckInterval = null;
    }
    
    if (gameCreationTimeout) {
      clearTimeout(gameCreationTimeout);
      gameCreationTimeout = null;
    }
    
    // End all active games
    const activeGames = await Game.find({ status: { $in: ['waiting', 'betting'] } });
    
    for (const game of activeGames) {
      await endGameAndProcessBets(game);
    }

    res.json({ message: 'Continuous games stopped' });
  } catch (error) {
    console.error('Stop continuous games error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get continuous games status
router.get('/continuous-status', adminAuth, async (req, res) => {
  try {
    res.json({ 
      enabled: continuousGamesEnabled,
      creationInProgress: gameCreationInProgress
    });
  } catch (error) {
    console.error('Get continuous status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Fix game result
router.put('/:id/fix', adminAuth, async (req, res) => {
  try {
    const { fixedResult } = req.body;
    
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status === 'completed') {
      return res.status(400).json({ error: 'Cannot fix result of completed game' });
    }

    game.isFixed = true;
    game.fixedResult = fixedResult;
    await game.save();

    res.json({ message: 'Game result fixed successfully', game });
  } catch (error) {
    console.error('Fix game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start monitoring when module loads
startGameMonitoring();

module.exports = router;