// fixAllOrders.js
const mongoose = require('mongoose');
require('dotenv').config();
 const LabTestOrder = require('../models/LabTestOrder');

async function fixAllOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
   
    
    // Fix 1: Documents with empty coordinates array
    await LabTestOrder.updateMany(
      { "sampleCollectionDetails.location.coordinates": [] },
      { $set: { "sampleCollectionDetails.location.coordinates": [0, 0] } }
    );
    
    // Fix 2: Documents with missing coordinates field
    await LabTestOrder.updateMany(
      { 
        "sampleCollectionDetails.location.type": "Point",
        "sampleCollectionDetails.location.coordinates": { $exists: false }
      },
      { $set: { "sampleCollectionDetails.location.coordinates": [0, 0] } }
    );
    
    // Fix 3: Documents with null/undefined location
    await LabTestOrder.updateMany(
      { 
        $or: [
          { "sampleCollectionDetails.location": null },
          { "sampleCollectionDetails.location": { $exists: false } }
        ]
      },
      { 
        $set: { 
          "sampleCollectionDetails.location": {
            type: "Point",
            coordinates: [0, 0]
          }
        } 
      }
    );
    
    console.log("✅ ALL documents have been fixed!");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixAllOrders();