const net = require('net');

function testPort(host, port, timeout = 5000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function main() {
  console.log('🔍 Testing Kafka connection from Node.js...');
  
  const isReachable = await testPort('localhost', 9092);
  
  if (isReachable) {
    console.log('✅ Port 9092 is reachable from Node.js');
    
    // Now test with kafkajs
    const { Kafka } = require('kafkajs');
    
    const kafka = new Kafka({
      clientId: 'test-client',
      brokers: ['localhost:9092'],
      connectionTimeout: 10000,
      requestTimeout: 30000,
      logLevel: 1 // ERROR level
    });
    
    const admin = kafka.admin();
    
    try {
      console.log('Attempting to connect with kafkajs...');
      await admin.connect();
      console.log('✅ Connected successfully with kafkajs!');
      
      const topics = await admin.listTopics();
      console.log('📋 Topics:', topics);
      
      await admin.disconnect();
      
    } catch (error) {
      console.error('❌ kafkajs connection failed:', error.message);
      console.log('Error details:', error);
    }
    
  } else {
    console.log('❌ Port 9092 is NOT reachable from Node.js');
    console.log('\nPossible issues:');
    console.log('1. Firewall blocking port 9092');
    console.log('2. Docker container not exposing port correctly');
    console.log('3. Kafka not binding to 0.0.0.0');
    
    // Check Docker port mapping
    console.log('\nChecking Docker port mapping...');
    const { exec } = require('child_process');
    exec('docker port kafka', (error, stdout, stderr) => {
      if (error) {
        console.error('Error checking Docker ports:', error.message);
      } else {
        console.log('Docker port mapping:', stdout);
      }
    });
  }
}

main();
