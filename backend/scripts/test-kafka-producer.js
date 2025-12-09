
const { Kafka } = require('kafkajs');

// Create Kafka client
const kafka = new Kafka({
  clientId: 'caremitra-test-producer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const TOPICS = {
  LAB_TEST_BOOKING: 'labtest-booking-events',
  DOCTOR_BOOKING: 'doctor-booking-events'
};

async function testProducer() {
  console.log('🚀 Testing Kafka Producer...');
  console.log('Broker:', process.env.KAFKA_BROKER || 'localhost:9092');
  
  const producer = kafka.producer();
  
  try {
    // Connect producer
    console.log('🔌 Connecting producer...');
    await producer.connect();
    console.log('✅ Producer connected');
    
    // Test message 1
    const testMessage1 = {
      eventType: 'lab_test_order_created',
      payload: {
        orderId: 'test_order_' + Date.now(),
        userId: 'user_123',
        tests: ['blood_test', 'urine_test'],
        totalAmount: 2500,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      service: 'test-script'
    };
    
    console.log('\n📤 Sending test message to labtest-booking-events...');
    console.log('Message:', JSON.stringify(testMessage1, null, 2));
    
    await producer.send({
      topic: TOPICS.LAB_TEST_BOOKING,
      messages: [
        {
          key: testMessage1.eventType,
          value: JSON.stringify(testMessage1),
          headers: {
            'test-run': 'true',
            'timestamp': new Date().toISOString()
          }
        }
      ]
    });
    
    console.log('✅ Message sent to labtest-booking-events');
    
    // Test message 2
    const testMessage2 = {
      eventType: 'doctor_appointment_booked',
      payload: {
        appointmentId: 'appt_' + Date.now(),
        patientId: 'patient_456',
        doctorId: 'doctor_789',
        date: '2024-01-15',
        time: '10:30 AM',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      service: 'test-script'
    };
    
    console.log('\n📤 Sending test message to doctor-booking-events...');
    console.log('Message:', JSON.stringify(testMessage2, null, 2));
    
    await producer.send({
      topic: TOPICS.DOCTOR_BOOKING,
      messages: [
        {
          key: testMessage2.eventType,
          value: JSON.stringify(testMessage2),
          headers: {
            'test-run': 'true',
            'timestamp': new Date().toISOString()
          }
        }
      ]
    });
    
    console.log('✅ Message sent to doctor-booking-events');
    
    console.log('\n🎉 All test messages sent successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    try {
      await producer.disconnect();
      console.log('🔌 Producer disconnected');
    } catch (disconnectError) {
      console.error('Error disconnecting:', disconnectError.message);
    }
  }
}

// Run the test
testProducer().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
