// middleware/adminAuth.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // ✅ ROLE CHECK (VERY IMPORTANT)
    if (!["admin", "super_admin"].includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: "Admin access only"
      });
    }

    // Check admin exists
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found"
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is deactivated"
      });
    }

    // Attach admin info
    req.admin = {
      adminId: admin._id,
      email: admin.email,
      role: admin.role,
      name: admin.name
    };

    next();
  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

module.exports = adminAuth;
