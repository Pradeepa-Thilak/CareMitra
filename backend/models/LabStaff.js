const mongoose = require('mongoose');

const labStaffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: false
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  assignedOrders: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTestOrder'
    },
    assignedAt: Date,
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'assigned'
    }
  }],
  verificationDocuments: [{
    documentType: {
      type: String,
      enum: ['id_proof', 'certificate', 'license', 'other']
    },
    filename: String,
    fileId: mongoose.Schema.Types.ObjectId,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  completedOrders: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
labStaffSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('LabStaff', labStaffSchema);