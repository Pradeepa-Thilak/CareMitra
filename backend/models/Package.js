const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  discount: String,
  testsCount: Number,
  sampleType: String,
  reportTime: String,
  fasting: String,
  conductedBy: String,
  highlights: [String],
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Package", packageSchema);
