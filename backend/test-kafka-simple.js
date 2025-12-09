
const kafkaProducer = require('./kafka/producer');

async function test() {
  console.log('Testing Kafka Producer...');
  
  try {
    // Send a test message
    const result = await kafkaProducer.sendLabTestEvent('test_event', {
      message: 'Test from server.js',
      timestamp: new Date().toISOString()
    });
    
    console.log('Result:', result ? '✅ Success' : '❌ Failed');
    
    // Disconnect
    await kafkaProducer.disconnect();
    console.log('Disconnected');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
