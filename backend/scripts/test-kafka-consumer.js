const { Kafka } = require('kafkajs');

// Create Kafka client
const kafka = new Kafka({
  clientId: 'caremitra-test-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const TOPICS = {
  LAB_TEST_BOOKING: 'labtest-booking-events',
  DOCTOR_BOOKING: 'doctor-booking-events'
};

async function testConsumer() {
  console.log('🚀 Testing Kafka Consumer...');
  console.log('Broker:', process.env.KAFKA_BROKER || 'localhost:9092');
  console.log('Group ID: test-consumer-group-' + Date.now());
  
  const consumer = kafka.consumer({ 
    groupId: 'test-consumer-group-' + Date.now(),
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    maxBytesPerPartition: 1048576 // 1MB
  });
  
  // Counter for messages
  let messageCount = 0;
  const maxMessages = 5;
  const timeoutMs = 30000; // 30 seconds timeout
  
  // Set timeout to auto-exit
  const timeoutId = setTimeout(async () => {
    console.log('\n⏰ Timeout reached (30 seconds). Stopping consumer...');
    try {
      await consumer.disconnect();
      console.log('✅ Consumer stopped due to timeout');
    } catch (error) {
      console.error('Error stopping consumer:', error.message);
    }
    process.exit(0);
  }, timeoutMs);
  
  try {
    // Connect consumer
    console.log('🔌 Connecting consumer...');
    await consumer.connect();
    console.log('✅ Consumer connected');
    
    // Subscribe to topics
    console.log('\n👂 Subscribing to topics...');
    await consumer.subscribe({ 
      topic: TOPICS.LAB_TEST_BOOKING,
      fromBeginning: false 
    });
    
    await consumer.subscribe({ 
      topic: TOPICS.DOCTOR_BOOKING,
      fromBeginning: false 
    });
    
    console.log('✅ Subscribed to topics:');
    console.log('   -', TOPICS.LAB_TEST_BOOKING);
    console.log('   -', TOPICS.DOCTOR_BOOKING);
    
    console.log('\n📥 Listening for messages... (Press Ctrl+C to stop)');
    console.log('Will stop after', maxMessages, 'messages or 30 seconds\n');
    
    // Start consuming
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        messageCount++;
        
        console.log('='.repeat(50));
        console.log(`📥 Message #${messageCount} received`);
        console.log('='.repeat(50));
        console.log('Topic:', topic);
        console.log('Partition:', partition);
        console.log('Offset:', message.offset);
        console.log('Key:', message.key?.toString());
        console.log('Headers:', message.headers);
        console.log('Timestamp:', message.timestamp);
        
        try {
          const value = JSON.parse(message.value.toString());
          console.log('\n📝 Message Content:');
          console.log(JSON.stringify(value, null, 2));
        } catch (parseError) {
          console.log('\n📝 Raw Message Value:');
          console.log(message.value.toString());
        }
        
        console.log('\n');
        
        // Stop after max messages
        if (messageCount >= maxMessages) {
          console.log(`🎯 Received ${maxMessages} messages. Stopping consumer...`);
          clearTimeout(timeoutId);
          try {
            await consumer.disconnect();
            console.log('✅ Consumer stopped');
            process.exit(0);
          } catch (error) {
            console.error('Error stopping consumer:', error.message);
            process.exit(0);
          }
        }
      },
      
      eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
        // This is optional, using eachMessage instead
      }
    });
    
    // Keep the process alive
    console.log('🔄 Consumer is running...');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n🔄 Received SIGINT. Disconnecting consumer...');
      clearTimeout(timeoutId);
      try {
        await consumer.disconnect();
        console.log('✅ Consumer disconnected');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error.message);
        process.exit(1);
      }
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n\n🔄 Received SIGTERM. Disconnecting consumer...');
      clearTimeout(timeoutId);
      try {
        await consumer.disconnect();
        console.log('✅ Consumer disconnected');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error.message);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    clearTimeout(timeoutId);
    process.exit(1);
  }
}

// Run the test
testConsumer().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
