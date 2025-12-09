// scripts/test-email-standalone.js
require('dotenv').config();
const { sendGeneralEmail } = require('../utils/sendEmail');

async function testSendGridConnection() {
  console.log('🔍 Testing SendGrid configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment check:');
  console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('   SENDGRID_API_KEY length:', process.env.SENDGRID_API_KEY?.length || 0);
  console.log('   EMAIL_FROM:', process.env.EMAIL_FROM || '❌ Not set');
  console.log('   ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '⚠️  Not set (optional)');
  
  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.includes('your_')) {
    console.log('\n⚠️  SendGrid API key not configured or using placeholder');
    console.log('   Running in development mode - emails will be logged but not sent\n');
  }
  
  return true;
}

async function testEmailTemplates() {
  console.log('\n🎨 Testing email templates...\n');
  
  const testEmails = [
    {
      name: 'Lab Test Order Confirmation',
      email: 'patient@example.com',
      subject: '✅ Lab Test Order Confirmation - #ABC12345',
      html: `
        <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
          <h2 style="color:#059669;">🩺 Test Email: Lab Test Order Confirmed</h2>
          <p>This is a test email for lab test order confirmation.</p>
          <p><strong>Order ID:</strong> TEST-12345</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <p>If you can read this, SendGrid is working correctly!</p>
        </div>
      `
    },
    {
      name: 'Staff Assignment',
      email: 'staff@example.com',
      subject: '📋 Test: New Lab Order Assignment',
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2 style="color:#3b82f6;">👨‍⚕️ Test Email: Staff Assignment</h2>
          <p>This is a test email for staff assignment notification.</p>
          <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    },
    {
      name: 'Assignment Failed',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: '⚠️ Test: Assignment Failed Alert',
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2 style="color:#dc2626;">🚨 Test Email: Assignment Failed</h2>
          <p>This is a test email for assignment failure notification.</p>
          <p><strong>Alert Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    }
  ];
  
  const results = [];
  
  for (const test of testEmails) {
    console.log(`📧 Testing: ${test.name}`);
    console.log(`   To: ${test.email}`);
    
    try {
      const result = await sendGeneralEmail(test.email, test.subject, test.html);
      
      if (result.success) {
        console.log('   ✅ SUCCESS');
        if (result.development) {
          console.log('   📝 Running in development mode');
          console.log('   📤 Email would be sent to:', test.email);
        } else {
          console.log('   📤 Email sent via SendGrid');
          console.log('   📊 Status:', result.statusCode);
        }
      } else {
        console.log('   ❌ FAILED:', result.error);
      }
      
      results.push({
        test: test.name,
        success: result.success,
        details: result
      });
      
    } catch (error) {
      console.log('   ❌ ERROR:', error.message);
      results.push({
        test: test.name,
        success: false,
        error: error.message
      });
    }
    
    console.log();
  }
  
  return results;
}

async function testAll() {
  console.log('🚀 Starting comprehensive email test\n');
  
  // Test 1: SendGrid configuration
  await testSendGridConnection();
  
  // Test 2: Email templates
  const results = await testEmailTemplates();
  
  // Summary
  console.log('📊 Test Summary:');
  console.log('='.repeat(40));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n🔍 Failed tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.test}: ${r.error || 'Unknown error'}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.includes('your_')) {
    console.log('   1. Set SENDGRID_API_KEY in .env file');
    console.log('   2. Get API key from https://app.sendgrid.com/settings/api_keys');
    console.log('   3. Verify sender email in SendGrid dashboard');
  }
  
  if (!process.env.EMAIL_FROM) {
    console.log('   4. Set EMAIL_FROM in .env (e.g., noreply@caremitra.com)');
  }
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Email system is ready.');
  }
}

// Run tests
testAll().catch(console.error);