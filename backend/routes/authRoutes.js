const express = require('express');
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  completeSignup,
  login
} = require('../controllers/authController');

// @desc    Send OTP for signup/login
// @route   POST /api/auth/send-otp
// @access  Public
router.post('/send-otp', sendOTP);

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', verifyOTP);

// @desc    Complete signup with name and role
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', completeSignup);

// @desc    Login existing user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', login);

module.exports = router;