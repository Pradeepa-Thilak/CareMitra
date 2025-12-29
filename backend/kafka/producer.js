const { Kafka } = require('kafkajs');
const { TOPICS } = require('./topics');

// Create Kafka client with proper configuration
const kafka = new Kafka({
  clientId: 'caremitra-lab-service',
  brokers: ['localhost:9092'],
  connectionTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 300,
    retries: 8
  }
});

class KafkaProducer {
  constructor() {
    this.producer = null;
    this.isInitializing = false;
    this.useMock = false;
    this.events = []; 
    
    // Suppress partitioner warning
    if (!process.env.KAFKAJS_NO_PARTITIONER_WARNING) {
      process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';
    }
  }

  async initialize() {
    // If already initializing or initialized, return
    if (this.isInitializing || this.producer || this.useMock) {
      return;
    }
    
    this.isInitializing = true;
    
    try {
      console.log('Initializing Kafka producer...');
      
      // Create and connect producer
      this.producer = kafka.producer();
      await this.producer.connect();
      console.log('Kafka Producer connected successfully');
      
      // Verify connection by listing topics
      const admin = kafka.admin();
      await admin.connect();
      const topics = await admin.listTopics();
      console.log(` Found ${topics.length} topics: ${topics.join(', ')}`);
      await admin.disconnect();
      
    } catch (error) {
      console.warn(' Could not connect to Kafka:', error.message);
      
      // In development, fall back to mock
      if (process.env.NODE_ENV === 'development') {
        console.log(' Switching to mock producer for development');
        this.useMock = true;
      } else {
        // In production, re-throw
        throw new Error(`Kafka initialization failed: ${error.message}`);
      }
    } finally {
      this.isInitializing = false;
    }
  }

  // Method to check if using mock
  isUsingMock() {
    return this.useMock;
  }

  async sendMessage(topic, eventType, payload) {
    // Initialize if needed
    if (!this.producer && !this.useMock) {
      await this.initialize();
    }
    
    // If using mock, just log and store the event
    if (this.useMock) {
      const event = {
        topic,
        eventType,
        payload,
        timestamp: new Date().toISOString(),
        mock: true
      };
      
      this.events.push(event);
      
      console.log(`[MOCK] Event sent to ${topic}: ${eventType}`);
      console.log(`   Payload:`, JSON.stringify(payload, null, 2));
      
      return true;
    }

    // Real Kafka producer
    try {
      // Check if producer is connected
      if (!this.producer) {
        throw new Error('Producer not initialized');
      }
      
      const message = {
        eventType,
        payload,
        timestamp: new Date().toISOString(),
        service: 'lab-test-service'
      };

      await this.producer.send({
        topic,
        messages: [
          {
            key: eventType,
            value: JSON.stringify(message),
            headers: {
              'service': 'lab-test-service',
              'timestamp': new Date().toISOString()
            }
          }
        ]
      });

      console.log(` Kafka message sent to ${topic}: ${eventType}`);
      return true;
      
    } catch (error) {
      console.error('Kafka Producer Error:', error.message);
      
      // In development, try to reconnect once, then fall back to mock
      if (process.env.NODE_ENV === 'development') {
        console.log(' Attempting to reconnect...');
        try {
          // Try to reconnect
          this.producer = null;
          await this.initialize();
          
          // If still not using mock, retry the send
          if (!this.useMock) {
            console.log(' Retrying send after reconnect...');
            return this.sendMessage(topic, eventType, payload);
          }
        } catch (reconnectError) {
          console.log(' Could not reconnect, switching to mock');
          this.useMock = true;
          return this.sendMessage(topic, eventType, payload);
        }
      }
      
      // In production, just fail
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      
      return false;
    }
  }

  async sendLabTestEvent(eventType, payload) {
    return this.sendMessage(TOPICS.LAB_TEST_BOOKING, eventType, payload);
  }

  async sendDoctorBookingEvent(eventType, payload) {
    return this.sendMessage(TOPICS.DOCTOR_BOOKING, eventType, payload);
  }

  async disconnect() {
    if (this.useMock) {
      console.log('Mock Kafka Producer disconnected');
      return;
    }

    if (this.producer) {
      try {
        await this.producer.disconnect();
        console.log('Kafka Producer disconnected');
      } catch (error) {
        console.warn(' Error disconnecting producer:', error.message);
      } finally {
        this.producer = null;
      }
    }
  }

  // For testing/debugging
  getMockEvents() {
    return this.events;
  }

  clearMockEvents() {
    this.events = [];
  }

  isUsingMock() {
    return this.useMock;
  }
}

// Export singleton instance
const producer = new KafkaProducer();

module.exports = producer;