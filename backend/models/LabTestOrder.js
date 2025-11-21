const mongoose = require('mongoose');

const labTestOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tests: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['ordered', 'sample_collected', 'processing', 'completed'],
    default: 'ordered'
  },
  sampleCollectionDetails: {
    name: String,
    phone: String,
    address: String,
    pincode: String,
    date: Date,
    time: String
  },
  prescriptionUrl: String,
  reportUrl: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String
}, {
  timestamps: true
});

module.exports = mongoose.model('LabTestOrder', labTestOrderSchema);