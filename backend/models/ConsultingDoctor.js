const mongoose = require("mongoose");
const ConsultingDoctorSchema = new mongoose.Schema(
  {
    PatientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient"
    },
    memberId: {  // ADD THIS: Reference to member in Patient's members array
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: String,
    age: Number,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "male", "female", "other"]
    },
    phoneNumber: String,
    symptoms: {
      type: [String],
      default: []
    },
    specialization: String,
    consultingType: {
      type: String,
      enum: ["video", "audio", "chat"]
    },
    paymentDetails: {
      amount: Number,
      currency: { type: String, default: "INR" },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paidAt: Date
    },
    meetingLinks: {
      video: {
        url: String,
        meetingId: String,
        password: String,
        platform: {
          type: String,
          enum: ["zoom", "google_meet", "teams", "custom", "jitsi"]
        }
      }
    },
    specialistDoctor: {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor"
      },
      name: String,
      phone: String
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "rescheduled"],
      default: "scheduled"
    },
    notes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('ConsultingDoctor', ConsultingDoctorSchema);