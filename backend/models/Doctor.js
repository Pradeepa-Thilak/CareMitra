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

// Index for better performance
doctorSchema.index({ email: 1 });
doctorSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });
doctorSchema.index({ specialist: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);