const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // Basic Details
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true, 
    trim: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    default: "patient" 
  },
  phone: { type: String, required: true },

  // Doctor Appointments
  // doctors: [{ 
  //   _id: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Doctor",
  //     required: true
  //   },
  //   doctorName: {                 // ⭐ ADDED
  //     type: String,
  //     required: true
  //   },
  //   date: {
  //     type: String,
  //     required: true
  //   },
  //   time: {
  //     type: String,
  //     required: true
  //   },
  //   reason: {
  //     type: String,
  //     required: true
  //   },
  //   status: {
  //     type: String,
  //     enum: ["pending", "confirmed", "cancelled"],
  //     default: "pending"
  //   },
  //   consultionType : {
  //   type : String,
  //   required : true
  // }
  // }],

  // OTP Login
  otp: { 
    type: String 
  },
  otpExpires: { 
    type: Date 
  }

}, { timestamps: true });

// Expire OTP after it is past expiry time
patientSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

// Generate OTP
patientSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000;
  return otp;
};

// Verify OTP
patientSchema.methods.verifyOTP = function(enteredOTP) {
  return this.otp === enteredOTP && this.otpExpires > Date.now();
};

// Clear OTP
patientSchema.methods.clearOTP = function() {
  this.otp = undefined;
  this.otpExpires = undefined;
};

module.exports = mongoose.model('Patient', patientSchema);
