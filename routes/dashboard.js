// routes/dashboard.js - الحل النهائي والبسيط

const express = require('express');
const User = require('../models/User');
const MoodLog = require('../models/MoodLog');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.redirect('/login');
    }

    // Update streak
    user.updateStreak();
    await user.save();

    // Get recent mood logs
    const recentLogs = await MoodLog.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(7);

    // فحص وضع التمويه - الحل البسيط
    const shouldShowDisguise = user.settings && 
                              user.settings.disguiseMode && 
                              !req.session.authenticatedSession;

    if (shouldShowDisguise) {
      // التحقق إذا كان هذا وصول مباشر (ليس من صفحة داخلية)
      const isDirectAccess = !req.headers.referer || 
                            !req.headers.referer.includes(req.headers.host);
      
      if (isDirectAccess) {
        return res.render('disguise', { 
          user,
          title: 'AquaTrack - Clean Water Initiative'
        });
      }
    }

    // تسجيل أن المستخدم دخل للـ dashboard (جلسة مصادق عليها)
    req.session.authenticatedSession = true;

    // العرض العادي للـ dashboard
    res.render('dashboard', { 
      user, 
      recentLogs,
      streak: user.streak,
      title: 'لوحة التحكم - نقاء'
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).render('error', { 
      message: 'فشل في تحميل لوحة التحكم. يرجى المحاولة مرة أخرى.',
      title: 'خطأ - نقاء'
    });
  }
});

// API لإلغاء التمويه
router.post('/api/unlock-disguise', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user || !user.settings || !user.settings.disguiseMode) {
      return res.json({ success: false, error: 'وضع التمويه غير مفعل' });
    }

    // حفظ حالة المصادقة في الجلسة
    req.session.authenticatedSession = true;
    
    res.json({ 
      success: true, 
      message: 'تم منح الوصول',
      redirectUrl: '/dashboard'
    });
  } catch (error) {
    console.error('Unlock disguise error:', error);
    res.json({ success: false, error: 'خطأ في الخادم' });
  }
});

// إضافة route للخروج (إعادة تعيين الجلسة)
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/dashboard');
    }
    res.redirect('/');
  });
});

// بقية الـ routes
router.post('/api/emergency', requireAuth, async (req, res) => {
  try {
    console.log(`Emergency request from user: ${req.session.user.id} at ${new Date()}`);
    res.json({ 
      success: true,
      message: 'تذكر، هذه المرحلة ستمر. أنت أقوى من رغباتك.'
    });
  } catch (error) {
    console.error('Emergency request error:', error);
    res.json({ 
      success: false, 
      message: 'حدث خطأ. يرجى المحاولة مرة أخرى.' 
    });
  }
});

module.exports = router;