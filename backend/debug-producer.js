const { Kafka } = require('kafkajs');

async function debug() {
  console.log('🔍 Debugging Kafka connection...');
  
  const kafka = new Kafka({
    clientId: 'debug-client',
    brokers: ['localhost:9092'],
    logLevel: 1 // ERROR level
  });
  
  // Test admin connection
  console.log('\n1. Testing admin connection...');
  const admin = kafka.admin();
  try {
    await admin.connect();
    console.log('✅ Admin connected');
    
    const topics = await admin.listTopics();
    console.log(`📋 Topics: ${topics.join(', ')}`);
    
    await admin.disconnect();
    console.log('✅ Admin disconnected');
  } catch (error) {
    console.error('❌ Admin error:', error.message);
  }
  
  // Test producer connection
  console.log('\n2. Testing producer connection...');
  const producer = kafka.producer();
  try {
    await producer.connect();
    console.log('✅ Producer connected');
    
    // Try to send a message
    console.log('\n3. Testing message send...');
    await producer.send({
      topic: 'labtest-booking-events',
      messages: [
        { key: 'test', value: JSON.stringify({ test: 'message' }) }
      ]
    });
    console.log('✅ Message sent');
    
    await producer.disconnect();
    console.log('✅ Producer disconnected');
    
  } catch (error) {
    console.error('❌ Producer error:', error.message);
    console.error('Error details:', error);
  }
  
  console.log('\n🎉 Debug complete');
}

debug().catch(console.error);


