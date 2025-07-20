const express = require('express');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
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