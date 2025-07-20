const express = require('express');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create deposit request
router.post('/deposit', auth, upload.single('screenshot'), async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Screenshot is required' });
    }

    const transaction = new Transaction({
      userId: req.user._id,
      type: 'pending_deposit',
      amount: parseFloat(amount),
      description: `Deposit request of $${amount}`,
      status: 'pending',
      screenshotUrl: req.file.path
    });

    await transaction.save();

    res.json({ message: 'Deposit request submitted successfully', transaction });
  } catch (error) {
    console.error('Create deposit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;