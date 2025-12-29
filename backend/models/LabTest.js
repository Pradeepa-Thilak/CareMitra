// models/LabTest.js
const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: Number,
  isActive: {
    type: Boolean,
    default: true
  },
  sampleType: String,
  reportTime: String,
  popularity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabTest', labTestSchema);