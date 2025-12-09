const { Kafka } = require('kafkajs');

// Try different broker addresses
const brokerAddresses = [
  'localhost:9092',
  '127.0.0.1:9092',
  '0.0.0.0:9092'
];

// Find working broker
function getBrokers() {
  // Use localhost first, fall back to others
  return ['localhost:9092'];
}

const kafka = new Kafka({
  clientId: 'caremitra-lab-service',
  brokers: getBrokers(),
  connectionTimeout: 10000, // Increased timeout
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 300,
    retries: 8,
    maxRetryTime: 30000,
    retryableErrors: [
      'CONNECTION_ERROR',
      'NETWORK_EXCEPTION',
      'NOT_CONTROLLER',
      'REQUEST_TIMED_OUT'
    ]
  },
  // Disable SSL for local development
  ssl: false,
  sasl: null
});

// Test connection on initialization
async function testConnection() {
  const admin = kafka.admin();
  try {
    await admin.connect();
    console.log('✅ Kafka connection test successful');
    const topics = await admin.listTopics();
    console.log(`📋 Found ${topics.length} topics:`, topics);
    await admin.disconnect();
    return true;
  } catch (error) {
    console.warn('⚠️  Kafka connection test failed:', error.message);
    console.log('Will continue with mock producer in development mode');
    return false;
  }
}

module.exports = { 
  kafka,
  testConnection 
};
