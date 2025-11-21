require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const esClient = require("../config/elasticsearch");

const ES_INDEX = "products";

async function reindex() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Fetching products...");
    const products = await Product.find();

    console.log(`Found ${products.length} products. Indexing to ES...`);

    for (let p of products) {
      await esClient.index({
        index: ES_INDEX,
        id: p._id.toString(),
        document: {
          name: p.name,
          description: p.description,
          price: p.price,
          discount: p.discount,
          discountedPrice: p.discountedPrice,
          brand: p.brand,
          category: p.category,
          stock: p.stock,
          isActive: p.isActive
        }
      });

      console.log("Indexed:", p.name);
    }

    console.log("Reindex complete!");
    process.exit();

  } catch (error) {
    console.error("Reindex Error:", error);
    process.exit(1);
  }
}

reindex();
