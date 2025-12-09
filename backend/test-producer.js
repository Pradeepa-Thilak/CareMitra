const producer = require('./kafka/producer');

async function test() {
  console.log('🚀 Testing Kafka Producer...');
  
  try {
    // Test sending an event
    const result = await producer.sendLabTestEvent('test_event', {
      message: 'Test message',
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ Event sent successfully: ${result}`);
    
    // Check if using mock
    if (producer.isUsingMock()) {
      console.log('ℹ️  Running in mock mode');
      const events = producer.getMockEvents();
      console.log(`📋 Stored ${events.length} mock events`);
    } else {
      console.log('✅ Running with real Kafka');
    }
    
    // Clean up
    await producer.disconnect();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

test();