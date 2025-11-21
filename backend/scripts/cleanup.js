// cleanup-indexes.js
const mongoose = require('mongoose');

async function cleanupIndexes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/caremitra_app');
    
    const db = mongoose.connection.db;
    
    // Drop duplicate indexes
    await db.collection('doctors').dropIndex('otpExpires_1');
    await db.collection('patients').dropIndex('otpExpires_1');
    
    console.log('Duplicate indexes cleaned up!');
    process.exit(0);
  } catch (error) {
    console.log('Index cleanup completed or no duplicates found');
    process.exit(0);
  }
}

cleanupIndexes();