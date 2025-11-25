const mongoose = require('mongoose');
const esClient = require("../config/elasticsearch");

const ES_INDEX = "products";


const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    
    trim: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  price: {
    type: Number,
    required: false,
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
    default: function () {
      return this.price * (1 - this.discount / 100);
    }
  },
  description: {
    type: String,
    required: false
  },
  stock: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  images: [
    {
      type: String
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});


productSchema.pre("save", function (next) {
  this.discountedPrice = this.price * (1 - this.discount / 100);
  next();
});


productSchema.post("save", async function () {
  try {
    await esClient.index({
      index: ES_INDEX,
      id: this._id.toString(),
      document: {
        name: this.name,
        description: this.description,
        price: this.price,
        discount: this.discount,
        discountedPrice: this.discountedPrice,
        brand: this.brand,
        category: this.category,
        stock: this.stock,
        isActive: this.isActive
      }
    });
  } catch (e) {
    console.error("Elasticsearch Index Error:", e?.meta?.body?.error || e);
  }
});


productSchema.post("remove", async function () {
  try {
    await esClient.delete({
      index: ES_INDEX,
      id: this._id.toString(),
    });
  } catch (e) {
    console.error("Elasticsearch Delete Error:", e?.meta?.body?.error || e);
  }
});


productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ price: 1 });
productSchema.index({ discount: -1 });
productSchema.index({ category: 1, brand: 1 });

module.exports = mongoose.model("Product", productSchema);
