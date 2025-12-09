const { Kafka } = require('kafkajs');

async function testConnection() {
  console.log('🔍 Testing kafkajs connection...');
  
  // Try different configurations
  const configs = [
    {
      name: 'Default config',
      config: {
        clientId: 'test-client',
        brokers: ['localhost:9092']
      }
    },
    {
      name: 'With longer timeout',
      config: {
        clientId: 'test-client',
        brokers: ['localhost:9092'],
        connectionTimeout: 10000,
        requestTimeout: 30000
      }
    },
    {
      name: 'With IP address',
      config: {
        clientId: 'test-client',
        brokers: ['127.0.0.1:9092']
      }
    },
    {
      name: 'With retry config',
      config: {
        clientId: 'test-client',
        brokers: ['localhost:9092'],
        retry: {
          initialRetryTime: 100,
          retries: 5
        }
      }
    }
  ];
  
  for (const config of configs) {
    console.log(`\n📋 Testing: ${config.name}`);
    console.log(`   Brokers: ${config.config.brokers.join(', ')}`);
    
    try {
      const kafka = new Kafka(config.config);
      const admin = kafka.admin();
      
      // Try to connect
      console.log('   Connecting...');
      await admin.connect();
      console.log('   ✅ Connected successfully!');
      
      // List topics
      const topics = await admin.listTopics();
      console.log(`   📋 Topics found: ${topics.length}`);
      topics.forEach(topic => console.log(`      - ${topic}`));
      
      await admin.disconnect();
      console.log('   🔌 Disconnected');
      
      // If this works, we found the right config
      console.log(`\n🎉 Success with ${config.name}!`);
      return config.config;
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      if (error.code) console.log(`   Error code: ${error.code}`);
      if (error.retriable) console.log(`   Retriable: ${error.retriable}`);
    }
  }
  
  console.log('\n❌ All configurations failed');
  return null;
}

async function main() {
  console.log('====================================');
  console.log('   kafkajs Connection Test         ');
  console.log('====================================\n');
  
  const workingConfig = await testConnection();
  
  if (workingConfig) {
    console.log('\n✅ Working configuration found!');
    console.log('Use this in your kafka.config.js:');
    console.log(JSON.stringify(workingConfig, null, 2));
  } else {
    console.log('\n❌ No configuration worked');
    console.log('\nPossible issues:');
    console.log('1. Kafka version mismatch');
    console.log('2. kafkajs version issue');
    console.log('3. Network policy blocking connections');
    console.log('4. Kafka needs SASL/SSL configuration');
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
