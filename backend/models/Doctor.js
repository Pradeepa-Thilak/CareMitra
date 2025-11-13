const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
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
    default: "doctor" 
  },
  specialist: { 
    type: String, 
    default: null 
  },
  patients: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Patient" 
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
doctorSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

// Add OTP methods to Doctor model too
doctorSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000;
  return otp;
};

doctorSchema.methods.verifyOTP = function(enteredOTP) {
  return this.otp === enteredOTP && this.otpExpires > Date.now();
};

doctorSchema.methods.clearOTP = function() {
  this.otp = undefined;
  this.otpExpires = undefined;
};

module.exports = mongoose.model('Doctor', doctorSchema);