const { Kafka } = require('kafkajs');

// Create Kafka client
const kafka = new Kafka({
  clientId: 'caremitra-admin',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const TOPICS = {
  LAB_TEST_BOOKING: 'labtest-booking-events',
  DOCTOR_BOOKING: 'doctor-booking-events'
};

async function createTopics() {
  const admin = kafka.admin();
  
  try {
    console.log('🚀 Connecting to Kafka...');
    await admin.connect();
    console.log('✅ Connected to Kafka');
    
    console.log('📝 Creating topics...');
    
    const topicConfigs = [
      {
        topic: TOPICS.LAB_TEST_BOOKING,
        numPartitions: 3,
        replicationFactor: 1,
        configEntries: [
          { name: 'retention.ms', value: '604800000' }, // 7 days
          { name: 'cleanup.policy', value: 'delete' }
        ]
      },
      {
        topic: TOPICS.DOCTOR_BOOKING,
        numPartitions: 3,
        replicationFactor: 1,
        configEntries: [
          { name: 'retention.ms', value: '604800000' },
          { name: 'cleanup.policy', value: 'delete' }
        ]
      }
    ];
    
    // Create topics
    const createResult = await admin.createTopics({
      topics: topicConfigs,
      waitForLeaders: true,
      timeout: 30000
    });
    
    console.log('✅ Topics created successfully!');
    console.log('Creation result:', createResult);
    
    // List all topics to verify
    console.log('📋 Listing all topics...');
    const topics = await admin.listTopics();
    console.log('Available topics:', topics);
    
    // Get topic metadata
    const topicMetadata = await admin.fetchTopicMetadata({ topics });
    console.log('📊 Topic metadata:', JSON.stringify(topicMetadata, null, 2));
    
  } catch (error) {
    console.error('❌ Error creating topics:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.retriable) console.error('Is retriable:', error.retriable);
    
    // Try to list existing topics
    try {
      console.log('🔍 Trying to list existing topics...');
      const existingTopics = await admin.listTopics();
      console.log('Existing topics:', existingTopics);
    } catch (listError) {
      console.error('Could not list topics:', listError.message);
    }
  } finally {
    try {
      await admin.disconnect();
      console.log('🔌 Admin disconnected');
    } catch (disconnectError) {
      console.error('Error disconnecting:', disconnectError.message);
    }
  }
}

// Check if Kafka is running
async function checkKafkaConnection() {
  console.log('🔍 Checking Kafka connection...');
  console.log('KAFKA_BROKER:', process.env.KAFKA_BROKER || 'localhost:9092');
  
  const admin = kafka.admin();
  try {
    await admin.connect();
    console.log('✅ Kafka is reachable');
    await admin.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Cannot connect to Kafka:', error.message);
    console.log('\n⚠️  Troubleshooting tips:');
    console.log('1. Make sure Docker is running: docker ps');
    console.log('2. Make sure Kafka is running: docker-compose -f docker-compose-kafka.yml up -d');
    console.log('3. Check Kafka logs: docker logs kafka');
    console.log('4. Test connection: nc -z localhost 9092');
    return false;
  }
}

// Main execution
async function main() {
  console.log('====================================');
  console.log('   Kafka Topic Creation Script     ');
  console.log('====================================');
  
  // Check connection first
  const isConnected = await checkKafkaConnection();
  
  if (!isConnected) {
    console.log('\n❌ Cannot proceed without Kafka connection.');
    console.log('Please start Kafka first and try again.');
    console.log('\nStart Kafka with: docker-compose -f docker-compose-kafka.yml up -d');
    return;
  }
  
  // Create topics
  await createTopics();
  
  console.log('\n====================================');
  console.log('       Script Completed            ');
  console.log('====================================');
  console.log('\n📊 You can view topics at: http://localhost:8080');
  console.log('👂 Test consumer: npm run kafka:consumer-test');
  console.log('📤 Test producer: npm run kafka:producer-test');
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
