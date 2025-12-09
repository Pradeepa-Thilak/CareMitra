// scripts/test-kafka-emails.js
require('dotenv').config();
const mongoose = require('mongoose');
const emailHandlers = require('../kafka/emailHandlers');

async function testKafkaEmailHandlers() {
  console.log('🧪 Testing Kafka Email Handlers Integration\n');
  
  // Connect to MongoDB (optional)
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caremitra_app');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.log('⚠️ Could not connect to MongoDB, testing with mock data');
  }
  
  // Test 1: Lab Test Order Created
  console.log('\n1️⃣ Testing LAB_TEST_ORDER_CREATED handler:');
  const testPayload1 = {
    orderId: '69329bbc845f9bbb3161293a' // Use an existing order ID from your DB
  };
  
  try {
    const result = await emailHandlers.handleLabTestOrderCreated(testPayload1);
    console.log('   Result:', result?.success ? '✅ SUCCESS' : '❌ FAILED');
    if (result?.error) console.log('   Error:', result.error);
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  // Test 2: Assignment Failed
  console.log('\n2️⃣ Testing LAB_ORDER_ASSIGNMENT_FAILED handler:');
  const testPayload2 = {
    orderId: '69329bbc845f9bbb3161293a',
    reason: 'Test: No staff available',
    patientLocation: { coordinates: [77.5946, 12.9716] }
  };
  
  try {
    const result = await emailHandlers.handleLabOrderAssignmentFailed(testPayload2);
    console.log('   Result:', result?.success ? '✅ SUCCESS' : '❌ FAILED');
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  // Test 3: Auto Assigned
  console.log('\n3️⃣ Testing LAB_ORDER_AUTO_ASSIGNED handler:');
  const testPayload3 = {
    orderId: '69329bbc845f9bbb3161293a',
    staffId: '507f1f77bcf86cd799439011', // Use an existing staff ID
    staffName: 'Test Technician',
    distanceKm: '5.2'
  };
  
  try {
    const result = await emailHandlers.handleLabOrderAutoAssigned(testPayload3);
    console.log('   Result:', result?.success ? '✅ SUCCESS' : '❌ FAILED');
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  // Test 4: Sample Collected
  console.log('\n4️⃣ Testing LAB_TEST_SAMPLE_COLLECTED handler:');
  const testPayload4 = {
    orderId: '69329bbc845f9bbb3161293a',
    staffId: '507f1f77bcf86cd799439011',
    collectionTime: new Date().toISOString()
  };
  
  try {
    const result = await emailHandlers.handleLabTestSampleCollected(testPayload4);
    console.log('   Result:', result?.success ? '✅ SUCCESS' : '❌ FAILED');
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n📊 Kafka Email Handlers Test Complete');
  
  // Disconnect from MongoDB
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testKafkaEmailHandlers().catch(console.error);