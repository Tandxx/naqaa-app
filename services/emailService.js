// services/emailService.js - خدمة البريد الإلكتروني الكاملة مع اللوقو
require('dotenv').config();
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // إعداد transporter للبريد الإلكتروني
    this.transporter = nodemailer.createTransport({
      // يمكنك استخدام Gmail أو أي خدمة بريد أخرى
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });

    // أو يمكنك استخدام SMTP مخصص
    // this.transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST || 'smtp.gmail.com',
    //   port: process.env.SMTP_PORT || 587,
    //   secure: false,
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS
    //   }
    // });
  }

  // إرسال بريد التحقق
  async sendVerificationEmail(email, username, verificationToken) {
    const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'نقاء - naqaa',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || 'noreply@naqaa.app'
      },
      to: email,
      subject: 'تأكيد البريد الإلكتروني - نقاء',
      html: this.getVerificationEmailTemplate(username, verificationUrl),
      text: `
        مرحبًا ${username}،

        شكرًا لانضمامك إلى نقاء!

        يرجى النقر على الرابط التالي لتأكيد بريدك الإلكتروني:
        ${verificationUrl}

        هذا الرابط صالح لمدة 24 ساعة.

        إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد.

        مع أطيب التحيات،
        فريق نقاء
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('تم إرسال بريد التحقق:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('خطأ في إرسال بريد التحقق:', error);
      return { success: false, error: error.message };
    }
  }

  // إرسال بريد إعادة تعيين كلمة المرور
  async sendPasswordResetEmail(email, username, resetToken) {
    const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'نقاء - naqaa',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || 'noreply@naqaa.app'
      },
      to: email,
      subject: 'إعادة تعيين كلمة المرور - نقاء',
      html: this.getPasswordResetEmailTemplate(username, resetUrl),
      text: `
        مرحبًا ${username}،

        تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك في نقاء.

        يرجى النقر على الرابط التالي لإعادة تعيين كلمة المرور:
        ${resetUrl}

        هذا الرابط صالح لمدة ساعة واحدة فقط.

        إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد.

        مع أطيب التحيات،
        فريق نقاء
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('تم إرسال بريد إعادة تعيين كلمة المرور:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('خطأ في إرسال بريد إعادة تعيين كلمة المرور:', error);
      return { success: false, error: error.message };
    }
  }

  // قالب HTML لبريد التحقق
  getVerificationEmailTemplate(username, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تأكيد البريد الإلكتروني - نقاء</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%);
            margin: 0;
            padding: 20px;
            color: #ffffff;
            direction: rtl;
            text-align: right;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(145deg, #141720, #0f1114);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
          }
          .logo {
            text-align: center;
            margin-bottom: 20px;
            filter: drop-shadow(0 0 20px rgba(36, 132, 242, 0.3));
          }
          .logo img {
            height: 5rem;
            width: auto;
            max-width: 200px;
          }
          .title {
            background: linear-gradient(135deg, #2484f2, #1c6dd0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 2rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 10px;
            line-height: 1.2;
          }
          .subtitle {
            color: #a1a8b8;
            text-align: center;
            margin-bottom: 30px;
            font-size: 1.1rem;
            line-height: 1.4;
          }
          .content {
            color: #e0e0e0;
            line-height: 1.8;
            margin-bottom: 30px;
            font-size: 1rem;
          }
          .content p {
            margin-bottom: 15px;
          }
          .content strong {
            color: #ffffff;
            font-weight: 600;
          }
          .btn-container {
            text-align: center;
            margin: 30px 0;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #2484f2, #1c6dd0);
            color: #ffffff !important;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1.1rem;
            box-shadow: 0 8px 32px rgba(36, 132, 242, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 48px rgba(36, 132, 242, 0.4);
            text-decoration: none;
          }
          .warning {
            background: rgba(255, 184, 0, 0.1);
            border: 1px solid #ffb800;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #ffb800;
            font-size: 0.9rem;
            line-height: 1.6;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            color: #888888;
            font-size: 0.9rem;
            text-align: center;
            line-height: 1.6;
          }
          .footer strong {
            color: #ffffff;
          }
          .link-fallback {
            margin-top: 20px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            font-size: 0.8rem;
            word-break: break-all;
            color: #2484f2;
          }
          
          /* Responsive */
          @media (max-width: 600px) {
            .container {
              padding: 20px;
              margin: 10px;
            }
            .logo img {
              height: 4rem;
            }
            .title {
              font-size: 1.5rem;
            }
            .subtitle {
              font-size: 1rem;
            }
            .btn {
              padding: 12px 25px;
              font-size: 1rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="${process.env.BASE_URL || 'http://localhost:3000'}/image/1.png" alt="نقاء - Naqaa Logo">
          </div>
          
          <h1 class="title">نقاء - تأكيد البريد الإلكتروني</h1>
          <p class="subtitle">مرحبًا بك في رحلة التحسن والنقاء</p>
          
          <div class="content">
            <p>مرحبًا <strong>${username}</strong>،</p>
            
            <p>شكرًا لانضمامك إلى <strong>نقاء</strong>! نحن متحمسون لمساعدتك في رحلتك نحو حياة أفضل وأكثر نقاءً.</p>
            
            <p>لتفعيل حسابك والبدء في استخدام جميع ميزات التطبيق، يرجى النقر على الزر أدناه لتأكيد بريدك الإلكتروني:</p>
          </div>
          
          <div class="btn-container">
            <a href="${verificationUrl}" class="btn">✅ تأكيد البريد الإلكتروني</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ تنبيه مهم:</strong><br>
            هذا الرابط صالح لمدة 24 ساعة فقط. بعد انتهاء هذه المدة، ستحتاج لطلب رابط تحقق جديد من صفحة تسجيل الدخول.
          </div>
          
          <div class="content">
            <p><strong>ماذا ستحصل عليه بعد التحقق؟</strong></p>
            <ul style="color: #b0b0b0; padding-right: 20px;">
              <li>الوصول الكامل لجميع ميزات التطبيق</li>
              <li>تتبع تقدمك اليومي</li>
              <li>الحصول على الدعم والمساعدة</li>
              <li>أمان إضافي لحسابك</li>
            </ul>
            
            <p style="margin-top: 20px;"><strong>إذا لم تقم بإنشاء هذا الحساب،</strong> يرجى تجاهل هذا البريد وحذفه. لن يتم تفعيل أي حساب بدون النقر على رابط التحقق.</p>
          </div>
          
          <div class="footer">
            <p>مع أطيب التحيات،<br><strong>فريق نقاء</strong></p>
            
            <div class="link-fallback">
              <strong>مشكلة في النقر على الزر؟</strong><br>
              يمكنك نسخ ولصق الرابط التالي في متصفحك:<br>
              <span style="color: #2484f2;">${verificationUrl}</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // قالب HTML لبريد إعادة تعيين كلمة المرور
  getPasswordResetEmailTemplate(username, resetUrl) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إعادة تعيين كلمة المرور - نقاء</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%);
            margin: 0;
            padding: 20px;
            color: #ffffff;
            direction: rtl;
            text-align: right;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(145deg, #141720, #0f1114);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
          }
          .logo {
            text-align: center;
            margin-bottom: 20px;
            filter: drop-shadow(0 0 20px rgba(36, 132, 242, 0.3));
          }
          .logo img {
            height: 5rem;
            width: auto;
            max-width: 200px;
          }
          .title {
            background: linear-gradient(135deg, #2484f2, #1c6dd0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 2rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 10px;
            line-height: 1.2;
          }
          .subtitle {
            color: #a1a8b8;
            text-align: center;
            margin-bottom: 30px;
            font-size: 1.1rem;
            line-height: 1.4;
          }
          .content {
            color: #e0e0e0;
            line-height: 1.8;
            margin-bottom: 30px;
            font-size: 1rem;
          }
          .content p {
            margin-bottom: 15px;
          }
          .content strong {
            color: #ffffff;
            font-weight: 600;
          }
          .btn-container {
            text-align: center;
            margin: 30px 0;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #2484f2, #1c6dd0);
            color: #ffffff !important;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1.1rem;
            box-shadow: 0 8px 32px rgba(36, 132, 242, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 48px rgba(36, 132, 242, 0.4);
            text-decoration: none;
          }
          .warning {
            background: rgba(255, 71, 87, 0.1);
            border: 1px solid #ff4757;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #ff4757;
            font-size: 0.9rem;
            line-height: 1.6;
          }
          .security-tips {
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid #00ff88;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #00ff88;
            font-size: 0.9rem;
            line-height: 1.6;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            color: #888888;
            font-size: 0.9rem;
            text-align: center;
            line-height: 1.6;
          }
          .footer strong {
            color: #ffffff;
          }
          .link-fallback {
            margin-top: 20px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            font-size: 0.8rem;
            word-break: break-all;
            color: #2484f2;
          }
          
          /* Responsive */
          @media (max-width: 600px) {
            .container {
              padding: 20px;
              margin: 10px;
            }
            .logo img {
              height: 4rem;
            }
            .title {
              font-size: 1.5rem;
            }
            .subtitle {
              font-size: 1rem;
            }
            .btn {
              padding: 12px 25px;
              font-size: 1rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="${process.env.BASE_URL || 'http://localhost:3000'}/image/1.png" alt="نقاء - Naqaa Logo">
          </div>
          
          <h1 class="title">إعادة تعيين كلمة المرور</h1>
          <p class="subtitle">طلب إعادة تعيين كلمة المرور لحساب نقاء</p>
          
          <div class="content">
            <p>مرحبًا <strong>${username}</strong>،</p>
            
            <p>تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك في <strong>نقاء</strong>.</p>
            
            <p>إذا كنت قد طلبت هذا التغيير، يرجى النقر على الزر أدناه لإنشاء كلمة مرور جديدة وآمنة:</p>
          </div>
          
          <div class="btn-container">
            <a href="${resetUrl}" class="btn">🔐 إعادة تعيين كلمة المرور</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ تنبيه أمني مهم:</strong><br>
            هذا الرابط صالح لمدة ساعة واحدة فقط من وقت إرسال هذا البريد. بعد انتهاء هذه المدة، ستحتاج لطلب رابط جديد من صفحة "نسيت كلمة المرور".
          </div>
          
          <div class="security-tips">
            <strong>🛡️ نصائح الأمان لكلمة المرور الجديدة:</strong><br>
            • استخدم كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز<br>
            • تجنب استخدام معلومات شخصية مثل اسمك أو تاريخ ميلادك<br>
            • لا تشارك كلمة المرور مع أي شخص آخر<br>
            • استخدم كلمة مرور فريدة لحساب نقاء
          </div>
          
          <div class="content">
            <p><strong>إذا لم تطلب إعادة تعيين كلمة المرور:</strong></p>
            <p>يرجى تجاهل هذا البريد وحذفه فورًا. حسابك آمن ولن يتم تغيير أي شيء بدون النقر على الرابط أعلاه. إذا كنت تتلقى هذه الرسائل بشكل متكرر، يرجى التواصل معنا.</p>
            
            <p style="margin-top: 20px;"><strong>احم حسابك:</strong> تأكد من أن جهازك آمن وأن لديك برامج حماية محدثة.</p>
          </div>
          
          <div class="footer">
            <p>مع أطيب التحيات،<br><strong>فريق نقاء</strong></p>
            
            <div class="link-fallback">
              <strong>مشكلة في النقر على الزر؟</strong><br>
              يمكنك نسخ ولصق الرابط التالي في متصفحك:<br>
              <span style="color: #2484f2;">${resetUrl}</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // التحقق من إعدادات البريد الإلكتروني
  async verifyEmailConfig() {
    try {
      await this.transporter.verify();
      console.log('✅ إعدادات البريد الإلكتروني صحيحة ومتصلة');
      return true;
    } catch (error) {
      console.error('❌ خطأ في إعدادات البريد الإلكتروني:', error);
      return false;
    }
  }

  // إرسال بريد ترحيب (اختياري)
  async sendWelcomeEmail(email, username) {
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'نقاء - naqaa',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || 'noreply@naqaa.app'
      },
      to: email,
      subject: 'مرحبًا بك في نقاء - رحلتك تبدأ الآن!',
      html: this.getWelcomeEmailTemplate(username),
      text: `
        مرحبًا ${username}،

        مرحبًا بك في نقاء! نحن سعداء لانضمامك إلينا.

        رحلتك نحو التحسن والنقاء تبدأ الآن. 

        مع أطيب التحيات،
        فريق نقاء
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('تم إرسال بريد الترحيب:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('خطأ في إرسال بريد الترحيب:', error);
      return { success: false, error: error.message };
    }
  }

  // قالب بريد الترحيب (اختياري)
  getWelcomeEmailTemplate(username) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>مرحبًا بك في نقاء</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%);
            margin: 0;
            padding: 20px;
            color: #ffffff;
            direction: rtl;
            text-align: right;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(145deg, #141720, #0f1114);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
          }
          .logo {
            text-align: center;
            margin-bottom: 20px;
            filter: drop-shadow(0 0 20px rgba(36, 132, 242, 0.3));
          }
          .logo img {
            height: 5rem;
            width: auto;
            max-width: 200px;
          }
          .title {
            background: linear-gradient(135deg, #00ff88, #00cc6a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 2rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 10px;
            line-height: 1.2;
          }
          .subtitle {
            color: #a1a8b8;
            text-align: center;
            margin-bottom: 30px;
            font-size: 1.1rem;
            line-height: 1.4;
          }
          .content {
            color: #e0e0e0;
            line-height: 1.8;
            margin-bottom: 30px;
            font-size: 1rem;
          }
          .welcome-box {
            background: linear-gradient(135deg, #2484f2, #1c6dd0);
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            margin: 25px 0;
            color: white;
          }
          .features {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
          }
          .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            color: #e0e0e0;
          }
          .feature-emoji {
            font-size: 1.5rem;
            margin-left: 15px;
            margin-right: 5px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            color: #888888;
            font-size: 0.9rem;
            text-align: center;
            line-height: 1.6;
          }
          .footer strong {
            color: #ffffff;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="${process.env.BASE_URL || 'http://localhost:3000'}/image/1.png" alt="نقاء - Naqaa Logo">
          </div>
          
          <h1 class="title">مرحبًا بك في نقاء!</h1>
          <p class="subtitle">رحلتك نحو التحسن والنقاء تبدأ الآن</p>
          
          <div class="welcome-box">
            <h2 style="color: white; margin-bottom: 15px;">🎉 أهلاً وسهلاً ${username}!</h2>
            <p style="color: white; margin: 0; font-size: 1.1rem;">
              نحن سعداء لانضمامك إلى مجتمع نقاء. معًا سنبني عادات إيجابية ونحقق أهدافنا.
            </p>
          </div>
          
          <div class="content">
            <h3 style="color: #ffffff; margin-bottom: 15px;">ما يمكنك فعله الآن:</h3>
            
            <div class="features">
              <div class="feature-item">
                <span class="feature-emoji">📊</span>
                <span>ابدأ بتتبع تقدمك اليومي</span>
              </div>
              <div class="feature-item">
                <span class="feature-emoji">🎯</span>
                <span>ضع أهدافًا واضحة وقابلة للتحقيق</span>
              </div>
              <div class="feature-item">
                <span class="feature-emoji">📚</span>
                <span>استفد من المصادر والمحتوى المفيد</span>
              </div>
              <div class="feature-item">
                <span class="feature-emoji">🆘</span>
                <span>احصل على الدعم الطارئ عند الحاجة</span>
              </div>
              <div class="feature-item">
                <span class="feature-emoji">🔒</span>
                <span>استخدم وضع التمويه للخصوصية الإضافية</span>
              </div>
            </div>
            
            <p style="margin-top: 20px;"><strong>نصيحة:</strong> ابدأ صغيرًا وكن صبورًا مع نفسك. كل يوم نظيف هو إنجاز يستحق الاحتفال!</p>
          </div>
          
          <div class="footer">
            <p>نحن هنا لدعمك في كل خطوة من رحلتك</p>
            <p><strong>فريق نقاء</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // قالب بريد التحفيز
  getMotivationalEmailTemplate(username, streakDays) {
    const milestoneMessage = this.getMilestoneMessage(streakDays);
    
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>استمر في التقدم - نقاء</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%);
            margin: 0;
            padding: 20px;
            color: #ffffff;
            direction: rtl;
            text-align: right;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(145deg, #141720, #0f1114);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
          }
          .logo {
            text-align: center;
            margin-bottom: 20px;
            filter: drop-shadow(0 0 20px rgba(36, 132, 242, 0.3));
          }
          .logo img {
            height: 5rem;
            width: auto;
          }
          .streak-counter {
            text-align: center;
            background: linear-gradient(135deg, #00ff88, #00cc6a);
            border-radius: 20px;
            padding: 30px;
            margin: 20px 0;
            color: white;
          }
          .streak-number {
            font-size: 4rem;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 10px;
          }
          .streak-label {
            font-size: 1.2rem;
            opacity: 0.9;
          }
          .milestone-message {
            background: linear-gradient(135deg, #2484f2, #1c6dd0);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            color: white;
          }
          .content {
            color: #e0e0e0;
            line-height: 1.8;
            font-size: 1rem;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            color: #888888;
            font-size: 0.9rem;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="${process.env.BASE_URL || 'http://localhost:3000'}/image/1.png" alt="نقاء">
          </div>
          
          <div class="streak-counter">
            <div class="streak-number">${streakDays}</div>
            <div class="streak-label">${streakDays === 1 ? 'يوم نظيف' : 'أيام نظيفة'}</div>
          </div>
          
          <div class="milestone-message">
            <h2 style="color: white; margin-bottom: 10px;">${milestoneMessage.title}</h2>
            <p style="color: white; margin: 0;">${milestoneMessage.message}</p>
          </div>
          
          <div class="content">
            <p>عزيزي <strong>${username}</strong>،</p>
            <p>نريد أن نحتفل معك بهذا الإنجاز الرائع! ${streakDays} ${streakDays === 1 ? 'يوم' : 'أيام'} من النقاء والتقدم.</p>
            <p>تذكر أن كل يوم تمر به بنجاح هو خطوة نحو الشخص الذي تريد أن تكونه.</p>
            <p><strong>استمر في التقدم، أنت أقوى مما تتخيل! 💪</strong></p>
          </div>
          
          <div class="footer">
            <p>فخورون بك،<br><strong>فريق نقاء</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // رسائل المعالم المختلفة
  getMilestoneMessage(days) {
    if (days === 1) {
      return {
        title: "بداية رائعة! 🌟",
        message: "اليوم الأول هو الأصعب، وقد نجحت فيه!"
      };
    } else if (days === 7) {
      return {
        title: "أسبوع كامل! 🎉",
        message: "إنجاز مذهل! أسبوع من التقدم والنمو"
      };
    } else if (days === 30) {
      return {
        title: "شهر كامل! 🏆",
        message: "إنجاز استثنائي! شهر كامل من التحسن المستمر"
      };
    } else if (days === 90) {
      return {
        title: "ثلاثة أشهر! 🌟",
        message: "تحول حقيقي! أنت تبني عادات إيجابية قوية"
      };
    } else if (days === 365) {
      return {
        title: "سنة كاملة! 👑",
        message: "إنجاز تاريخي! أنت مصدر إلهام للجميع"
      };
    } else {
      return {
        title: "استمر في التقدم! 💫",
        message: "كل يوم يمر هو دليل على قوة إرادتك وعزيمتك"
      };
    }
  }

  // اختبار الاتصال وإرسال بريد تجريبي
  async sendTestEmail(email) {
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'نقاء - naqaa',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || 'noreply@naqaa.app'
      },
      to: email,
      subject: 'اختبار خدمة البريد الإلكتروني - نقاء',
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px;">
          <img src="${process.env.BASE_URL || 'http://localhost:3000'}/image/1.png" alt="نقاء" style="height: 3rem; display: block; margin: 0 auto 20px;">
          <h2 style="color: #2484f2; text-align: center;">اختبار خدمة البريد الإلكتروني</h2>
          <p>هذا بريد إلكتروني تجريبي للتأكد من أن خدمة البريد الإلكتروني تعمل بشكل صحيح.</p>
          <p>إذا وصلك هذا البريد، فإن الخدمة تعمل بشكل مثالي! ✅</p>
          <hr style="margin: 20px 0; border: 1px solid #eee;">
          <p style="font-size: 0.9rem; color: #666;">فريق نقاء</p>
        </div>
      `,
      text: 'اختبار خدمة البريد الإلكتروني - نقاء'
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('تم إرسال البريد التجريبي:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('خطأ في إرسال البريد التجريبي:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();