// models/LabTestOrder.js - FIXED VERSION
const mongoose = require('mongoose');

const labTestOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: false
  },

  tests: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest',
      required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: String,
    fastingRequired: Boolean,
    sampleType: String,
    reportTime: String
  }],

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
paidAt: Date,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  orderStatus: {
    type: String,
    enum: ['created', 'sample_collected', 'processing', 'completed', 'cancelled' , 'pending'],
    default: 'pending'
  },

  patientDetails: {
    name: String,
    email: String,
    phone: String,
    age: Number,
    gender: String
  },

  sampleCollectionDetails: {
    name: String,
    phone: String,
    address: String,
    pincode: String,
    date: Date,
    time: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // ← DEFAULT ADDED HERE
        validate: {
          validator: function(coords) {
            return Array.isArray(coords) && 
                   coords.length === 2 && 
                   !isNaN(coords[0]) && 
                   !isNaN(coords[1]);
          },
          message: 'Coordinates must be [longitude, latitude] array'
        }
      }
    }
  },

  prescriptionFile: {
    filename: String,
    data: {
      type: Buffer,   // ✅ THIS IS THE KEY
      required: true
    },
    contentType: String,
    uploadDate: { type: Date, default: Date.now }
  },


  assignedStaff: {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabStaff' },
    staffUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    staffName: String,
    staffPhone: String,
    assignedAt: Date,
    estimatedArrival: Date,
    actualArrival: Date,
    completionTime: Date,
    staffNotes: String
  },

  tracking: {
    liveLocation: {
      coordinates: { type: [Number], default: [0, 0] }, // ← DEFAULT ADDED
      lastUpdated: Date
    },
    routePolyline: String,
    distance: Number,
    duration: Number,
    collectionProof: {
      imageUrl: String,
      takenAt: Date
    }
  },

  staffRating: {
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
    ratedAt: Date
  },

  notifications: [{
    type: { type: String, enum: ['email', 'sms', 'push'], required: true },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
    message: String
  }],

  adminNotes: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    addedAt: { type: Date, default: Date.now }
  }]

}, {
  timestamps: true
});

// ADD THIS PRE-SAVE MIDDLEWARE (IMPORTANT!)
labTestOrderSchema.pre('save', function(next) {
  // Ensure sampleCollectionDetails.location has valid coordinates
  if (this.sampleCollectionDetails && this.sampleCollectionDetails.location) {
    const loc = this.sampleCollectionDetails.location;
    
    if (loc.type === 'Point' && (!loc.coordinates || loc.coordinates.length !== 2)) {
      loc.coordinates = [0, 0];
    }
  }
  
  // Ensure tracking.liveLocation has valid coordinates
  if (this.tracking && this.tracking.liveLocation) {
    const liveLoc = this.tracking.liveLocation;
    
    if (!liveLoc.coordinates || liveLoc.coordinates.length !== 2) {
      liveLoc.coordinates = [0, 0];
    }
  }
  
  next();
});

// Create index (should work now after fixing documents)
labTestOrderSchema.index({ 'sampleCollectionDetails.location': '2dsphere' });

module.exports = mongoose.model('LabTestOrder', labTestOrderSchema);