const producer = require('./kafka/producer');

async function test() {
  console.log('🚀 Testing Kafka Producer v2...');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Send lab test event
    console.log('\n1️⃣  Testing lab test event...');
    const result1 = await producer.sendLabTestEvent('lab_test_order_created', {
      orderId: `test-order-${Date.now()}`,
      userId: 'user-123',
      tests: ['blood_test', 'urine_test'],
      totalAmount: 2500,
      timestamp: new Date().toISOString()
    });
    
    console.log(`   Result: ${result1 ? '✅ Success' : '❌ Failed'}`);
    
    // Test 2: Send doctor booking event
    console.log('\n2️⃣  Testing doctor booking event...');
    const result2 = await producer.sendDoctorBookingEvent('doctor_appointment_booked', {
      appointmentId: `appt-${Date.now()}`,
      patientId: 'patient-456',
      doctorId: 'doctor-789',
      date: '2024-01-15',
      time: '14:30',
      timestamp: new Date().toISOString()
    });
    
    console.log(`   Result: ${result2 ? '✅ Success' : '❌ Failed'}`);
    
    // Check mode
    console.log('\n📊 Mode:', producer.isUsingMock() ? '🔄 MOCK mode' : '🚀 REAL Kafka mode');
    
    if (producer.isUsingMock()) {
      const events = producer.getMockEvents();
      console.log(`📋 Mock events stored: ${events.length}`);
      events.forEach((event, i) => {
        console.log(`\n   Event ${i + 1}:`);
        console.log(`     Topic: ${event.topic}`);
        console.log(`     Type: ${event.eventType}`);
        console.log(`     Time: ${new Date(event.timestamp).toLocaleTimeString()}`);
      });
    }
    
    // Clean up
    console.log('\n🧹 Cleaning up...');
    await producer.disconnect();
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run test
test().catch(console.error);
