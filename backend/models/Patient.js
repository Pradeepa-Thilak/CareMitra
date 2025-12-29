const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: { type: String, required: true },
  role: { type: String, default: "patient" },
  phone: { type: String, required: true },
  address: { type: String },

  members: [
    {
      name: String,
      age: Number,
      gender: String,
      phoneNumber: String,
      consultingType: {
        type: String,
        enum: ["video", "audio", "chat"],
        default: "video"
      }
    }
  ],

  // LOGIN OTP
  otp: String,
  otpExpires: Date
}, { timestamps: true });

// Auto-expire OTP
patientSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

// Generate OTP
patientSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000;
  return otp;
};

// Verify OTP
patientSchema.methods.verifyOTP = function (enteredOTP) {
  return this.otp === enteredOTP && this.otpExpires > Date.now();
};

// Clear OTP
patientSchema.methods.clearOTP = function () {
  this.otp = undefined;
  this.otpExpires = undefined;
};

module.exports = mongoose.model("Patient", patientSchema);
