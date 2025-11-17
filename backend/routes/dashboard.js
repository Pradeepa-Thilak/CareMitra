const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const  auth  = require('../middleware/auth');
const User = require('../models/User');

// Apply authentication to all dashboard routes
router.use(auth);

// 1. View Profile
router.get("/viewProfile", async (req, res) => {
  try {
    const { userId, role } = req.user;
    
    console.log(`🔍 Looking for profile: ${userId} (${role})`);
    
    let profile = null;
    let source = '';
    
    // Strategy: Check User collection first (auth source)
    profile = await User.findById(userId).select("-otp -otpExpires");
    if (profile) {
      source = 'User';
      console.log(`✅ Profile found in User collection: ${profile.email}`);
    } else {
      // Fallback: Check role-specific collection
      const Model = role === "doctor" ? Doctor : Patient;
      profile = await Model.findById(userId).select("-otp -otpExpires");
      if (profile) {
        source = role === "doctor" ? 'Doctor' : 'Patient';
        console.log(`✅ Profile found in ${source} collection: ${profile.email}`);
      }
    }
    
    if (!profile) {
      console.log(`❌ Profile not found in any collection for userId: ${userId}`);
      return res.status(404).json({ 
        success: false, 
        message: "User profile not found" 
      });
    }
    
    res.json({ 
      success: true, 
      data: profile,
      source: source
    });
  } catch (err) {
    console.error('❌ viewProfile error:', err.message);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// 2. Edit Profile
router.post("/editProfile", async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { name, specialist } = req.body;

    if (!name && !specialist) {
      return res.status(400).json({ success: false, message: "No data provided for update" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (specialist && role === "doctor") updateData.specialist = specialist;

    // Update User collection (main auth collection)
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select("-otp -otpExpires");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Also update role-specific collection if it exists
    let updatedProfile = null;
    if (role === "patient") {
      updatedProfile = await Patient.findByIdAndUpdate(
        userId,
        { name },
        { new: true, upsert: true } // upsert: true creates if doesn't exist
      );
    } else if (role === "doctor") {
      updatedProfile = await Doctor.findByIdAndUpdate(
        userId,
        { name, specialist },
        { new: true, upsert: true }
      );
    }

    res.json({ 
      success: true, 
      message: "Profile updated successfully", 
      data: {
        user: updatedUser,
        profile: updatedProfile
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating profile", error: err.message });
  }
});

// 3. Get All Doctors (Patient only)
router.get("/doctorAll", async (req, res) => {
  try {
    const { role } = req.user;
    
    if (role !== "patient") {
      return res.status(403).json({ success: false, message: "Access denied. Patients only." });
    }

    const doctors = await Doctor.find({}, "name specialist email experience ratings");
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching doctors", error: err.message });
  }
});

/// routes/dashboard.js
router.post("/bookAppointment/:doctorName", async (req, res) => {
  try {
    const userId = req.user?.userId;  // from auth middleware
    const { date, time, reason } = req.body;
    const doctorName = decodeURIComponent(req.params.doctorName).trim();

    console.log("👉 Booking appointment for User:", userId);

    // 1️⃣ GET USER DATA
    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2️⃣ FROM USER EMAIL → GET PATIENT RECORD
    const patient = await Patient.findOne({ email: userData.email });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient record not found" });
    }

    // 3️⃣ FIND DOCTOR BY NAME (NOT BY ID)
    const doctor = await Doctor.findOne({
      name: { $regex: new RegExp(`^${doctorName}$`, "i") }
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // 4️⃣ ADD APPOINTMENT IN PATIENT'S doctors[]
    patient.doctors.push({
      _id: doctor._id,
      date,
      time,
      reason,
      status: "pending",
    });

    await patient.save();

    // 5️⃣ ADD APPOINTMENT IN DOCTOR'S patients[]
    doctor.patients.push({
      _id: patient._id,
      date,
      time,
      reason,
      status: "pending",
    });

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Appointment booked successfully",
      patientId: patient._id,
      doctorId: doctor._id,
      doctorName: doctor.name,
    });
  }

  catch (error) {
    console.error("❌ Appointment Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
});

router.get("/myAppointments", async (req, res) => {
  try {
    const { userId, role } = req.user;

    console.log(`🔍 Fetching appointments for userId: ${userId} (${role})`);

    // 1️⃣ FIND USER IN USER COLLECTION
    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let profile = null;

    // 2️⃣ FIND PATIENT PROFILE USING EMAIL
    if (role === "patient") {
      profile = await Patient.findOne({ email: userData.email })
        .populate("doctors._id", "name email specialist");

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Patient record not found"
        });
      }
    }

    // 3️⃣ FIND DOCTOR PROFILE USING EMAIL
    else if (role === "doctor") {
      profile = await Doctor.findOne({ email: userData.email })
        .populate("patients._id", "name email");

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Doctor record not found"
        });
      }
    }

    console.log("📘 Profile found:", profile._id);

    // 4️⃣ GET APPOINTMENTS ARRAY
    const appointments =
      role === "patient" ? profile.doctors : profile.patients;

    console.log(`📅 Total appointments: ${appointments.length}`);

    // 5️⃣ FORMAT RESPONSE
    const formattedAppointments = appointments.map((a) => ({
      id: a._id?._id || a._id,
      name: a._id?.name || "Not Available",
      email: a._id?.email || "Not Available",
      specialist: a._id?.specialist || null,
      date: a.date,
      time: a.time,
      reason: a.reason,
      status: a.status,
    }));

    return res.status(200).json({
      success: true,
      count: formattedAppointments.length,
      data: formattedAppointments,
    });
  } catch (err) {
    console.error("❌ myAppointments Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: err.message,
    });
  }
});

module.exports = router;