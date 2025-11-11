const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting products of this brand
brandSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'brand',
  justOne: false
});

brandSchema.index({ key: 1 });
brandSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Brand', brandSchema);