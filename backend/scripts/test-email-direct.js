// scripts/test-email-direct.js
const sgMail = require('@sendgrid/mail');

async function testSendGridDirect() {
  console.log('🔍 Direct SendGrid API Test\n');
  
  // Check environment
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  
  console.log('📋 Configuration:');
  console.log('   API Key present:', !!apiKey);
  console.log('   API Key starts with:', apiKey?.substring(0, 8) + '...');
  console.log('   From Email:', fromEmail || '❌ Not set');
  
  if (!apiKey || apiKey.includes('your_')) {
    console.log('\n⚠️  API key not configured. Please set SENDGRID_API_KEY in .env');
    console.log('   Example: SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    return;
  }
  
  if (!fromEmail) {
    console.log('\n⚠️  From email not configured. Please set EMAIL_FROM in .env');
    console.log('   Example: EMAIL_FROM=noreply@caremitra.com');
    return;
  }
  
  // Configure SendGrid
  sgMail.setApiKey(apiKey);
  
  // Create test message
  const msg = {
    to: 'test@example.com',  // Change to your test email
    from: fromEmail,
    subject: 'SendGrid Test from CareMitra',
    text: 'This is a test email from CareMitra backend.',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">✅ SendGrid Test Successful!</h2>
        <p>If you're reading this, SendGrid is properly configured.</p>
        <p><strong>Server:</strong> CareMitra Backend</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="color: #64748b; font-size: 12px;">
          This is a test email. Please ignore if received in error.
        </p>
      </div>
    `
  };
  
  console.log('\n📤 Sending test email...');
  console.log('   From:', fromEmail);
  console.log('   To:', msg.to);
  
  try {
    const response = await sgMail.send(msg);
    console.log('\n✅ Email sent successfully!');
    console.log('📊 Response:');
    console.log('   Status Code:', response[0].statusCode);
    console.log('   Headers:', JSON.stringify(response[0].headers, null, 2));
    
  } catch (error) {
    console.error('\n❌ SendGrid error:', error.message);
    
    if (error.response) {
      console.error('Error details:', {
        status: error.response.statusCode,
        body: error.response.body,
        headers: error.response.headers
      });
      
      // Helpful error messages
      if (error.response.statusCode === 401) {
        console.log('\n💡 The API key is invalid. Please check:');
        console.log('   1. Is the API key correct?');
        console.log('   2. Has the API key been activated in SendGrid dashboard?');
        console.log('   3. Does the API key have "Mail Send" permissions?');
      } else if (error.response.statusCode === 403) {
        console.log('\n💡 The sender email is not verified:');
        console.log('   1. Go to SendGrid dashboard → Settings → Sender Authentication');
        console.log('   2. Verify your sender email address');
        console.log('   3. Or use a verified domain');
      }
    }
  }
}

// Run the test
testSendGridDirect().catch(console.error);