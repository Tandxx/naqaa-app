// test-send-email.js - Test sending email
require('dotenv').config();
const emailService = require('./services/emailService');

async function testSendEmail() {
  console.log('🧪 Testing email sending...');

  console.log('🔐 Testing password reset email...');
  try {
    const resetResult = await emailService.sendPasswordResetEmail(
      'narfi7.a@gmail.com',  // Replace with your real email for testing
      'Test User',
      'test-reset-token-456'
    );

    if (resetResult.success) {
      console.log('✅ Password reset email sent successfully');
      console.log('📧 Message ID:', resetResult.messageId);
    } else {
      console.log('❌ Failed to send password reset email');
      console.log('🔍 Reason:', resetResult.error);
    }
  } catch (error) {
    console.log('❌ Error testing password reset email:', error.message);
  }

  console.log('\n🎯 Test completed');
  process.exit(0);
}

// Run the test
testSendEmail();
