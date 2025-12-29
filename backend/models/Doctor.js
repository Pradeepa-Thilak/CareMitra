const mongoose = require("mongoose");
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false },
  dateOfBirth: Date,
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  role: { type: String, default: "doctor" },
  specialization: { type: String, required: true },
  experience: { type: Number, default: 0 },
  medicalLicenseNumber: { type: String, required: true, unique: true },
  yearOfRegistration: { type: String, required: true },
  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending"
  },
  isActive: { type: Boolean, default: false },

  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  verifiedAt: Date,
  verificationNotes: String,
  rejectionReason: String,

  // Work Details
  baseConsultationFee: { type: Number, default: 0 },

  availableDays: [{ type: String }],
  availableTime: {
    start: String,
    end: String
  },
  premiumPlan: {
    planType: { type: String, enum: ["2000", "3000", "4000", "5000"] },
    planName: String,
    patientLimit: { type: Number, default: 5 },
    amount: Number,
    purchasedAt: Date,
    expiresAt: Date,
    isActive: { type: Boolean, default: false }
  },
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded","inactive"],
      default: "pending"
    },
    paymentDate: Date,
    amountPaid: Number
  },

  // Daily Stats
  dailyStats: {
    date: { type: Date, default: Date.now },
    patientsConsulted: { type: Number, default: 0 },
    maxPatientsAllowed: { type: Number, default: 5 }
  },

  isAvailableToday: { type: Boolean, default: false },

  // OTP for consultation
  otp: String,
  otpExpires: Date,

  // Plan Reminder
  planExpiryReminderSent: { type: Boolean, default: false },

  // Meta
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  addedAt: { type: Date, default: Date.now }
}, { timestamps: true });


// Methods
doctorSchema.methods.checkAvailability = function () {
  const today = new Date().toDateString();
  const statsDate = this.dailyStats.date.toDateString();

  if (today !== statsDate) {
    this.dailyStats.date = new Date();
    this.dailyStats.patientsConsulted = 0;
    this.isAvailableToday = true;
    this.otp = null;
    this.otpExpires = null;
  }

  return this.dailyStats.patientsConsulted < this.dailyStats.maxPatientsAllowed;
};

// Generate OTP
doctorSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
  return otp;
};

// Verify OTP
doctorSchema.methods.verifyOTP = function (enteredOTP) {
  return this.otp === enteredOTP && this.otpExpires > Date.now();
};

// Clear OTP
doctorSchema.methods.clearOTP = function () {
  this.otp = undefined;
  this.otpExpires = undefined;
};

module.exports = mongoose.model("Doctor", doctorSchema);

