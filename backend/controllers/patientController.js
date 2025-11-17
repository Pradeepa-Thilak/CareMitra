const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require("../models/User");

const viewProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;
    
    console.log(`🔍 Looking for profile: ${userId} (${role})`);
    
    let profile = null;
    let source = '';
    
    
    profile = await User.findById(userId).select("-otp -otpExpires");
    if (profile) {
      source = 'User';
      console.log(`✅ Profile found in User collection: ${profile.email}`);
    } else {
      
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
}


const editProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { name, specialist } = req.body;

    if (!name && !specialist) {
      return res.status(400).json({ success: false, message: "No data provided for update" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (specialist && role === "doctor") updateData.specialist = specialist;

    
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select("-otp -otpExpires");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

   
    let updatedProfile = null;
    if (role === "patient") {
      updatedProfile = await Patient.findByIdAndUpdate(
        userId,
        { name },
        { new: true, upsert: true } 
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
};


const getAllDoctor = async (req, res) => {
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
};

const myAppointment = async (req, res) => {
  try {
    const { userId, role } = req.user;

    console.log(`🔍 Fetching appointments for userId: ${userId} (${role})`);

    
    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let profile = null;

    
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

    
    const appointments =
      role === "patient" ? profile.doctors : profile.patients;

    console.log(` Total appointments: ${appointments.length}`);

   
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
    console.error(" myAppointments Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: err.message,
    });
  }
};



module.exports = {
  viewProfile,
  editProfile,
  getAllDoctor,
  myAppointment
};