// models/Wishlist.js
const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discountedPrice: {
    type: Number,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  packSize: {
    type: String,
    default: null
  },
  category: {
    type: String,
    default: null
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true }); // This ensures each item gets its own _id

const wishlistSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId, // Changed from Mixed to ObjectId
    ref: "Patient",
    required: true,
    unique: true // Each patient has only one wishlist
  },
  items: [wishlistItemSchema]
}, { 
  timestamps: true 
});

// Compound index for faster queries
wishlistSchema.index({ patientId: 1 });
wishlistSchema.index({ "items.productId": 1 });

// Create a pre-save hook to ensure patientId is ObjectId
wishlistSchema.pre('save', function(next) {
  if (this.patientId && mongoose.Types.ObjectId.isValid(this.patientId)) {
    this.patientId = new mongoose.Types.ObjectId(this.patientId);
  }
  next();
});

module.exports = mongoose.model("Wishlist", wishlistSchema);