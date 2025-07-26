// routes/log.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const MoodLog = require('../models/MoodLog');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/log', requireAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingLog = await MoodLog.findOne({
      userId: req.session.user.id,
      date: { $gte: today }
    });

    res.render('log', { 
      existingLog,
      errors: [],
      formData: existingLog || {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Failed to load log page' });
  }
});

router.post('/log', requireAuth, [
  body('moodLevel').isInt({ min: 1, max: 10 }).withMessage('Mood level must be between 1 and 10'),
  body('urgeLevel').isInt({ min: 1, max: 10 }).withMessage('Urge level must be between 1 and 10'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.render('log', { 
      errors: errors.array(), 
      formData: req.body,
      existingLog: null
    });
  }

  try {
    const { moodLevel, urgeLevel, notes, activities } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if log already exists for today
    let existingLog = await MoodLog.findOne({
      userId: req.session.user.id,
      date: { $gte: today }
    });

    if (existingLog) {
      // Update existing log
      existingLog.moodLevel = parseInt(moodLevel);
      existingLog.urgeLevel = parseInt(urgeLevel);
      existingLog.notes = notes || '';
      existingLog.activities = Array.isArray(activities) ? activities : (activities ? [activities] : []);
      await existingLog.save();
    } else {
      // Create new log
      const moodLog = new MoodLog({
        userId: req.session.user.id,
        moodLevel: parseInt(moodLevel),
        urgeLevel: parseInt(urgeLevel),
        notes: notes || '',
        activities: Array.isArray(activities) ? activities : (activities ? [activities] : [])
      });
      await moodLog.save();
    }

    res.redirect('/dashboard?logged=true');
  } catch (error) {
    console.error(error);
    res.render('log', { 
      errors: [{ msg: 'Failed to save log. Please try again.' }], 
      formData: req.body,
      existingLog: null
    });
  }
});

// Relapse endpoint
router.post('/api/relapse', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    user.lastRelapseDate = new Date();
    user.streak = 0;
    await user.save();

    res.json({ success: true, message: 'Streak reset. Tomorrow is a new beginning.' });
  } catch (error) {
    res.json({ success: false });
  }
});

module.exports = router;