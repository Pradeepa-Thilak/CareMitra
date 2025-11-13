const sgMail = require('@sendgrid/mail');

const sendOTPEmail = async (email, otp) => {
  console.log('🔧 Starting email send process...');
  console.log('📋 Environment check:');
  console.log('   - SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
  console.log('   - SENDGRID_API_KEY length:', process.env.SENDGRID_API_KEY?.length);
  console.log('   - FROM_EMAIL exists:', !!process.env.EMAIL_FROM);
  console.log('   - FROM_EMAIL value:', process.env.EMAIL_FROM);

  // Check if SendGrid API key is set and valid
  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
    console.log('❌ SendGrid API key not configured or using placeholder');
    console.log('🔐 OTP for development:', otp);
    return { 
      success: false, 
      error: 'SendGrid API key not configured',
      development: true 
    };
  }

  // Validate FROM_EMAIL
  if (!process.env.EMAIL_FROM) {
    console.log('❌ FROM_EMAIL not set');
    return { 
      success: false, 
      error: 'FROM_EMAIL environment variable is not set' 
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(process.env.EMAIL_FROM)) {
    console.log('❌ FROM_EMAIL format invalid:', process.env.EMAIL_FROM);
    return { 
      success: false, 
      error: 'EMAIL_FROM format is invalid' 
    };
  }

  // Set API key
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Your CareMitra Verification Code',
    text: `Your CareMitra OTP is ${otp}. It will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; text-align: center;">CareMitra</h2>
        <p>Hello,</p>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; color: #2563eb; letter-spacing: 8px; text-align: center; margin: 30px 0; padding: 15px; background: #f8fafc; border-radius: 8px;">
          ${otp}
        </h1>
        <p>This code will expire in <strong>5 minutes</strong>.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #64748b; font-size: 12px; text-align: center;">
          Thank you for choosing CareMitra - Your Healthcare Partner
        </p>
      </div>
    `,
  };

  try {
    console.log(`📧 Attempting to send email:`);
    console.log(`   To: ${email}`);
    console.log(`   From: ${process.env.EMAIL_FROM}`);
    console.log(`   OTP: ${otp}`);
    
    const result = await sgMail.send(msg);
    
    console.log('✅ Email sent successfully!');
    console.log(`   Status Code: ${result[0].statusCode}`);
    console.log(`   Headers:`, result[0].headers);
    
    return { 
      success: true, 
      statusCode: result[0].statusCode,
      messageId: result[0].headers['x-message-id']
    };
    
  } catch (error) {
    console.error('❌ SendGrid Error Details:');
    console.error('   Error Message:', error.message);
    console.error('   Error Code:', error.code);
    
    if (error.response) {
      console.error('   Response Body:', error.response.body);
      console.error('   Response Headers:', error.response.headers);
      console.error('   Status Code:', error.response.statusCode);
    }
    
    return { 
      success: false, 
      error: error.message,
      details: error.response?.body,
      statusCode: error.response?.statusCode
    };
  }
};

module.exports = { sendOTPEmail };