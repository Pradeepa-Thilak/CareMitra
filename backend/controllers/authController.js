// NO USER SCHEMA USED NOW
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const LabStaff = require('../models/LabStaff');
// const LabTechnician = require('../models/LabTechnician');

const { sendOTPEmail } = require('../utils/sendEmail');
const { generateToken } = require('../utils/generateToken');


// -----------------------------
// 1. PATIENT SIGNUP (EMAIL ONLY)
// -----------------------------
const sendOTPSignup = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    console.log("Signup OTP requested for:", email);
    console.log("Session ID:", req.sessionID);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log("Generated OTP:", otp);

    // Store in session
    req.session.pendingUser = {
      email,
      otp: String(otp),
      role: 'patient',
      createdAt: Date.now(),
      isSignup: true,
    };

    // Save session to store
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log("Session saved. Sending email...");

    // Send OTP email
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

// ----------------------------------------
// 2. LOGIN - AUTO ROLE DETECTION (EMAIL ONLY)
// ----------------------------------------
const sendOTPLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Auto detect user role by email
    let user = await Patient.findOne({ email });
    let role = "patient";

    if (!user) {
      user = await Doctor.findOne({ email });
      if (user) role = "doctor";
    }

    if (!user) {
      user = await LabStaff.findOne({ email });
      if (user) role = "labstaff";
    }

    // if (!user) {
    //   user = await LabTechnician.findOne({ email });
    //   if (user) role = "labtechnician";
    // }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found. Please signup if new."
      });
    }

    const otp = user.generateOTP();
    await user.save();

    await sendOTPEmail(email, otp);

    console.log("Login OTP:", otp);

    // Store in session
    req.session.pendingUser = {
      email,
      role,
      otp: String(otp), // Store as string
      isSignup: false,
      createdAt: Date.now()
    };

    // SAVE THE SESSION
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
// ---------------------------
// 3. VERIFY OTP (LOGIN/SIGNUP)
// ---------------------------
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

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

    // Get user by role - ADD AWAIT AND TIMEOUT
    let user;
    console.log("Starting database lookup...");
    
    try {
      if (role === "patient") {
        console.log("Looking for patient with email:", email);
        user = await Patient.findOne({ email });
        console.log("Patient found:", user ? "Yes" : "No");
      } else if (role === "doctor") {
        user = await Doctor.findOne({ email });
        console.log("Doctor found:", user ? "Yes" : "No");
      } else if (role === "labstaff") {
        user = await LabStaff.findOne({ email });
        console.log("LabStaff found:", user ? "Yes" : "No");
      } else if (role === "labtechnician") {
        user = await LabTechnician.findOne({ email });
        console.log("LabTechnician found:", user ? "Yes" : "No");
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
      // Login OTP requires existing user
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
      return; // IMPORTANT: Return after async operation
    }

    // ------------ LOGIN FLOW ------------
    console.log("Processing login flow");
    
    // Check if user has verifyOTP method
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
      role
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------
// 4. COMPLETE SIGNUP (PATIENT)
// ---------------------------
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



module.exports = {
  sendOTPSignup,
  sendOTPLogin,
  verifyOTP,
  completeSignup
};
