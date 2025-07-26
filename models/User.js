// models/User.js - محدث مع إضافة البريد الإلكتروني والجنس
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'يرجى إدخال بريد إلكتروني صحيح'
    ]
  },
  passwordHash: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  streak: {
    type: Number,
    default: 0
  },
  lastRelapseDate: {
    type: Date,
    default: null
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  settings: {
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark'
    },
    disguiseMode: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'ar'
    }
  }
}, {
  timestamps: true
});

// تأكد من وجود الإعدادات عند الحفظ
userSchema.pre('save', function(next) {
  if (!this.settings) {
    this.settings = {
      theme: 'dark',
      disguiseMode: false,
      language: 'ar'
    };
  } else {
    if (this.settings.theme === undefined) this.settings.theme = 'dark';
    if (this.settings.disguiseMode === undefined) this.settings.disguiseMode = false;
    if (this.settings.language === undefined) this.settings.language = 'ar';
  }
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.updateStreak = function() {
  try {
    if (this.lastRelapseDate) {
      const daysSince = Math.floor((Date.now() - this.lastRelapseDate) / (1000 * 60 * 60 * 24));
      this.streak = Math.max(0, daysSince);
    } else {
      const daysSince = Math.floor((Date.now() - this.startDate) / (1000 * 60 * 60 * 24));
      this.streak = Math.max(0, daysSince);
    }
    return this.streak;
  } catch (error) {
    console.error('Error updating streak:', error);
    this.streak = 0;
    return 0;
  }
};

userSchema.methods.validateSettings = function() {
  if (!this.settings) {
    this.settings = {
      theme: 'dark',
      disguiseMode: false,
      language: 'ar'
    };
  }
  return this.settings;
};

// إنشاء token للتحقق من البريد الإلكتروني
userSchema.methods.generateEmailVerificationToken = function() {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.emailVerificationToken = token;
  return token;
};

// إنشاء token لإعادة تعيين كلمة المرور
userSchema.methods.generatePasswordResetToken = function() {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.passwordResetToken = token;
  this.passwordResetExpires = Date.now() + 3600000; // ساعة واحدة
  return token;
};

module.exports = mongoose.model('User', userSchema);