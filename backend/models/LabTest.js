// models/LabTest.js
const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['blood_test', 'urine_test', 'imaging', 'pathology', 'package'],
    default: 'blood_test'
  },
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
  fastingRequired: {
    type: Boolean,
    default: false
  },
  sampleType: String,
  reportTime: String,
  preparationInstructions: String,
  testIncludes: [String],
  tags: [String],
  popularity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabTest', labTestSchema);