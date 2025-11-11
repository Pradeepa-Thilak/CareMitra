// const express = require('express');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const admin = require('firebase-admin');
// const User = require('../models/User');

// const router = express.Router();

// // Initialize Firebase Admin
// let firebaseInitialized = false;
// try {
//   if (process.env.FIREBASE_CREDENTIALS_PATH) {
//     const serviceAccount = require(process.env.FIREBASE_CREDENTIALS_PATH);
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount)
//     });
//     firebaseInitialized = true;
//     console.log('✅ Firebase Admin initialized');
//   }
// } catch (error) {
//   console.error('❌ Firebase initialization error:', error.message);
//   console.log('ℹ️  SMS OTP will be simulated');
// }

// // Email transporter configuration
// let transporter;
// try {
//   transporter = nodemailer.createTransporter({
//     service: process.env.EMAIL_SERVICE || 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   });
//   console.log('✅ Email transporter configured');
// } catch (error) {
//   console.error('❌ Email transporter error:', error.message);
// }

// // Store OTPs and temporary data (in production, use Redis)
// const otpStore = new Map();

// // Generate random 6-digit OTP
// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // Send OTP via SMS (Firebase)
// const sendSMSOTP = async (phoneNumber, otp) => {
//   try {
//     console.log(`📱 OTP ${otp} sent via SMS to: ${phoneNumber}`);
    
//     // Simulate SMS delay
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         console.log(`✅ SMS simulation complete for ${phoneNumber}`);
//         resolve(true);
//       }, 1000);
//     });
//   } catch (error) {
//     console.error('Error sending SMS OTP:', error);
//     return false;
//   }
// };

// // Send OTP via Email
// const sendEmailOTP = async (email, otp) => {
//   try {
//     if (!transporter) {
//       console.log(`📧 OTP ${otp} would be sent to email: ${email} (transporter not configured)`);
//       return true; // Simulate success for testing
//     }

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Your OTP Code',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
//           <h2 style="color: #333;">OTP Verification</h2>
//           <p>Your One-Time Password (OTP) for authentication is:</p>
//           <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
//             ${otp}
//           </div>
//           <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
//           <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//           <p style="color: #666; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
//         </div>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`✅ OTP ${otp} sent to email: ${email}`);
//     return true;
//   } catch (error) {
//     console.error('❌ Error sending OTP email:', error);
//     return false;
//   }
// };

// // Verify OTP
// const verifyOTP = (identifier, userOTP) => {
//   const storedOTP = otpStore.get(identifier);
  
//   if (!storedOTP) {
//     console.log(`❌ No OTP found for: ${identifier}`);
//     return false;
//   }
  
//   // OTP expires after 5 minutes
//   if (Date.now() - storedOTP.timestamp > 5 * 60 * 1000) {
//     otpStore.delete(identifier);
//     console.log(`❌ OTP expired for: ${identifier}`);
//     return false;
//   }
  
//   if (storedOTP.otp === userOTP) {
//     console.log(`✅ OTP verified for: ${identifier}`);
//     return true;
//   }
  
//   console.log(`❌ Invalid OTP for: ${identifier}`);
//   return false;
// };

// // Generate JWT token
// const generateToken = (userId) => {
//   return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
// };

// // Check if input is email
// const isEmail = (input) => {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(input);
// };

// // Check if input is mobile number
// const isMobile = (input) => {
//   const mobileRegex = /^[0-9]{10}$/;
//   return mobileRegex.test(input);
// };

// // SIGNUP FLOW

// // Step 1: Send OTP to mobile via SMS
// router.post('/signup/send-otp', async (req, res) => {
//   try {
//     console.log('📨 Signup OTP request:', req.body);
    
//     const { mobile } = req.body;
    
//     if (!mobile) {
//       return res.status(400).json({
//         success: false,
//         message: 'Mobile number is required'
//       });
//     }
    
//     // Basic mobile validation
//     if (!isMobile(mobile)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid mobile number format (10 digits required)'
//       });
//     }
    
//     // Check if mobile already exists
//     const existingUser = await User.findOne({ mobile });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists with this mobile number'
//       });
//     }
    
//     const otp = generateOTP();
//     console.log(`🔐 Generated OTP for ${mobile}: ${otp}`);
    
//     const otpSent = await sendSMSOTP(mobile, otp);
    
//     if (!otpSent) {
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to send OTP via SMS'
//       });
//     }
    
