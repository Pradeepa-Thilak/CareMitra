const sgMail = require('@sendgrid/mail');

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOTPEmail = async (email, otp) => {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Your CareMitra OTP Code',
      text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">CareMitra OTP Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="font-size: 32px; color: #2563eb; letter-spacing: 5px; margin: 20px 0;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">CareMitra Healthcare System</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    return false;
  }
};

module.exports = { sendOTPEmail };