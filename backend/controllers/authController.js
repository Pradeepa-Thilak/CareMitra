const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { sendOTPEmail } = require('../utils/sendEmail');
const { generateOTP, setOTPExpiration } = require('../middleware/authMiddleware');

// Send OTP for signup/login
const sendOTP = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email and role are required'
      });
    }

    if (!['patient', 'doctor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either patient or doctor'
      });
    }

    const Model = role === 'patient' ? Patient : Doctor;
    
    // Check if user exists for login flow
    const existingUser = await Model.findOne({ email });
    
    const otp = generateOTP();
    const otpExpires = setOTPExpiration();

    if (existingUser) {
      // User exists - login flow
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
    } else {
      // User doesn't exist - signup flow (store only email, role, OTP)
      await Model.create({
        email,
        role,
        otp,
        otpExpires
      });
    }

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      isNewUser: !existingUser
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP and role are required'
      });
    }

    const Model = role === 'patient' ? Patient : Doctor;
    
    const user = await Model.findOne({ 
      email,
      otp,
      otpExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or OTP expired'
      });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isProfileComplete: !!user.name
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Complete signup with name
const completeSignup = async (req, res) => {
  try {
    const { email, name, role, specialist } = req.body;

    if (!email || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, name and role are required'
      });
    }

    const Model = role === 'patient' ? Patient : Doctor;
    
    const user = await Model.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please request OTP first.'
      });
    }

    if (user.name) {
      return res.status(400).json({
        success: false,
        message: 'Profile already completed'
      });
    }

    // Update user profile
    user.name = name;
    if (role === 'doctor' && specialist) {
      user.specialist = specialist;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Signup completed successfully',
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        specialist: user.specialist
      }
    });

  } catch (error) {
    console.error('Complete signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Login existing user
const login = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email and role are required'
      });
    }

    const Model = role === 'patient' ? Patient : Doctor;
    
    const user = await Model.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please sign up first.'
      });
    }

    if (!user.name) {
      return res.status(400).json({
        success: false,
        message: 'Profile not completed. Please complete signup.'
      });
    }

    // Generate and send OTP
    const otp = generateOTP();
    const otpExpires = setOTPExpiration();

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent for login'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  completeSignup,
  login
};