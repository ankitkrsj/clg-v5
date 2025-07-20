const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameNumber: {
    type: Number,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['waiting', 'betting', 'completed'],
    default: 'waiting'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  resultNumber: {
    type: Number,
    min: 0,
    max: 9,
    default: null
  },
  resultColor: {
    type: String,
    enum: ['red', 'green'],
    default: null
  },
  resultSize: {
    type: String,
    enum: ['big', 'small'],
    default: null
  },
  isFixed: {
    type: Boolean,
    default: false
  },
  fixedResult: {
    type: Number,
    min: 0,
    max: 9,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Game', gameSchema);