//     // Store OTP with mobile as identifier - FIXED: Actually store the OTP
//     otpStore.set(mobile, {
//       otp: otp, // This was missing!
//       timestamp: Date.now(),
//       step: 'signup_verify_mobile'
//     });
    
//     console.log(`✅ OTP stored for ${mobile}`);
    
//     res.json({
//       success: true,
//       message: 'OTP sent successfully via SMS to your mobile',
//       debug_otp: otp // Remove this in production
//     });
    
//   } catch (error) {
//     console.error('❌ Signup send OTP error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Step 2: Verify mobile OTP and proceed to email collection
// router.post('/signup/verify-mobile', async (req, res) => {
//   try {
//     console.log('📱 Verify mobile request:', req.body);
    
//     const { mobile, otp } = req.body;
    
//     if (!mobile || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: 'Mobile and OTP are required'
//       });
//     }
    
//     // Verify OTP
//     const isOTPValid = verifyOTP(mobile, otp);
//     if (!isOTPValid) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid OTP'
//       });
//     }
    
//     // Store temporary signup data for email collection - FIXED: Don't delete OTP yet
//     otpStore.set(mobile, {
//       mobile: mobile,
//       mobileVerified: true,
//       timestamp: Date.now(),
//       step: 'signup_collect_email'
//     });
    
//     console.log(`✅ Mobile verified: ${mobile}`);
    
//     res.json({
//       success: true,
//       message: 'Mobile verified successfully. Please provide email to complete signup.',
//       nextStep: 'collect_email'
//     });
    
//   } catch (error) {
//     console.error('❌ Signup verify mobile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Step 3: Collect email and complete user creation
// router.post('/signup/complete', async (req, res) => {
//   try {
//     console.log('📝 Complete signup request:', req.body);
    
//     const { mobile, email } = req.body;
    
//     if (!mobile || !email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Mobile and email are required'
//       });
//     }
    
//     // Check if we have verified mobile in previous step
//     const signupData = otpStore.get(mobile);
//     if (!signupData || signupData.step !== 'signup_collect_email') {
//       return res.status(400).json({
//         success: false,
//         message: 'Mobile verification required first. Please complete step 2.'
//       });
//     }
    
//     // Validate email format
//     if (!isEmail(email)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid email format'
//       });
//     }
    
//     // Check if email already exists
//     const existingEmail = await User.findOne({ email });
//     if (existingEmail) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already exists'
//       });
//     }
    
//     // Create new user
//     const user = new User({
//       mobile,
//       email
//     });
    
//     await user.save();
    
//     // Clean up temporary data
//     otpStore.delete(mobile);
    
//     const token = generateToken(user._id);
    
//     console.log(`✅ User created: ${email} with mobile: ${mobile}`);
    
//     res.json({
//       success: true,
//       message: 'Signup successful',
//       token,
//       user: {
//         id: user._id,
//         mobile: user.mobile,
//         email: user.email
//       }
//     });
    
//   } catch (error) {
//     console.error('❌ Signup complete error:', error);
    
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'User with this mobile or email already exists'
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // LOGIN FLOW

// // Send OTP based on input (email or mobile)
// router.post('/login/send-otp', async (req, res) => {
//   try {
//     console.log('📨 Login OTP request:', req.body);
    
//     const { emailOrMobile } = req.body;
    
//     if (!emailOrMobile) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email or mobile number is required'
//       });
//     }
    
//     let user;
//     let otpSent = false;
//     let identifier;
    
//     if (isEmail(emailOrMobile)) {
//       // Find user by email
//       user = await User.findOne({ email: emailOrMobile });
//       identifier = emailOrMobile;
      
//       if (user) {
//         const otp = generateOTP();
//         console.log(`🔐 Generated login OTP for ${emailOrMobile}: ${otp}`);
//         otpSent = await sendEmailOTP(emailOrMobile, otp);
        
//         // Store OTP for email
//         if (otpSent) {
//           otpStore.set(identifier, {
//             otp,
//             timestamp: Date.now()
//           });
//         }
//       }
//     } 
//     else if (isMobile(emailOrMobile)) {
//       // Find user by mobile
//       user = await User.findOne({ mobile: emailOrMobile });
//       identifier = emailOrMobile;
      
//       if (user) {
//         const otp = generateOTP();
//         console.log(`🔐 Generated login OTP for ${emailOrMobile}: ${otp}`);
//         otpSent = await sendSMSOTP(emailOrMobile, otp);
        
