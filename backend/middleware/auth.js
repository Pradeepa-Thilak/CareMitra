// // middleware/auth.js
// const jwt = require('jsonwebtoken');
// const Doctor = require('../models/Doctor');
// const Patient = require('../models/Patient');
// const User = require('../models/User');

// const auth = async (req, res, next) => {
//   try {
//     console.log('🔐 Auth Middleware Started');
//     console.log('📋 Incoming Headers:', req.headers);

//     const token = req.header('Authorization')?.replace('Bearer ', '');
//     console.log('🔍 Extracted Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

//     if (!token) {
//       console.log('❌ Token Missing');
//       return res.status(401).json({
//         success: false,
//         message: 'Access denied. No token provided.'
//       });
//     }

//     // Verify JWT
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
//     console.log('✅ JWT Decoded:', decoded);

//     if (!decoded || !decoded.userId) {
//       return res.status(401).json({ success: false, message: 'Invalid token structure' });
//     }

//     // Select Model based on role
//     let Model;
//     switch (decoded.role) {
//       case "doctor":
//         Model = Doctor;
//         break;
//       case "patient":
//         Model = Patient;
//         break;
//       default:
//         Model = User;
//     }

//     console.log("📌 Using Model:", Model.modelName);

//     // Fetch user from database
//     const user = await Model.findById(decoded.userId).select('-otp -otpExpires');

//     if (!user) {
//       console.log('❌ User not found in database');
//       return res.status(401).json({ success: false, message: 'Invalid token. User not found.' });
//     }

//     // Attach verified user to request
//     req.user = {
//       userId: decoded.userId,
//       role: decoded.role,
//       email: decoded.email,
//       model: Model.modelName
//     };

//     console.log(`✅ Authentication Successful → ${req.user.email} (${req.user.role})`);
//     next();

//   } catch (error) {
//     console.log('❌ Auth Middleware Error:', error.message);

//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({ success: false, message: 'Invalid token.' });
//     }

//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ success: false, message: 'Token expired.' });
//     }

//     res.status(401).json({ success: false, message: 'Authentication failed.' });
//   }
// };

// module.exports = auth;

const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('\n=== 🔐 AUTH MIDDLEWARE STARTED ===');
    console.log('📋 URL:', req.url);

    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔍 Token Present:', !!token);

    if (!token) {
      console.log('❌ Token Missing');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ JWT Decoded Successfully:', decoded);

    if (!decoded || !decoded.userId) {
      console.log('❌ Invalid token structure - missing userId');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token structure' 
      });
    }

    console.log('🔍 Looking for user with ID:', decoded.userId);
    console.log('🔍 Role from token:', decoded.role);

    let user = null;
    let userModel = null;

    // 🔥 FIXED LOGIC: Check role-specific collections FIRST
    if (decoded.role === 'doctor') {
      user = await Doctor.findById(decoded.userId);
      userModel = 'Doctor';
      console.log('🔍 Checking Doctor collection first for doctor role');
    } else if (decoded.role === 'patient') {
      user = await Patient.findById(decoded.userId);
      userModel = 'Patient';
      console.log('🔍 Checking Patient collection first for patient role');
    }

    // If not found in role-specific collection, check User collection
    if (!user) {
      console.log('🔍 User not found in role-specific collection, checking User collection');
      user = await User.findById(decoded.userId);
      userModel = 'User';
    }

    // Final fallback - check all collections (for debugging)
    if (!user) {
      console.log('🔍 User not found in primary collections, checking all...');
      const userInUser = await User.findById(decoded.userId);
      const userInDoctor = await Doctor.findById(decoded.userId);
      const userInPatient = await Patient.findById(decoded.userId);

      console.log('📊 Database Check Results:');
      console.log('  - User collection:', userInUser ? `FOUND (${userInUser.email})` : 'NOT FOUND');
      console.log('  - Doctor collection:', userInDoctor ? `FOUND (${userInDoctor.email})` : 'NOT FOUND');
      console.log('  - Patient collection:', userInPatient ? `FOUND (${userInPatient.email})` : 'NOT FOUND');

      if (userInUser) {
        user = userInUser;
        userModel = 'User';
      } else if (userInDoctor) {
        user = userInDoctor;
        userModel = 'Doctor';
      } else if (userInPatient) {
        user = userInPatient;
        userModel = 'Patient';
      }
    }

    if (!user) {
      console.log('❌ USER NOT FOUND IN ANY COLLECTION');
      console.log('❌ Token userId:', decoded.userId);
      console.log('❌ Token role:', decoded.role);
      console.log('❌ Token email:', decoded.email);
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found in any collection.' 
      });
    }

    console.log(`✅ User found in ${userModel} collection:`, user.email);

    // Attach verified user to request
    req.user = {
      userId: user._id,
      role: user.role || decoded.role, // Use database role if available
      email: user.email,
      model: userModel
    };

    console.log(`✅ AUTH SUCCESS → ${req.user.email} (${req.user.role}) from ${userModel}`);
    console.log('=== 🔐 AUTH MIDDLEWARE COMPLETED ===\n');
    next();

  } catch (error) {
    console.log('❌ AUTH MIDDLEWARE ERROR:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }

    res.status(401).json({ success: false, message: 'Authentication failed.' });
  }
};

module.exports = auth;
