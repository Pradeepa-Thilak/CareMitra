const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
require('dotenv').config();

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caremitra_app');
    console.log('📊 Connected to MongoDB for seeding...');

    // Clear existing data
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create sample doctors
    const doctors = await Doctor.create([
      {
        name: "Dr. Rajesh Kumar",
        email: "dr.rajesh@caremitra.com",
        specialist: "Cardiology",
        patients: []
      },
      {
        name: "Dr. Priya Sharma",
        email: "dr.priya@caremitra.com", 
        specialist: "Dermatology",
        patients: []
      },
      {
        name: "Dr. Amit Patel",
        email: "dr.amit@caremitra.com",
        specialist: "Orthopedics",
        patients: []
      },
      {
        name: "Dr. Sunita Reddy",
        email: "dr.sunita@caremitra.com",
        specialist: "Pediatrics",
        patients: []
      },
      {
        name: "Dr. Vikram Singh",
        email: "dr.vikram@caremitra.com",
        specialist: "Neurology",
        patients: []
      }
    ]);
    console.log('👨‍⚕️ Created', doctors.length, 'doctors');

    // Create sample patients
    const patients = await Patient.create([
      {
        name: "Rahul Verma",
        email: "rahul@test.com",
        doctors: []
      },
      {
        name: "Anjali Mehta", 
        email: "anjali@test.com",
        doctors: []
      },
      {
        name: "Suresh Nair",
        email: "suresh@test.com",
        doctors: []
      },
      {
        name: "Priya Desai",
        email: "priya.d@test.com", 
        doctors: []
      }
    ]);
    console.log('👤 Created', patients.length, 'patients');

    // Create some sample appointments
    const doctor1 = await Doctor.findOne({ email: "dr.rajesh@caremitra.com" });
    const doctor2 = await Doctor.findOne({ email: "dr.priya@caremitra.com" });
    const patient1 = await Patient.findOne({ email: "rahul@test.com" });
    const patient2 = await Patient.findOne({ email: "anjali@test.com" });

    // Book appointments
    if (doctor1 && patient1) {
      // Add to doctor's patients array
      doctor1.patients.push({
        _id: patient1._id,
        date: "2025-11-20",
        time: "10:30 AM",
        reason: "Heart checkup",
        status: "confirmed"
      });

      // Add to patient's doctors array  
      patient1.doctors.push({
        _id: doctor1._id,
        date: "2025-11-20",
        time: "10:30 AM",
        reason: "Heart checkup",
        status: "confirmed"
      });

      await doctor1.save();
      await patient1.save();
      console.log('📅 Created confirmed appointment for Rahul with Dr. Rajesh');
    }

    if (doctor2 && patient2) {
      // Add to doctor's patients array
      doctor2.patients.push({
        _id: patient2._id,
        date: "2025-11-21", 
        time: "2:00 PM",
        reason: "Skin allergy consultation",
        status: "pending"
      });

      // Add to patient's doctors array
      patient2.doctors.push({
        _id: doctor2._id,
        date: "2025-11-21",
        time: "2:00 PM", 
        reason: "Skin allergy consultation",
        status: "pending"
      });

      await doctor2.save();
      await patient2.save();
      console.log('📅 Created pending appointment for Anjali with Dr. Priya');
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log('👨‍⚕️ Doctors: 5');
    console.log('👤 Patients: 4'); 
    console.log('📅 Appointments: 2 (1 confirmed, 1 pending)');
    console.log('\n🔑 Test Credentials:');
    console.log('Doctors: dr.rajesh@caremitra.com, dr.priya@caremitra.com, etc.');
    console.log('Patients: rahul@test.com, anjali@test.com, etc.');
    console.log('\n🚀 You can now request OTP and test the APIs!');

    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();