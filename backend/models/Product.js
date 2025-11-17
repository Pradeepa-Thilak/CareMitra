const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand', 
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
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
  discountedPrice: {
    type: Number,
    default: function() {
      return this.price * (1 - this.discount / 100);
    }
  },
  description: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

productSchema.pre('save', function(next) {
  this.discountedPrice = this.price * (1 - this.discount / 100);
  next();
});

// Indexes for better performance
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ name: 'text', brand: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ discount: -1 });
productSchema.index({ category: 1, brand: 1 }); // Compound index

module.exports = mongoose.model('Product', productSchema);