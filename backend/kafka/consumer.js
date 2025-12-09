// kafka/consumer.js
const { Kafka } = require('kafkajs');
const { TOPICS, EVENT_TYPES } = require('./topics');
const emailHandlers = require('./emailHandlers'); // ADD THIS LINE

class KafkaConsumer {
  constructor() {
    this.consumer = null;
    this.isRunning = false;
  }

  async connect() {
    if (this.consumer) return;
    
    const kafka = new Kafka({
      clientId: 'caremitra-consumer',
      brokers: ['localhost:9092']
    });
    
    this.consumer = kafka.consumer({ 
      groupId: 'lab-test-consumer-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });
    
    await this.consumer.connect();
    console.log('✅ Kafka Consumer connected');
  }

  async disconnect() {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.consumer = null;
      this.isRunning = false;
      console.log('🔌 Kafka Consumer disconnected');
    }
  }

  async subscribeToLabTestEvents() {
    await this.connect();
    
    await this.consumer.subscribe({ 
      topic: TOPICS.LAB_TEST_BOOKING,
      fromBeginning: false 
    });
    
    await this.consumer.subscribe({ 
      topic: TOPICS.DOCTOR_BOOKING,
      fromBeginning: false 
    });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`📥 Received event: ${event.eventType} from ${topic}`);
          
          // Use email handlers based on event type
          if (topic === TOPICS.LAB_TEST_BOOKING) {
            await this.handleLabTestEvent(event);
          } else if (topic === TOPICS.DOCTOR_BOOKING) {
            await this.handleDoctorBookingEvent(event);
          }
        } catch (error) {
          console.error('❌ Error processing Kafka message:', error);
        }
      }
    });

    this.isRunning = true;
    console.log('👂 Listening for Kafka events...');
  }

  async handleLabTestEvent(event) {
    switch (event.eventType) {
      case EVENT_TYPES.LAB_TEST_ORDER_CREATED:
        console.log('📧 Handling lab test order created');
        await emailHandlers.handleLabTestOrderCreated(event.payload);
        break;
        
      case EVENT_TYPES.LAB_TEST_PAYMENT_VERIFIED:
        console.log('💰 Handling payment verified');
        await emailHandlers.handleLabTestPaymentVerified(event.payload);
        break;
        
      case EVENT_TYPES.LAB_TEST_SAMPLE_COLLECTED:
        console.log('🧪 Handling sample collected');
        await emailHandlers.handleLabTestSampleCollected(event.payload);
        break;
        
      case EVENT_TYPES.LAB_TEST_REPORT_UPLOADED:
        console.log('📄 Handling report uploaded');
        await emailHandlers.handleLabTestReportUploaded(event.payload);
        break;
        
      case EVENT_TYPES.LAB_ORDER_ASSIGNMENT_FAILED:
        console.log('⚠️ Handling assignment failed');
        await emailHandlers.handleLabOrderAssignmentFailed(event.payload);
        break;
        
      case EVENT_TYPES.LAB_ORDER_AUTO_ASSIGNED:
        console.log('🤖 Handling auto assigned');
        await emailHandlers.handleLabOrderAutoAssigned(event.payload);
        break;
        
      case EVENT_TYPES.LAB_STAFF_CREATED:
        console.log('👨‍⚕️ Handling staff created');
        await emailHandlers.handleLabStaffCreated(event.payload);
        break;
        
      default:
        console.log(`Unhandled lab test event: ${event.eventType}`);
    }
  }

  async handleDoctorBookingEvent(event) {
    switch (event.eventType) {
      case EVENT_TYPES.DOCTOR_APPOINTMENT_BOOKED:
        console.log('📅 Handling doctor appointment booked');
        await emailHandlers.handleDoctorAppointmentBooked(event.payload);
        break;
        
      case EVENT_TYPES.DOCTOR_APPOINTMENT_CANCELLED:
        console.log('❌ Handling doctor appointment cancelled');
        await emailHandlers.handleDoctorAppointmentCancelled(event.payload);
        break;
        
      default:
        console.log(`Unhandled doctor booking event: ${event.eventType}`);
    }
  }

  isConnected() {
    return this.consumer !== null;
  }
}

// Create and export singleton instance
const kafkaConsumer = new KafkaConsumer();

module.exports = kafkaConsumer;