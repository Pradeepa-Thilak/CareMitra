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
  role: { 
    type: String, 
    enum: ["doctor", "patient","admin"], 
    default: null 
  },
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
userSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

// Method to generate OTP - ADD THIS BACK
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
  return otp;
};

// Method to verify OTP - ADD THIS BACK
userSchema.methods.verifyOTP = function(enteredOTP) {
  return this.otp === enteredOTP && this.otpExpires > Date.now();
};

// Method to clear OTP after verification - ADD THIS BACK
userSchema.methods.clearOTP = function() {
  this.otp = undefined;
  this.otpExpires = undefined;
};

module.exports = mongoose.model('User', userSchema);