const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caremitra');
    const admin = await Admin.findOne({ email: 'msjanakiraman38@gmail.com' });
    if (admin) {
      console.log('Admin found:');
      console.log('- Email:', admin.email);
      console.log('- Name:', admin.name);
      console.log('- Role:', admin.role);
      console.log('- Has password:', !!admin.password);
      console.log('- Is active:', admin.isActive);
    } else {
      console.log('Admin not found');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkAdmin();