const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  // Personal Information
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  role : {type : String , default : 'doctor'},
  // Professional Information
  specialization: { type: String, required: true },
  qualifications: [{ type: String }],
  experience: { type: Number, default: 0 },
  bio: String,
  
  // License & Registration
  medicalLicenseNumber: { type: String, required: true, unique: true },
  registrationCouncil: { type: String, required: true },
  yearOfRegistration: { type: Number, required: true },
  
  // Verification Status
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  isActive: { type: Boolean, default: false },
  
  // Admin Verification Details
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  verifiedAt: Date,
  verificationNotes: String,
  rejectionReason: String,
  
  // Work Details
  department: String,
  baseConsultationFee: { type: Number, default: 0 },
  availableDays: [{ type: String }],
  availableTime: {
    start: String,
    end: String
  },

  // Premium & Patient Management
  premiumPlan: {
    planType: { 
      type: String, 
      enum: ['2000', '3000', '4000', '5000']
    },
    planName: { type: String },
    patientLimit: { type: Number, default: 5 },
    amount: { type: Number },
    purchasedAt: Date,
    expiresAt: Date,
    isActive: { type: Boolean, default: false }
  },
  
  // Razorpay Payment Details
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentDate: Date,
    amountPaid: Number
  },
  
  // Daily Patient Tracking
  dailyStats: {
    date: { type: Date, default: Date.now },
    patientsConsulted: { type: Number, default: 0 },
    maxPatientsAllowed: { type: Number, default: 5 }
  },
  
  // Availability based on patient count
  isAvailableToday: { type: Boolean, default: false },
  
  // Documents for verification
  documents: [{
    documentType: String,
    documentName: String,
    documentUrl: String,
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
  }],
  
  // OTP for consultation
  currentOTP: String,
  otpExpires: Date,
  
  // Plan expiry tracking
  planExpiryReminderSent: { type: Boolean, default: false },
  
  // Meta
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  addedAt: { type: Date, default: Date.now },

  // 🔥 NEW — Patients array
 patients: [{ 
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  patientName: { type: String, required: true },   // NEW
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending"
  },
  consultionType : {
    type : String,
    required : true
  }
}]
,
otp: {
  type: String,
},
otpExpires: {
  type: Date,
}
}, 

{ timestamps: true });

// Method to check availability
doctorSchema.methods.checkAvailability = function() {
  const today = new Date().toDateString();
  const statsDate = this.dailyStats.date.toDateString();
  
  if (today !== statsDate) {
    this.dailyStats.date = new Date();
    this.dailyStats.patientsConsulted = 0;
    this.isAvailableToday = true;
    this.currentOTP = null;
    this.otpExpires = null;
  }
  
  return this.dailyStats.patientsConsulted < this.dailyStats.maxPatientsAllowed;
};

/// Generate OTP
doctorSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;  // Store here
  this.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // valid for 15 min
  return otp;
};

// Verify OTP
doctorSchema.methods.verifyOTP = function (enteredOTP) {
  return (
    this.otp === enteredOTP &&
    this.otpExpires &&
    this.otpExpires > Date.now()
  );
};

// Clear OTP
doctorSchema.methods.clearOTP = function () {
  this.otp = undefined;
  this.otpExpires = undefined;
};


module.exports = mongoose.model('Doctor', doctorSchema);
