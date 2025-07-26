// models/MoodLog.js
const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  moodLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  urgeLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  notes: {
    type: String,
    maxlength: 500,
    default: ''
  },
  activities: [{
    type: String,
    enum: ['exercise', 'meditation', 'reading', 'socializing', 'work', 'prayer', 'other']
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('MoodLog', moodLogSchema);