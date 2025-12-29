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
  },
   otp: String,
  otpExpires: Date
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
labStaffSchema.index({ location: '2dsphere' });

// OTP verification
labStaffSchema.methods.verifyOTP = function(enteredOTP) {
  return this.otp === enteredOTP && this.otpExpires > Date.now();
};

labStaffSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000;
  return otp;
};

// Clear OTP
labStaffSchema.methods.clearOTP = function() {
  this.otp = undefined;
  this.otpExpires = undefined;
};

module.exports = mongoose.model('LabStaff', labStaffSchema);