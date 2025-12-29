
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const LabStaff = require('../models/LabStaff');
const Admin = require("../models/Admin");
const { sendOTPEmail } = require('../utils/sendEmail');
const { generateToken } = require('../utils/generateToken');
const { removeListener } = require('../models/Category');

// sign up only for patient
const sendOTPSignup = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log("Generated OTP:", otp);
    req.session.pendingUser = {
      email,
      otp: String(otp),
      role: 'patient',
      createdAt: Date.now(),
      isSignup: true,
    };

    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log("Session saved. Sending email...");
    await sendOTPEmail(email, otp);
    
    console.log("Email sent successfully");

    return res.status(200).json({
      success: true,
      message: "OTP sent to email"
    });

  } catch (error) {
    console.error("Signup OTP Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
};

//login doctor and patient
const sendOTPLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

          let user = await Admin.findOne({ email: email.toLowerCase(), isActive: true });
      let role;

      if (user) role = "admin";
      else if (user = await Patient.findOne({ email: email.toLowerCase() })) role = "patient";
      else if (user = await Doctor.findOne({ email: email.toLowerCase() })) role = "doctor";
      else if (user = await LabStaff.findOne({ email: email.toLowerCase() })) role = "labstaff";
      else {
        return res.status(404).json({
          success: false,
          message: "Email not authorized"
        });
      }



    const otp = user.generateOTP();
    await user.save();

    await sendOTPEmail(email, otp);

    console.log("Login OTP:", otp);
    req.session.pendingUser = {
      email,
      role,
      otp: String(otp),
      isSignup: false,
      createdAt: Date.now()
    };
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error("Session save error:", saveErr);
        return res.status(500).json({ 
          success: false, 
          message: "Session error" 
        });
      }

      console.log("Login session saved:", req.session.pendingUser);
      
      res.json({ 
        success: true, 
        message: "OTP sent successfully", 
        email, 
        role 
      });
    });

  } catch (error) {
    console.error("Login OTP Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
 
    console.log(typeof(otp));
    
    console.log("=== VERIFY OTP DEBUG ===");
    console.log("Request body:", req.body);
    console.log("Session ID:", req.sessionID);
    console.log("Full session:", req.session);
    console.log("Pending user:", req.session?.pendingUser);
    console.log("========================");

    if (!email || !otp) {
      console.log("Missing email or OTP");
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const sessionUser = req.session?.pendingUser;
    
    if (!sessionUser) {
      console.log("No session user found");
      return res.status(400).json({
        success: false,
        message: "OTP session expired or not found"
      });
    }

    // Convert both to strings for comparison
    const sessionOtp = String(sessionUser.otp);
    const requestOtp = String(otp);
    
    console.log("Comparing - Session OTP:", sessionOtp, "Request OTP:", requestOtp);
    console.log("Comparing - Session Email:", sessionUser.email, "Request Email:", email);
    
    if (sessionUser.email !== email || !sessionUser.otp || sessionOtp !== requestOtp) {
      console.log("OTP or email mismatch");
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or email mismatch"
      });
    }

    console.log("OTP validation passed");
    const role = sessionUser.role;
    console.log("User role:", role);
    let user;
    console.log("Starting database lookup...");
    
    try {
            if (role === "admin") {
        user = await Admin.findOne({ email });
      }
      else if (role === "patient") {
        user = await Patient.findOne({ email });
      }
      else if (role === "doctor") {
        user = await Doctor.findOne({ email });
      }
      else if (role === "labstaff") {
        user = await LabStaff.findOne({ email });
      }

    } catch (dbError) {
      console.error("Database lookup error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Database error during lookup"
      });
    }

    console.log("Database lookup completed");

    if (!user && !sessionUser.isSignup) {
    
      console.log("User not found for login");
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("Checking if it's signup flow:", sessionUser.isSignup);

    // ------------ SIGNUP FLOW ------------
    if (sessionUser.isSignup) {
      console.log("Processing signup flow");
      req.session.pendingUser.otpVerified = true;
      
      // SAVE THE SESSION WITH OTP VERIFIED
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Session save error:", saveErr);
          return res.status(500).json({
            success: false,
            message: "Session save failed"
          });
        }
        
        console.log("Session saved with otpVerified=true");
        return res.json({
          success: true,
          message: "Signup OTP verified successfully",
          requiresProfileCompletion: true
        });
      });
      return;
    }

    // ------------ LOGIN FLOW ------------
    console.log("Processing login flow");
    
    if (!user.verifyOTP) {
      console.error("User model missing verifyOTP method");
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    console.log("Verifying OTP with user model...");
    if (!user.verifyOTP(otp)) {
      console.log("User model OTP verification failed");
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    console.log("Clearing OTP from user...");
    if (user.clearOTP) {
      user.clearOTP();
      await user.save();
      console.log("User OTP cleared and saved");
    }

    console.log("Generating token...");
    const token = generateToken({ id: user._id, email, role });
    console.log("Token generated");

    return res.json({
      success: true,
      message: "Login successful",
      token,
      role,
      user: {
        _id: user._id,
        email: user.email,
        role: role,
        name: user.name
      }
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// 4. COMPLETE SIGNUP (PATIENT)

const completeSignup = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // ✅ Correct session and OTP check
    if (!req.session.pendingUser || !req.session.pendingUser.otpVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP verification required first."
      });
    }

    const { email } = req.session.pendingUser;

    // ✅ Correct: A new patient is created during profile completion
    const patient = await Patient.create({
      email,
      name,
      phone
    });

    // ✅ Correct JWT token creation
    const token = generateToken({
      id: patient._id,
      email: patient.email,
      role: "patient"
    });

    // ✅ Clear session to avoid reuse
    delete req.session.pendingUser;

    return res.json({
      success: true,
      message: "Signup completed successfully",
      token,
      user: patient
    });

  } catch (error) {
    console.error("Complete Signup Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const { userId, role } = req.user;
    console.log(userId, role);

    if (!userId || !role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let user;

    if (role === "patient") {
      user = await Patient.findById(userId);
    } else if (role === "doctor") {
      user = await Doctor.findById(userId);
    } else if (role === "labstaff") {
      user = await LabStaff.findById(userId);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      users :{
        id : user._id,
        name : user.name
      },
      message: "User found",
    });

  } catch (error) {
    console.error("Get Current User Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
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
