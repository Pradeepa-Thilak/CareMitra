const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { sendOTPEmail } = require('../utils/sendEmail');
const { generateToken } = require('../utils/generateToken');
// Send OTP for Signup
const sendOTPSignup = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists. Please login instead.'
      });
    }

    // Create new user for OTP
    const user = new User({ email });
    const otp = user.generateOTP();
    await user.save();

    console.log(`🔐 OTP ${otp} generated for ${email}`);

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);
    
    if (!emailResult.success) {
      // Delete the user record since email failed
      await User.deleteOne({ email });
      
      return res.status(500).json({
        success: false,
        message: emailResult.error || 'Failed to send OTP email. Please try again.'
      });
    }

    // Success response
    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      data: { email }
    });

  } catch (error) {
    console.error('Send OTP Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Send OTP for Login
const sendOTPLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please sign up first.'
      });
    }

    const otp = user.generateOTP();
    await user.save();

    console.log(`🔐 OTP ${otp} generated for ${email}`);

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: emailResult.error || 'Failed to send OTP email. Please try again.'
      });
    }

    // Success response
    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      data: { email }
    });

  } catch (error) {
    console.error('Send OTP Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Clear OTP after verification
    user.clearOTP();
    await user.save();

    // ✅ STORE USER IN SESSION - This is the key part!
    req.session.pendingUser = {
      email: user.email,
      userId: user._id.toString()
    };

    console.log('✅ Session created for user:', user.email);
    console.log('📋 Session ID:', req.sessionID);
    
    // Check if user has completed signup
    if (user.name && user.role) {
      const token = generateToken({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            email: user.email,
            role: user.role,
            name: user.name
          },
          token,
          signupCompleted: true
        }
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        signupCompleted: false,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const completeSignup = async (req, res) => {
  try {
    const { name, role, specialist } = req.body;

    // Only validate name and role
    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name and role are required'
      });
    }

    if (!['doctor', 'patient'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either doctor or patient'
      });
    }

    // Get user email from session
    if (!req.session.pendingUser || !req.session.pendingUser.email) {
      return res.status(400).json({
        success: false,
        message: 'Please verify OTP first before completing signup'
      });
    }

    const userEmail = req.session.pendingUser.email;

    // Find user by email from session
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please verify OTP first.'
      });
    }

    // Update user details
    user.name = name;
    user.role = role;
    await user.save();

    let roleSpecificDoc;

    // Create role-specific document
    if (role === 'doctor') {
      roleSpecificDoc = new Doctor({
        email: userEmail,
        name,
        role,
        specialist: specialist || null
      });
      await roleSpecificDoc.save();
    } else {
      roleSpecificDoc = new Patient({
        email: userEmail,
        name,
        role
      });
      await roleSpecificDoc.save();
    }

    // Clear the pending user session
    delete req.session.pendingUser;

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Signup completed successfully',
      data: {
        user: {
          email: user.email,
          role: user.role,
          name: user.name
        },
        token
      }
    });

  } catch (error) {
    console.error('Complete signup error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists in role-specific collection'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during signup completion'
    });
  }
};
// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-otp -otpExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          email: user.email,
          role: user.role,
          name: user.name
        }
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  sendOTPSignup,
  sendOTPLogin,
  verifyOTP,
  completeSignup,
  getCurrentUser
};