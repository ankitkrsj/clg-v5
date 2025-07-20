require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const AdminSettings = require('../models/AdminSettings');
const Game = require('../models/Game');

const connectDB = require('../config/database');

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Seeding database...');

    // Create admin settings
    const existingSettings = await AdminSettings.findOne();
    if (!existingSettings) {
      const settings = new AdminSettings({
        qrCodeUrl: 'https://via.placeholder.com/200x200?text=Payment+QR+Code',
        headerBannerText: 'Welcome to ColorBet Casino!',
        headerBannerActive: true,
        gameDuration: 60
      });
      await settings.save();
      console.log('Admin settings created');
    }

    // Create initial game
    const existingGame = await Game.findOne();
    if (!existingGame) {
      const game = new Game({
        gameNumber: 1,
        status: 'waiting',
        startTime: new Date(Date.now() + 10000)
      });
      await game.save();
      console.log('Initial game created');
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();