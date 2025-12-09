// test-api-endpoints.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🚀 Testing CareMitra API Endpoints\n');
  console.log('='.repeat(60));

  try {
    // 1. Get auth token (you'll need to login first)
    console.log('1. Getting authentication token...');
    // This depends on your auth system
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzI3MTIwOGYxM2JmYzU2Zjk3ZDc3NSIsImVtYWlsIjoiamFuYWtpLnJhbWFuQGZpbmVzdGNvZGVyLmNvbSIsInJvbGUiOiJwYXRpZW50IiwiaWF0IjoxNzY0OTEzNDQwLCJleHAiOjE3NjU1MTgyNDB9.20MziJz_vsBHnyzdILlepgQvUUwio9gzPqFp6Io07zM'; // Replace with actual token
    
    // 2. Get available lab tests
    console.log('\n2. Fetching available lab tests...');
    const testsResponse = await axios.get(`${BASE_URL}/lab-tests`);
    console.log(`✅ Found ${testsResponse.data.count} lab tests`);
    
    if (testsResponse.data.data.length > 0) {
      const testId = testsResponse.data.data[0]._id;
      console.log(`   First test: ${testsResponse.data.data[0].name} (ID: ${testId})`);
      
      // 3. Create a lab test order with address
      console.log('\n3. Creating lab test order with address...');
      const orderData = {
        testIds: [testId],
        sampleCollectionDetails: {
          name: "API Test User",
          phone: "9876543210",
          address: "MG Road, Bangalore",
          pincode: "560001",
          date: new Date().toISOString().split('T')[0],
          time: "10:00 AM"
        }
      };
      
      console.log('   Order data:', JSON.stringify(orderData, null, 2));
      
      // Note: You need to handle file upload separately
      const formData = new FormData();
      formData.append('testIds', JSON.stringify([testId]));
      formData.append('sampleCollectionDetails', JSON.stringify(orderData.sampleCollectionDetails));
      
      // This is a simplified version - you'd need proper FormData in Node.js
      console.log('⚠️  Note: For actual testing, use Postman or browser with file upload');
      
      // 4. Check if staff was auto-assigned
      console.log('\n4. Checking Kafka events...');
      try {
        const kafkaResponse = await axios.get(`${BASE_URL}/api/kafka/status`);
        console.log(`✅ Kafka status: ${kafkaResponse.data.kafkaStatus}`);
        console.log(`📋 Topics: ${kafkaResponse.data.topics?.join(', ')}`);
      } catch (kafkaError) {
        console.log('⚠️  Kafka status endpoint not available');
      }
      
      // 5. Check lab staff
      console.log('\n5. Checking lab staff...');
      try {
        const staffResponse = await axios.get(`${BASE_URL}/admin/staff`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${staffResponse.data.count} lab staff`);
        if (staffResponse.data.data.length > 0) {
          console.log('   Available staff:');
          staffResponse.data.data.forEach((staff, i) => {
            console.log(`   ${i + 1}. ${staff.name} - ${staff.isAvailable ? '✅ Available' : '❌ Busy'}`);
          });
        }
      } catch (staffError) {
        console.log('⚠️  Could not fetch staff (admin endpoint may require admin token)');
      }
      
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📝 Test Instructions:');
  console.log('1. Start your server: npm run dev');
  console.log('2. Use Postman to test the API:');
  console.log('   POST http://localhost:5000/lab-tests/order');
  console.log('   Body (form-data):');
  console.log('     - testIds: ["your_test_id"]');
  console.log('     - sampleCollectionDetails: JSON with address & pincode');
  console.log('     - prescription: file (optional)');
  console.log('3. Check Kafka UI: http://localhost:8080');
  console.log('4. Watch for LAB_ORDER_AUTO_ASSIGNED events');
}

testAPI();