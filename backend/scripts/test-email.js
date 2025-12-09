// scripts/test-email.js
const mongoose = require('mongoose');
require('dotenv').config();
const emailHandlers = require('../kafka/emailHandlers');

// Connect to MongoDB
async function connectDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/caremitra_app';
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

async function testEmailHandlers() {
  console.log('🧪 Testing email handlers...\n');
  
  // Connect to DB first
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('⚠️  Running in simulation mode (no DB connection)');
  }

  // Mock data for testing
  const mockOrder = {
    _id: mongoose.Types.ObjectId.createFromHexString('69329bbc845f9bbb3161293a'),
    patientDetails: {
      email: 'test@example.com',
      name: 'John Doe',
      phone: '+1234567890',
      additionalEmail: 'backup@example.com'
    },
    tests: [
      { testId: { name: 'Complete Blood Count' } },
      { testId: { name: 'Blood Sugar Fasting' } },
      { testId: { name: 'Lipid Profile' } }
    ],
    totalAmount: 1500,
    status: 'confirmed',
    sampleCollectionDetails: {
      address: '123 Main Street, Bangalore, Karnataka 560001',
      contactPhone: '+919876543210',
      pincode: '560001'
    },
    createdAt: new Date()
  };

  const mockStaff = {
    _id: mongoose.Types.ObjectId.createFromHexString('507f1f77bcf86cd799439011'),
    name: 'Rajesh Kumar',
    email: 'staff@example.com',
    phone: '+919988776655',
    isActive: true,
    isAvailable: true
  };

  // Test 1: Lab Test Order Created
  console.log('1️⃣ Testing Lab Test Order Created:');
  const testOrderPayload = {
    orderId: mockOrder._id.toString(),
    timestamp: new Date().toISOString()
  };
  
  try {
    // Mock the database call if needed
    if (!isConnected) {
      console.log('⚠️  DB not connected, using mock data');
      // You can temporarily override the handler to use mock data
      const originalHandler = emailHandlers.handleLabTestOrderCreated;
      emailHandlers.handleLabTestOrderCreated = async (payload) => {
        console.log('📧 [MOCK] Would send email for order:', payload.orderId);
        console.log('📧 [MOCK] To:', mockOrder.patientDetails.email);
        return { success: true, simulated: true };
      };
    }
    
    const result = await emailHandlers.handleLabTestOrderCreated(testOrderPayload);
    console.log('✅ Test 1 result:', result?.success ? 'SUCCESS' : 'FAILED');
    console.log('   Details:', result);
  } catch (error) {
    console.log('❌ Test 1 failed:', error.message);
  }

  // Test 2: Assignment Failed
  console.log('\n2️⃣ Testing Assignment Failed:');
  const testAssignmentFailed = {
    orderId: mockOrder._id.toString(),
    reason: 'No available staff in 10km radius',
    patientLocation: { 
      type: 'Point', 
      coordinates: [77.5946, 12.9716] 
    },
    timestamp: new Date().toISOString()
  };
  
  try {
    if (!isConnected) {
      // Mock the database call
      emailHandlers.handleLabOrderAssignmentFailed = async (payload) => {
        console.log('📧 [MOCK] Would send assignment failed email');
        console.log('📧 [MOCK] Order:', payload.orderId);
        console.log('📧 [MOCK] Reason:', payload.reason);
        
        // Simulate sending to patient
        console.log('📧 [MOCK] Patient email:', mockOrder.patientDetails.email);
        
        // Simulate sending to admin if configured
        if (process.env.ADMIN_EMAIL) {
          console.log('📧 [MOCK] Admin email:', process.env.ADMIN_EMAIL);
        }
        
        return { success: true, simulated: true };
      };
    }
    
    const result = await emailHandlers.handleLabOrderAssignmentFailed(testAssignmentFailed);
    console.log('✅ Test 2 result:', result?.success ? 'SUCCESS' : 'FAILED');
    console.log('   Details:', result);
  } catch (error) {
    console.log('❌ Test 2 failed:', error.message);
  }

  // Test 3: Sample Collected
  console.log('\n3️⃣ Testing Sample Collected:');
  const testSampleCollected = {
    orderId: mockOrder._id.toString(),
    staffId: mockStaff._id.toString(),
    collectionTime: new Date().toISOString(),
    timestamp: new Date().toISOString()
  };
  
  try {
    if (!isConnected) {
      emailHandlers.handleLabTestSampleCollected = async (payload) => {
        console.log('📧 [MOCK] Would send sample collected email');
        console.log('📧 [MOCK] Order:', payload.orderId);
        console.log('📧 [MOCK] Staff:', payload.staffId);
        return { success: true, simulated: true };
      };
    }
    
    const result = await emailHandlers.handleLabTestSampleCollected(testSampleCollected);
    console.log('✅ Test 3 result:', result?.success ? 'SUCCESS' : 'FAILED');
  } catch (error) {
    console.log('❌ Test 3 failed:', error.message);
  }

  // Test 4: Report Uploaded
  console.log('\n4️⃣ Testing Report Uploaded:');
  const testReportUploaded = {
    orderId: mockOrder._id.toString(),
    reportUrl: 'https://caremitra.com/reports/12345.pdf',
    uploadedBy: 'Dr. Smith',
    timestamp: new Date().toISOString()
  };
  
  try {
    if (!isConnected) {
      emailHandlers.handleLabTestReportUploaded = async (payload) => {
        console.log('📧 [MOCK] Would send report uploaded email');
        console.log('📧 [MOCK] Report URL:', payload.reportUrl);
        console.log('📧 [MOCK] To patient:', mockOrder.patientDetails.email);
        console.log('📧 [MOCK] CC to:', mockOrder.patientDetails.additionalEmail);
        return { success: true, simulated: true };
      };
    }
    
    const result = await emailHandlers.handleLabTestReportUploaded(testReportUploaded);
    console.log('✅ Test 4 result:', result?.success ? 'SUCCESS' : 'FAILED');
  } catch (error) {
    console.log('❌ Test 4 failed:', error.message);
  }

  console.log('\n📊 Email testing completed');
  
  // Close DB connection if connected
  if (isConnected) {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

// Run the test
testEmailHandlers().catch(console.error);