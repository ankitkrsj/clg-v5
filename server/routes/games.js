const express = require('express');
const Game = require('../models/Game');
const Bet = require('../models/Bet');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get current game
router.get('/current', auth, async (req, res) => {
  try {
    let game = await Game.findOne({ 
      status: { $in: ['waiting', 'betting'] } 
    }).sort({ createdAt: -1 });

    if (!game) {
      // Create new game
      const lastGame = await Game.findOne().sort({ gameNumber: -1 });
      const gameNumber = lastGame ? lastGame.gameNumber + 1 : 1;
      
      game = new Game({
        gameNumber,
        status: 'waiting',
        startTime: new Date(Date.now() + 10000) // Start in 10 seconds
      });
      await game.save();
    } else {
      // Check if waiting game should start betting
      const now = new Date();
      if (game.status === 'waiting' && now >= game.startTime) {
        game.status = 'betting';
        await game.save();
      }
      
      // Check if betting game should end (after 60 seconds of betting)
      if (game.status === 'betting') {
        const bettingDuration = 60000; // 60 seconds
        const bettingEndTime = new Date(game.startTime.getTime() + bettingDuration);
        if (now >= bettingEndTime) {
          // Auto-end the game
          const resultNumber = game.fixedResult !== null ? game.fixedResult : Math.floor(Math.random() * 10);
          const resultColor = resultNumber === 0 ? 'green' : (resultNumber % 2 === 0 ? 'red' : 'green');
          const resultSize = resultNumber >= 5 ? 'big' : 'small';

          game.status = 'completed';
          game.endTime = new Date();
          game.resultNumber = resultNumber;
          game.resultColor = resultColor;
          game.resultSize = resultSize;
          await game.save();

          // Process bets (if any)
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
                description: `Won $${bet.payout} from ${bet.betType} bet`,
                status: 'approved'
              });
              await transaction.save();
            }
          }
          
          // Auto-create next game after 5 seconds
          setTimeout(async () => {
            try {
              const nextGameNumber = game.gameNumber + 1;
              const nextGame = new Game({
                gameNumber: nextGameNumber,
                status: 'waiting',
                startTime: new Date(Date.now() + 5000) // Start in 5 seconds
              });
              await nextGame.save();
              console.log(`Auto-created next game #${nextGameNumber}`);
            } catch (error) {
              console.error('Error auto-creating next game:', error);
            }
          }, 5000);
        }
      }
    }

    res.json({ game });
  } catch (error) {
    console.error('Get current game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Place bet
router.post('/bet', auth, async (req, res) => {
  try {
    const { gameId, betType, betValue, amount } = req.body;

    // Validate game
    const game = await Game.findById(gameId);
    if (!game || game.status !== 'betting') {
      return res.status(400).json({ error: 'Game is not accepting bets' });
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
      description: `Bet $${amount} on ${betType}: ${betValue}`,
      status: 'approved'
    });
    await transaction.save();

    res.json({ message: 'Bet placed successfully', bet });
  } catch (error) {
    console.error('Place bet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create new game
router.post('/create', adminAuth, async (req, res) => {
  try {
    const lastGame = await Game.findOne().sort({ gameNumber: -1 });
    const gameNumber = lastGame ? lastGame.gameNumber + 1 : 1;
    
    const game = new Game({
      gameNumber,
      status: 'waiting',
      startTime: new Date(Date.now() + 10000)
    });
    await game.save();

    res.json({ message: 'Game created successfully', game });
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

    // Generate result
    let resultNumber = game.fixedResult;
    if (!game.isFixed || resultNumber === null) {
      resultNumber = Math.floor(Math.random() * 10);
    }

    const resultColor = resultNumber === 0 ? 'green' : (resultNumber % 2 === 0 ? 'red' : 'green');
    const resultSize = resultNumber >= 5 ? 'big' : 'small';

    // Update game
    game.status = 'completed';
    game.endTime = new Date();
    game.resultNumber = resultNumber;
    game.resultColor = resultColor;
    game.resultSize = resultSize;
    await game.save();

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
          description: `Won $${bet.payout} from ${bet.betType} bet`,
          status: 'approved'
        });
        await transaction.save();
      }
    }

    res.json({ message: 'Game ended successfully', game });
  } catch (error) {
    console.error('End game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;