//         // Store OTP for mobile
//         if (otpSent) {
//           otpStore.set(identifier, {
//             otp,
//             timestamp: Date.now()
//           });
//         }
//       }
//     } 
//     else {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid email or mobile number format'
//       });
//     }
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }
    
//     if (!otpSent) {
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to send OTP'
//       });
//     }
    
//     const message = isEmail(emailOrMobile) 
//       ? 'OTP sent successfully to your email' 
//       : 'OTP sent successfully via SMS to your mobile';
    
//     console.log(`✅ Login OTP sent to: ${emailOrMobile}`);
    
//     res.json({
//       success: true,
//       message: message,
//       type: isEmail(emailOrMobile) ? 'email' : 'sms',
//       debug_otp: otpSent ? 'Check console for OTP' : undefined // Remove in production
//     });
    
//   } catch (error) {
//     console.error('❌ Login send OTP error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Login - Verify OTP
// router.post('/login/verify', async (req, res) => {
//   try {
//     console.log('🔐 Login verify request:', req.body);
    
//     const { emailOrMobile, otp } = req.body;
    
//     if (!emailOrMobile || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email/mobile and OTP are required'
//       });
//     }
    
//     // Find user by email or mobile
//     const user = await User.findOne({
//       $or: [
//         { email: emailOrMobile },
//         { mobile: emailOrMobile }
//       ]
//     });
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }
    
//     // Verify OTP using the provided identifier
//     const isOTPValid = verifyOTP(emailOrMobile, otp);
//     if (!isOTPValid) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid OTP'
//       });
//     }
    
//     // Clean OTP after verification
//     otpStore.delete(emailOrMobile);
    
//     const token = generateToken(user._id);
    
//     console.log(`✅ Login successful for: ${emailOrMobile}`);
    
//     res.json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         mobile: user.mobile
//       }
//     });
    
//   } catch (error) {
//     console.error('❌ Login verify error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Home route (protected)
// router.get('/home', async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       message: 'Welcome to home page'
//     });
//   } catch (error) {
//     console.error('Home route error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Debug route to check OTP store
// router.get('/debug/otp-store', (req, res) => {
//   const storeData = {};
//   otpStore.forEach((value, key) => {
//     storeData[key] = value;
//   });
  
//   res.json({
//     success: true,
//     otpStore: storeData,
//     size: otpStore.size
//   });
// });

// module.exports = router;

/////////////////////////////////////////////////////////////////////////////////

const express = require('express');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/User');

const router = express.Router();

