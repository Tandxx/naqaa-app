// test-send-email.js - Test sending email
require('dotenv').config();
const emailService = require('./services/emailService');

async function testSendEmail() {
  console.log('🧪 Testing email sending...');
  
  // Test verification email
  console.log('📧 Testing verification email...');
  try {
    const verificationResult = await emailService.sendVerificationEmail(
      'narfi7.a@gmail.com',  // Replace with your real email for testing
      'Test User',
      'test-verification-token-123'
    );
    
    if (verificationResult.success) {
      console.log('✅ Verification email sent successfully');
      console.log('📧 Message ID:', verificationResult.messageId);
    } else {
      console.log('❌ Failed to send verification email');
      console.log('🔍 Reason:', verificationResult.error);
    }
  } catch (error) {
    console.log('❌ Error testing verification email:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('\n🎯 Test completed');
  process.exit(0);
}

// Run the test
testSendEmail();
