const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
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
  doctors: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor" 
  }],
  otp: { 
    type: String 
  },
  otpExpires: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

// OTP expiration index
patientSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

// Add OTP methods to Patient model too
patientSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000;
  return otp;
};

patientSchema.methods.verifyOTP = function(enteredOTP) {
  return this.otp === enteredOTP && this.otpExpires > Date.now();
};

patientSchema.methods.clearOTP = function() {
  this.otp = undefined;
  this.otpExpires = undefined;
};

module.exports = mongoose.model('Patient', patientSchema);