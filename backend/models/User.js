const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true, 
    trim: true 
  },
  name: { 
    type: String,
    default: null 
  },
  phoneNumber: {
    type: String,
    trim: true,
    // Make unique if you want phone numbers to be unique across users
    unique: true, // Optional: depending on your requirements
    sparse: true  // Allows null/undefined values if not all users have phone
  },
  role: { 
    type: String, 
    enum: ["doctor", "patient", "lab_staff", "admin"], 
    default: "patient" 
  },

  // LINK to patient profile (if this user is patient)
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    default: null
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    default: null
  },
  // OTP login
  otp: { 
    type: String 
  },
  otpExpires: { 
    type: Date 
  },

  // Additional user profile fields
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: null
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" }
  },

  labStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabStaff',
    default: null
  },

  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null }

}, { timestamps: true });

// OTP expiration index
userSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000;
  return otp;
};

// OTP verification
userSchema.methods.verifyOTP = function(enteredOTP) {
  return this.otp === enteredOTP && this.otpExpires > Date.now();
};

// Clear OTP
userSchema.methods.clearOTP = function() {
  this.otp = undefined;
  this.otpExpires = undefined;
};

// Virtual Age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const dob = new Date(this.dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) age--;
  return age;
});

module.exports = mongoose.model('User', userSchema);
