const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const auth = async (req, res, next) => {
  try {
    console.log(' AUTH MIDDLEWARE STARTED ');
    console.log(' URL:', req.url);

    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log(' Token Present:', !!token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log(' JWT Decoded:', decoded);

    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    let user = null;

    // Role-based lookup (NO USER MODEL)
    if (decoded.role === "doctor") {
      console.log(' Searching Doctor collection...');
      user = await Doctor.findById(decoded.id);
    } 
    else if (decoded.role === "patient") {
      console.log(' Searching Patient collection...');
      user = await Patient.findById(decoded.id);
    } 
    else {
      return res.status(401).json({ success: false, message: "Invalid role in token" });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found."
      });
    }

    // Attach user to req
    req.user = {
      userId: user._id,
      role: user.role,
      email: user.email
    };

    console.log(` AUTH SUCCESS → ${user.email} (${user.role})`);
    next();

  } catch (error) {
    console.log(' AUTH MIDDLEWARE ERROR:', error.message);

    if (error.name === "JsonWebTokenError")
      return res.status(401).json({ success: false, message: "Invalid token." });

    if (error.name === "TokenExpiredError")
      return res.status(401).json({ success: false, message: "Token expired." });

    return res.status(401).json({ success: false, message: "Authentication failed." });
  }
};

module.exports = auth;
