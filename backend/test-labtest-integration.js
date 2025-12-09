const kafkaProducer = require('./kafka/producer');
const { EVENT_TYPES } = require('./kafka/topics');

async function testAllEvents() {
  console.log('🧪 Testing Lab Test Kafka Events Integration');
  console.log('='.repeat(60));
  
  const testOrderId = 'test-order-123456';
  const testUserId = 'user-789';
  const testPatientName = 'John Doe';
  
  const events = [
    {
      type: EVENT_TYPES.LAB_TEST_ORDER_CREATED,
      payload: {
        orderId: testOrderId,
        userId: testUserId,
        patientName: testPatientName,
        tests: [
          { testId: 'blood-test-1', name: 'Complete Blood Count', price: 500 },
          { testId: 'urine-test-1', name: 'Urine Routine', price: 300 }
        ],
        totalAmount: 800,
        sampleCollectionDetails: {
          name: testPatientName,
          phone: '9876543210',
          address: '123 Test Street',
          date: '2024-01-15',
          time: '10:00 AM'
        },
        prescriptionUploaded: true,
        timestamp: new Date().toISOString()
      }
    },
    {
      type: EVENT_TYPES.LAB_TEST_PAYMENT_VERIFIED,
      payload: {
        orderId: testOrderId,
        userId: testUserId,
        patientName: testPatientName,
        paymentId: 'pay_123456789',
        amount: 800,
        paymentMethod: 'razorpay',
        timestamp: new Date().toISOString()
      }
    },
    {
      type: EVENT_TYPES.LAB_TEST_SAMPLE_COLLECTED,
      payload: {
        orderId: testOrderId,
        userId: testUserId,
        patientName: testPatientName,
        collectedBy: 'Phlebotomist Staff',
        collectionTime: new Date().toISOString(),
        timestamp: new Date().toISOString()
      }
    },
    {
      type: EVENT_TYPES.LAB_TEST_REPORT_UPLOADED,
      payload: {
        orderId: testOrderId,
        userId: testUserId,
        patientName: testPatientName,
        reportId: 'report-789',
        reportFileName: 'blood_test_report.pdf',
        reportFileType: 'application/pdf',
        reportSize: 1024576,
        timestamp: new Date().toISOString()
      }
    }
  ];
  
  let successCount = 0;
  
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    console.log(`\n${i + 1}. Testing: ${event.type}`);
    console.log('-'.repeat(40));
    
    try {
      const result = await kafkaProducer.sendLabTestEvent(event.type, event.payload);
      if (result) {
        console.log(`✅ Event sent successfully`);
        successCount++;
      } else {
        console.log(`❌ Failed to send event`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    // Small delay between events
    if (i < events.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Results: ${successCount}/${events.length} events sent successfully`);
  
  // Check mode
  if (kafkaProducer.isUsingMock && kafkaProducer.isUsingMock()) {
    console.log('🔄 Running in MOCK mode');
    const mockEvents = kafkaProducer.getMockEvents ? kafkaProducer.getMockEvents() : [];
    console.log(`📋 Mock events stored: ${mockEvents.length}`);
  } else {
    console.log('🚀 Running with REAL Kafka');
  }
  
  // Clean up
  await kafkaProducer.disconnect();
  console.log('\n🎉 Integration test complete!');
}

testAllEvents().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});


