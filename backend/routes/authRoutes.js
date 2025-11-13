const express = require('express');
const router = express.Router();
const {
  sendOTPSignup,
  sendOTPLogin,
  verifyOTP,
  completeSignup,
  getCurrentUser
} = require('../controllers/authController');
const auth = require('../middleware/auth');

console.log('🔧 Auth routes loading...');

// Public routes
router.post('/send-otp/signup', sendOTPSignup);
router.post('/send-otp/login', sendOTPLogin);
router.post('/verify-otp', verifyOTP);
router.post('/complete-signup', completeSignup);

// Protected route
router.get('/me', auth, getCurrentUser);

// Debug route to test if auth routes work
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes are working!',
    availableEndpoints: [
      'POST /send-otp/signup',
      'POST /send-otp/login', 
      'POST /verify-otp',
      'POST /complete-signup',
      'GET /me'
    ]
  });
});

console.log('✅ Auth routes loaded:', router.stack.map(layer => {
  return `${Object.keys(layer.route?.methods || {})[0]?.toUpperCase()} ${layer.route?.path}`;
}));

module.exports = router;