const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Game = require('../models/Game');
const Bet = require('../models/Bet');
const Wallet = require('../models/Wallet');
const AdminSettings = require('../models/AdminSettings');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get admin stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBalance = await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    const activeGames = await Game.countDocuments({ status: { $in: ['waiting', 'betting'] } });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBets = await Bet.countDocuments({ createdAt: { $gte: today } });
    const todayRevenue = await Bet.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalUsers,
      totalBalance: totalBalance[0]?.total || 0,
      pendingTransactions,
      activeGames,
      todayBets,
      todayRevenue: todayRevenue[0]?.total || 0,
      blockedUsers: await User.countDocuments({ isBlocked: true })
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Get wallet and bet stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const wallet = await Wallet.findOne({ userId: user._id });
        const bets = await Bet.find({ userId: user._id });
        const totalBets = bets.length;
        const wins = bets.filter(bet => bet.result === 'win').length;
        const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;

        return {
          ...user.toObject(),
          balance: wallet?.balance || 0,
          totalBets,
          winRate
        };
      })
    );

    res.json({ users: usersWithStats });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Block/Unblock user
router.put('/users/:id/block', adminAuth, async (req, res) => {
  try {
    const { isBlocked, blockReason } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBlocked = isBlocked;
    user.blockReason = isBlocked ? blockReason : null;
    await user.save();

    res.json({ message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all transactions
router.get('/transactions', adminAuth, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'email username')
      .sort({ createdAt: -1 });

    // Format transactions for frontend
    const formattedTransactions = transactions.map(transaction => ({
      _id: transaction._id,
      id: transaction._id, // Add both for compatibility
      userId: transaction.userId,
      user_email: transaction.userId?.email || 'Unknown',
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      status: transaction.status,
      screenshotUrl: transaction.screenshotUrl,
      screenshot_url: transaction.screenshotUrl, // Add both for compatibility
      adminNotes: transaction.adminNotes,
      admin_notes: transaction.adminNotes, // Add both for compatibility
      createdAt: transaction.createdAt,
      created_at: transaction.createdAt // Add both for compatibility
    }));
    res.json({ transactions: formattedTransactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve/Reject transaction
router.put('/transactions/:id', adminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    transaction.status = status;
    transaction.adminNotes = adminNotes;
    await transaction.save();

    // If approving a deposit, update wallet balance
    if (status === 'approved' && transaction.type === 'pending_deposit') {
      const wallet = await Wallet.findOne({ userId: transaction.userId });
      if (wallet) {
        wallet.balance += transaction.amount;
        await wallet.save();
      }

      // Create approved deposit transaction
      const approvedTransaction = new Transaction({
        userId: transaction.userId,
        type: 'deposit',
        amount: transaction.amount,
        description: `Approved deposit of $${transaction.amount}`,
        status: 'approved'
      });
      await approvedTransaction.save();
    }

    res.json({ message: 'Transaction updated successfully' });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get admin settings
router.get('/settings', adminAuth, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    
    if (!settings) {
      settings = new AdminSettings();
      await settings.save();
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update admin settings
router.put('/settings', adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings(updates);
    } else {
      Object.assign(settings, updates);
    }
    
    await settings.save();

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fix game result
router.put('/games/:id/fix', adminAuth, async (req, res) => {
  try {
    const { fixedResult } = req.body;
    
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    game.isFixed = true;
    game.fixedResult = fixedResult;
    await game.save();

    res.json({ message: 'Game result fixed successfully' });
  } catch (error) {
    console.error('Fix game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;