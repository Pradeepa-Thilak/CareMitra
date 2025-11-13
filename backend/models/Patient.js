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

// Index for better performance
patientSchema.index({ email: 1 });
patientSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Patient', patientSchema);