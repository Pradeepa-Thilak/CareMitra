const mongoose = require("mongoose");

const ConsultingDoctorSchema = new mongoose.Schema({
    PatientId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
      },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 120
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^[0-9]{10,15}$/, 'Please enter a valid phone number']
  },
  symptoms: [{
    name: {
      type: String,
      required: true
    }
  }],
  specialization:{
  type : String,
  required : true
  } ,
  consultingType: {
    type: String,
    enum: ['video', 'audio', 'chat'],
    required: true
  },
  paymentDetails: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer', 'upi', null],
      default: null
    },
    paidAt: Date
  },
  meetingLinks: {
    video: {
      url: String,
      meetingId: String,
      password: String,
      platform: {
        type: String,
        enum: ['zoom', 'google_meet', 'teams', 'custom']
      }
    },
    audio: {
      conferenceNumber: String,
      accessCode: String,
      dialInInstructions: String
    },
    chat: {
      roomId: String,
      platform: {
        type: String,
        enum: ['whatsapp', 'telegram', 'custom_chat']
      }
    }
  },
  specialistDoctor: {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ConsultingDoctor', ConsultingDoctorSchema);