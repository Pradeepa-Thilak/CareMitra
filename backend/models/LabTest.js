const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  finalPrice: {
    type: Number,
    min: 0
  },
  sampleType: {
    type: String,
    required: true
  },
  fastingRequired: {
    type: Boolean,
    default: false
  },
  reportDeliveryTime: {
    type: String,
    default: "24 hours"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

// Calculate finalPrice before saving
labTestSchema.pre('save', function(next) {
  this.finalPrice = this.price - (this.price * this.discount / 100);
  next();
});

module.exports = mongoose.model('LabTest', labTestSchema);