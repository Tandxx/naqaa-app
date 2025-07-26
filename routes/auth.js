// routes/auth.js - محدث مع إضافة البريد الإلكتروني والجنس
const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const emailService = require('../services/emailService'); // إضافة خدمة البريد
const { requireGuest } = require('../middleware/auth');

const router = express.Router();

// Register page
router.get('/register', requireGuest, (req, res) => {
  res.render('register', { errors: [], formData: {} });
});

// Register POST
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('اسم المستخدم يجب أن يكون بين 3-20 حرف')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('كلمات المرور غير متطابقة');
      }
      return true;
    }),
  body('gender')
    .isIn(['male', 'female'])
    .withMessage('يرجى اختيار الجنس')
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.render('register', { 
      errors: errors.array(), 
      formData: req.body 
    });
  }

  try {
    const { username, email, password, gender } = req.body;
    
    // Check if user exists (username or email)
    const existingUser = await User.findOne({ 
      $or: [
        { username: username },
        { email: email }
      ]
    });
    
    if (existingUser) {
      const errorMsg = existingUser.username === username 
        ? 'اسم المستخدم موجود بالفعل'
        : 'البريد الإلكتروني مسجل بالفعل';
      
      return res.render('register', { 
        errors: [{ msg: errorMsg }], 
        formData: req.body 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({ 
      username, 
      email,
      passwordHash,
      gender
    });
    
    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();
    
    // Send verification email
    if (process.env.ENABLE_EMAIL_VERIFICATION === 'true') {
      try {
        const emailResult = await emailService.sendVerificationEmail(email, username, verificationToken);
        if (emailResult.success) {
          console.log('✅ تم إرسال بريد التحقق بنجاح');
        } else {
          console.error('❌ فشل في إرسال بريد التحقق:', emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ خطأ في إرسال البريد الإلكتروني:', emailError);
      }
    }
    
    // Login user (you might want to require email verification first)
    req.session.user = { 
      id: user._id, 
      username: user.username,
      email: user.email,
      gender: user.gender
    };
    
    res.redirect('/dashboard?welcome=true');
  } catch (error) {
    console.error(error);
    res.render('register', { 
      errors: [{ msg: 'فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.' }], 
      formData: req.body 
    });
  }
});

// Login page
router.get('/login', requireGuest, (req, res) => {
  res.render('login', { errors: [], formData: {} });
});

// Login POST - updated to accept email or username
router.post('/login', [
  body('loginField')
    .trim()
    .notEmpty()
    .withMessage('يرجى إدخال اسم المستخدم أو البريد الإلكتروني'),
  body('password')
    .notEmpty()
    .withMessage('يرجى إدخال كلمة المرور')
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.render('login', { 
      errors: errors.array(), 
      formData: req.body 
    });
  }

  try {
    const { loginField, password } = req.body;
    
    // Find user by username or email
    const user = await User.findOne({ 
      $or: [
        { username: loginField },
        { email: loginField }
      ]
    });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.render('login', { 
        errors: [{ msg: 'اسم المستخدم/البريد الإلكتروني أو كلمة المرور غير صحيحة' }], 
        formData: req.body 
      });
    }
    
    req.session.user = { 
      id: user._id, 
      username: user.username,
      email: user.email,
      gender: user.gender
    };
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('login', { 
      errors: [{ msg: 'فشل في تسجيل الدخول. يرجى المحاولة مرة أخرى.' }], 
      formData: req.body 
    });
  }
});

// Email verification route
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.render('error', { 
        message: 'رمز التحقق غير صحيح أو منتهي الصلاحية' 
      });
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await user.save();
    
    res.render('email-verified', { 
      message: 'تم التحقق من البريد الإلكتروني بنجاح!' 
    });
  } catch (error) {
    console.error(error);
    res.render('error', { 
      message: 'حدث خطأ أثناء التحقق من البريد الإلكتروني' 
    });
  }
});

// Forgot password page
router.get('/forgot-password', requireGuest, (req, res) => {
  res.render('forgot-password', { errors: [], message: null });
});

// Forgot password POST
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح')
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.render('forgot-password', { 
      errors: errors.array(), 
      message: null 
    });
  }

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.render('forgot-password', { 
        errors: [{ msg: 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني' }], 
        message: null 
      });
    }
    
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    
    // Send password reset email
    try {
      const emailResult = await emailService.sendPasswordResetEmail(email, user.username, resetToken);
      if (emailResult.success) {
        console.log('✅ تم إرسال بريد إعادة تعيين كلمة المرور بنجاح');
        res.render('forgot-password', { 
          errors: [], 
          message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' 
        });
      } else {
        console.error('❌ فشل في إرسال بريد إعادة تعيين كلمة المرور:', emailResult.error);
        res.render('forgot-password', { 
          errors: [{ msg: 'حدث خطأ في إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.' }], 
          message: null 
        });
      }
    } catch (emailError) {
      console.error('❌ خطأ في إرسال البريد الإلكتروني:', emailError);
      res.render('forgot-password', { 
        errors: [{ msg: 'حدث خطأ في إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.' }], 
        message: null 
      });
    }
  } catch (error) {
    console.error(error);
    res.render('forgot-password', { 
      errors: [{ msg: 'حدث خطأ. يرجى المحاولة مرة أخرى.' }], 
      message: null 
    });
  }
});

// Reset password page
router.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ 
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.render('error', { 
        message: 'رمز إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية' 
      });
    }
    
    res.render('reset-password', { 
      errors: [], 
      token: token 
    });
  } catch (error) {
    console.error(error);
    res.render('error', { 
      message: 'حدث خطأ أثناء تحميل الصفحة' 
    });
  }
});

// Reset password POST
router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('كلمات المرور غير متطابقة');
      }
      return true;
    })
], async (req, res) => {
  const errors = validationResult(req);
  const { token } = req.params;
  
  if (!errors.isEmpty()) {
    return res.render('reset-password', { 
      errors: errors.array(), 
      token: token 
    });
  }

  try {
    const user = await User.findOne({ 
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.render('error', { 
        message: 'رمز إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية' 
      });
    }
    
    const { password } = req.body;
    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    
    res.redirect('/login?reset=success');
  } catch (error) {
    console.error(error);
    res.render('reset-password', { 
      errors: [{ msg: 'حدث خطأ. يرجى المحاولة مرة أخرى.' }], 
      token: token 
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;