const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const LabStaff = require("../models/LabStaff");

const auth = async (req, res, next) => {
  try {
    console.log(" AUTH MIDDLEWARE STARTED ");
    console.log(" URL:", req.url);

    const authHeader = req.headers.authorization;
    console.log(" RAW AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing or malformed",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log(" Token extracted:", token);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    console.log(" JWT Decoded:", decoded);

    if (!decoded?.id || !decoded?.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    let user;

    if (decoded.role === "doctor") {
      user = await Doctor.findById(decoded.id);
    } else if (decoded.role === "patient") {
      user = await Patient.findById(decoded.id);
    } else if (decoded.role === "labstaff") {
      user = await LabStaff.findById(decoded.id);
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid role in token",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    // console.log(user);
    
    req.user = {
      userId: user._id,
      role: user.role,
      email: user.email,
    };

    console.log(` AUTH SUCCESS → ${user.email} (${user.role})`);
    next();

  } catch (error) {
    console.error(" AUTH MIDDLEWARE ERROR:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

module.exports = auth;