// Initialize Firebase Admin
let firebaseInitialized = false;
try {
  const serviceAccount = require('../firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
  firebaseInitialized = true;
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
}

// Store session info for email collection (NO OTP storage)
const sessionStore = new Map();

// SIGNUP FLOW

// Step 1: Validate mobile and return phone number for frontend
router.post('/signup/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }
    
    // Validate mobile format
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number (10 digits required)'
      });
    }
    
    // Check if mobile already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this mobile number'
      });
    }
    
    const phoneNumber = `+91${mobile}`;
    
    // Store session for email collection later
    sessionStore.set(mobile, {
      mobile: mobile,
      phoneNumber: phoneNumber,
      timestamp: Date.now(),
      step: 'signup_sent_otp'
    });
    
    console.log(`📱 Firebase OTP ready for: ${phoneNumber}`);
    
    res.json({
      success: true,
      message: 'Mobile validated. Use Firebase Client SDK to send OTP.',
      phoneNumber: phoneNumber,
      note: 'Call signInWithPhoneNumber() on frontend with this phone number'
    });
    
  } catch (error) {
    console.error('❌ Signup send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Step 2: Verify Firebase OTP token (NOT OTP code)
router.post('/signup/verify-mobile', async (req, res) => {
  try {
    const { mobile, idToken } = req.body; // idToken from Firebase frontend
    
    if (!mobile || !idToken) {
      return res.status(400).json({
        success: false,
        message: 'Mobile and Firebase ID token are required'
      });
    }
    
    if (!firebaseInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Firebase service not available'
      });
    }
    
    // Verify the Firebase ID token
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const firebasePhone = decodedToken.phone_number;
      
      // Verify that the phone number matches
      const expectedPhone = `+91${mobile}`;
      if (firebasePhone !== expectedPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number mismatch'
        });
      }
      
      console.log(`✅ Firebase OTP verified for: ${firebasePhone}`);
      
      // Store verified mobile for email collection
      sessionStore.set(mobile, {
        mobile: mobile,
        mobileVerified: true,
        firebaseUID: decodedToken.uid,
        timestamp: Date.now(),
        step: 'signup_collect_email'
      });
      
      res.json({
        success: true,
        message: 'Mobile verified successfully with Firebase OTP',
        nextStep: 'collect_email',
        firebaseUID: decodedToken.uid
      });
      
    } catch (firebaseError) {
      console.error('❌ Firebase token verification failed:', firebaseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
  } catch (error) {
    console.error('❌ Signup verify mobile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Step 3: Complete signup with email
router.post('/signup/complete', async (req, res) => {
  try {
    const { mobile, email, firebaseUID } = req.body;
    
    if (!mobile || !email) {
      return res.status(400).json({
        success: false,
        message: 'Mobile and email are required'
      });
    }
    
    // Check if mobile was verified
    const sessionData = sessionStore.get(mobile);
    if (!sessionData || !sessionData.mobileVerified) {
      return res.status(400).json({
        success: false,
        message: 'Mobile verification required first'
      });
    }
    
    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    // Check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Create user in MongoDB
    const user = new User({
      mobile,
      email,
      firebaseUID: firebaseUID || sessionData.firebaseUID
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        mobile: user.mobile,
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    // Clean up session
    sessionStore.delete(mobile);
    
    console.log(`✅ User created: ${email} (${mobile})`);
    
    res.json({
      success: true,
      message: 'Signup successful!',
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        email: user.email,
        firebaseUID: user.firebaseUID
      }
    });
    
  } catch (error) {
    console.error('❌ Signup complete error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this mobile or email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// LOGIN FLOW

// Send OTP for login - Return user's phone number for frontend
router.post('/login/send-otp', async (req, res) => {
  try {
    const { emailOrMobile } = req.body;
    
    if (!emailOrMobile) {
      return res.status(400).json({
        success: false,
        message: 'Email or mobile number is required'
      });
    }
    
    let user;
    let phoneNumber;
    
    // Find user by email or mobile
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrMobile)) {
      // Input is email
      user = await User.findOne({ email: emailOrMobile });
      if (user) {
        phoneNumber = `+91${user.mobile}`;
      }
    } else if (/^[0-9]{10}$/.test(emailOrMobile)) {
      // Input is mobile
      user = await User.findOne({ mobile: emailOrMobile });
      if (user) {
        phoneNumber = `+91${user.mobile}`;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or mobile number format'
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`📱 Firebase OTP ready for login: ${phoneNumber}`);
    
    res.json({
      success: true,
      message: 'User found. Use Firebase Client SDK to send OTP.',
      phoneNumber: phoneNumber,
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile
      }
    });
    
  } catch (error) {
    console.error('❌ Login send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify login OTP with Firebase token
router.post('/login/verify', async (req, res) => {
  try {
    const { emailOrMobile, idToken } = req.body; // idToken from Firebase frontend
    
    if (!emailOrMobile || !idToken) {
      return res.status(400).json({
        success: false,
        message: 'Email/mobile and Firebase ID token are required'
      });
    }
    
    if (!firebaseInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Firebase service not available'
      });
    }
    
    // Find user
    const user = await User.findOne({
      $or: [
        { email: emailOrMobile },
        { mobile: emailOrMobile }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify Firebase ID token
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const firebasePhone = decodedToken.phone_number;
      const expectedPhone = `+91${user.mobile}`;
      
      if (firebasePhone !== expectedPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number verification failed'
        });
      }
      
      console.log(`✅ Login successful for: ${user.email}`);
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id,
          mobile: user.mobile,
          email: user.email 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user._id,
          mobile: user.mobile,
          email: user.email
        }
      });
      
    } catch (firebaseError) {
      console.error('❌ Firebase token verification failed:', firebaseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
  } catch (error) {
    console.error('❌ Login verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Check session store (for debugging)
router.get('/debug/session-store', (req, res) => {
  const store = {};
  sessionStore.forEach((value, key) => {
    store[key] = value;
  });
  
  res.json({
    success: true,
    sessionStore: store,
    totalEntries: sessionStore.size,
    firebaseInitialized: firebaseInitialized
  });
});

module.exports = router;