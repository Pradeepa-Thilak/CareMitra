const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function createTopicsViaDocker() {
  console.log('🚀 Creating Kafka topics using Docker exec...');
  
  try {
    // Check if Kafka container is running
    const { stdout: containers } = await execAsync('docker ps --filter name=kafka --format "{{.Names}}"');
    
    if (!containers.includes('kafka')) {
      console.error('❌ Kafka container is not running');
      return false;
    }
    
    const topics = [
      'labtest-booking-events',
      'doctor-booking-events'
    ];
    
    for (const topic of topics) {
      console.log(`📝 Creating topic: ${topic}`);
      
      try {
        const { stdout, stderr } = await execAsync(
          `docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic ${topic} --partitions 3 --replication-factor 1 --if-not-exists`
        );
        
        if (stderr && !stderr.includes('already exists')) {
          console.error(`❌ Error creating ${topic}:`, stderr);
        } else {
          console.log(`✅ Topic ${topic} created or already exists`);
        }
      } catch (error) {
        if (error.stderr && error.stderr.includes('already exists')) {
          console.log(`ℹ️  Topic ${topic} already exists`);
        } else {
          console.error(`❌ Failed to create ${topic}:`, error.message);
        }
      }
    }
    
    // List all topics
    console.log('\n📋 Listing all topics:');
    const { stdout: topicsList } = await execAsync(
      'docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list'
    );
    console.log(topicsList);
    
    return true;
    
  } catch (error) {
    console.error('❌ General error:', error.message);
    return false;
  }
}

async function testKafkaConnection() {
  console.log('🔍 Testing Kafka connection...');
  
  try {
    // Simple TCP connection test
    const { stdout } = await execAsync('timeout 5 bash -c "cat < /dev/null > /dev/tcp/localhost/9092" && echo "Port 9092 is open" || echo "Port 9092 is closed"');
    console.log(stdout.trim());
    
    // Check from inside container
    const { stdout: containerTest } = await execAsync('docker exec kafka bash -c "echo "" | nc -z localhost 9092 && echo Kafka is up inside container || echo Kafka is down inside container"');
    console.log(containerTest.trim());
    
    return true;
  } catch (error) {
    console.error('Connection test error:', error.message);
    return false;
  }
}

async function main() {
  console.log('====================================');
  console.log('   Kafka Topic Creation (Fixed)    ');
  console.log('====================================\n');
  
  // Test connection
  await testKafkaConnection();
  
  console.log('\n--- Creating Topics ---');
  const success = await createTopicsViaDocker();
  
  if (success) {
    console.log('\n🎉 Topics created successfully!');
    console.log('\nNext steps:');
    console.log('1. Test producer: npm run kafka:producer-test');
    console.log('2. Test consumer: npm run kafka:consumer-test');
    console.log('3. Start your app: npm run dev');
  } else {
    console.log('\n❌ Failed to create topics');
  }
}

// Run the script
main().catch(console.error);
