const express = require('express');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Bet = require('../models/Bet');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get wallet
router.get('/', auth, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      wallet = new Wallet({ userId: req.user._id });
      await wallet.save();
    }

    res.json({ wallet });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user._id });
    const transactions = await Transaction.find({ userId: req.user._id });
    
    const totalBets = bets.length;
    const wins = bets.filter(bet => bet.result === 'win').length;
    const losses = bets.filter(bet => bet.result === 'loss').length;
    const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;
    
    const totalWagered = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const totalWon = bets.reduce((sum, bet) => sum + bet.payout, 0);
    const netProfit = totalWon - totalWagered;
    
    const stats = {
      totalBets,
      wins,
      losses,
      winRate,
      totalWagered,
      totalWon,
      netProfit
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update wallet balance (internal use)
router.put('/balance', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    wallet.balance = Math.max(0, amount);
    await wallet.save();

    res.json({ wallet });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;