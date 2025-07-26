const express = require('express');
const User = require('../models/User');
const MoodLog = require('../models/MoodLog');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/settings', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.redirect('/login');
    }
    
    // تأكد من وجود الإعدادات
    if (!user.settings) {
      user.settings = {
        theme: 'dark',
        disguiseMode: false,
        language: 'ar'
      };
      await user.save();
    }
    
    res.render('settings', { user, message: null });
  } catch (error) {
    console.error('Settings page error:', error);
    res.status(500).render('error', { 
      message: 'فشل في تحميل صفحة الإعدادات. يرجى المحاولة مرة أخرى.' 
    });
  }
});

// Combined settings update route - مصحح
router.post('/settings/update', requireAuth, async (req, res) => {
  try {
    const { theme, language, disguiseMode } = req.body;
    
    console.log('Received settings update:', { theme, language, disguiseMode });
    
    // Validate inputs
    if (!['light', 'dark'].includes(theme)) {
      return res.redirect('/settings?error=invalid_theme');
    }
    
    if (!['ar', 'en'].includes(language)) {
      return res.redirect('/settings?error=invalid_language');
    }

    const isDisguiseEnabled = disguiseMode === 'on';

    // Update all settings at once
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.redirect('/login');
    }

    // تأكد من وجود كائن الإعدادات
    if (!user.settings) {
      user.settings = {};
    }

    user.settings.theme = theme;
    user.settings.language = language;
    user.settings.disguiseMode = isDisguiseEnabled;

    await user.save();
    
    console.log('Settings updated successfully');
    res.redirect('/settings?success=settings_updated');
  } catch (error) {
    console.error('Settings update error:', error);
    res.redirect('/settings?error=update_failed');
  }
});

router.post('/settings/theme', requireAuth, async (req, res) => {
  try {
    const { theme } = req.body;
    if (!['light', 'dark'].includes(theme)) {
      return res.redirect('/settings?error=invalid_theme');
    }

    const user = await User.findById(req.session.user.id);
    if (!user.settings) user.settings = {};
    user.settings.theme = theme;
    await user.save();

    res.redirect('/settings?success=theme_updated');
  } catch (error) {
    console.error(error);
    res.redirect('/settings?error=update_failed');
  }
});

router.post('/settings/disguise', requireAuth, async (req, res) => {
  try {
    const { disguiseMode } = req.body;
    const isEnabled = disguiseMode === 'on';

    const user = await User.findById(req.session.user.id);
    if (!user.settings) user.settings = {};
    user.settings.disguiseMode = isEnabled;
    await user.save();

    res.redirect('/settings?success=disguise_updated');
  } catch (error) {
    console.error(error);
    res.redirect('/settings?error=update_failed');
  }
});

router.post('/settings/language', requireAuth, async (req, res) => {
  try {
    const { language } = req.body;
    if (!['ar', 'en'].includes(language)) {
      return res.redirect('/settings?error=invalid_language');
    }

    const user = await User.findById(req.session.user.id);
    if (!user.settings) user.settings = {};
    user.settings.language = language;
    await user.save();

    res.redirect('/settings?success=language_updated');
  } catch (error) {
    console.error(error);
    res.redirect('/settings?error=update_failed');
  }
});

router.post('/settings/delete-account', requireAuth, async (req, res) => {
  try {
    const { confirmDelete } = req.body;
    if (confirmDelete !== 'DELETE') {
      return res.redirect('/settings?error=invalid_confirmation');
    }

    // Delete user's mood logs
    await MoodLog.deleteMany({ userId: req.session.user.id });
    
    // Delete user
    await User.findByIdAndDelete(req.session.user.id);
    
    // Destroy session
    req.session.destroy(() => {
      res.redirect('/?deleted=true');
    });
  } catch (error) {
    console.error(error);
    res.redirect('/settings?error=delete_failed');
  }
});

module.exports = router;