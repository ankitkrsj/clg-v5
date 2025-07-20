const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  qrCodeUrl: {
    type: String,
    default: 'https://via.placeholder.com/200x200?text=Payment+QR+Code'
  },
  headerBannerText: {
    type: String,
    default: 'Welcome to ColorBet Casino!'
  },
  headerBannerActive: {
    type: Boolean,
    default: true
  },
  gameDuration: {
    type: Number,
    default: 60
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);