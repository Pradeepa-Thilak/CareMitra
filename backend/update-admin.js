const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function updateAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caremitra');

    const admin = await Admin.findOne({ email: 'msjanakiraman38@gmail.com' });
    if (admin) {
      console.log('Found admin:', admin.email);
      console.log('Has password:', !!admin.password);

      if (!admin.password) {
        admin.password = 'admin123';
        await admin.save();
        console.log('Password set for admin user');
      } else {
        console.log('Admin already has a password');
      }
    } else {
      console.log('Admin user not found');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

updateAdminPassword();