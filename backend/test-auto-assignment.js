// test-auto-assignment.js
const mongoose = require('mongoose');
const LabTest = require('./models/LabTest');
const LabTestOrder = require('./models/LabTestOrder');
const LabStaff = require('./models/LabStaff');
const geocoder = require('./utils/geocoder');
const labStaffController = require('./controllers/labStaffController');

async function testCompleteFlow() {
  console.log('🚀 Testing Complete Auto-Assignment Flow\n');
  console.log('='.repeat(60));

  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/caremitra', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // 1. Create a test lab staff
    console.log('\n1. Creating test lab staff...');
    const testStaff = new LabStaff({
      name: 'Test Lab Technician',
      email: 'tech@caremitra.com',
      phone: '9876543210',
      location: {
        type: 'Point',
        coordinates: [77.6067, 12.9755] // Near MG Road, Bangalore
      },
      address: {
        street: 'MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001'
      },
      isActive: true,
      isAvailable: true
    });
    await testStaff.save();
    console.log(`✅ Created staff: ${testStaff.name} (ID: ${testStaff._id})`);

    // 2. Create a test lab test
    console.log('\n2. Creating test lab test...');
    const testLabTest = new LabTest({
      name: 'Complete Blood Count (CBC)',
      price: 500,
      finalPrice: 400,
      category: 'blood_test',
      isActive: true
    });
    await testLabTest.save();
    console.log(`✅ Created test: ${testLabTest.name} (ID: ${testLabTest._id})`);

    // 3. Test geocoding
    console.log('\n3. Testing geocoding...');
    const address = "MG Road, Bangalore";
    const pincode = "560001";
    
    const geocodeResult = await geocoder.geocode(address, pincode);
    console.log(`📍 Geocoding result:`);
    console.log(`   Coordinates: ${geocodeResult.coordinates.join(', ')}`);
    console.log(`   Accuracy: ${geocodeResult.accuracy}`);
    console.log(`   Source: ${geocodeResult.source}`);

    // 4. Create a test order
    console.log('\n4. Creating test order...');
    const testOrder = new LabTestOrder({
      user: new mongoose.Types.ObjectId(), // Mock user ID
      tests: [{
        testId: testLabTest._id,
        name: testLabTest.name,
        price: testLabTest.finalPrice || testLabTest.price
      }],
      totalAmount: 400,
      sampleCollectionDetails: {
        name: 'Test Patient',
        phone: '1234567890',
        address: address,
        pincode: pincode,
        date: new Date(),
        time: '10:00 AM',
        location: {
          type: 'Point',
          coordinates: geocodeResult.coordinates
        }
      },
      razorpayOrderId: `test_order_${Date.now()}`,
      paymentStatus: 'paid'
    });

    await testOrder.save();
    console.log(`✅ Created order: ${testOrder._id}`);
    console.log(`   Location: ${testOrder.sampleCollectionDetails.location.coordinates.join(', ')}`);

    // 5. Test auto-assignment
    console.log('\n5. Testing auto-assignment...');
    console.log('   Searching for nearest available staff...');
    
    const assignmentResult = await labStaffController.autoAssignOrderToStaff(testOrder._id);
    
    if (assignmentResult) {
      console.log(`✅ Auto-assignment SUCCESSFUL!`);
      console.log(`   Staff: ${assignmentResult.staff.name}`);
      console.log(`   Distance: ${assignmentResult.distance} km`);
      console.log(`   Staff Location: ${assignmentResult.staff.location.coordinates.join(', ')}`);
      console.log(`   Patient Location: ${testOrder.sampleCollectionDetails.location.coordinates.join(', ')}`);
      
      // Check if order was updated
      const updatedOrder = await LabTestOrder.findById(testOrder._id);
      console.log(`\n   Order updated with staff assignment:`, {
        staffAssigned: !!updatedOrder.assignedStaff,
        staffName: updatedOrder.assignedStaff?.staffName,
        autoAssigned: updatedOrder.assignedStaff?.autoAssigned,
        distanceKm: updatedOrder.assignedStaff?.distanceKm
      });
    } else {
      console.log('❌ Auto-assignment FAILED: No available staff found');
    }

    // 6. Test MongoDB geospatial query directly
    console.log('\n6. Testing MongoDB geospatial query...');
    const patientCoords = testOrder.sampleCollectionDetails.location.coordinates;
    
    const nearbyStaff = await LabStaff.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: patientCoords
          },
          distanceField: "distance",
          maxDistance: 10000, // 10km in meters
          spherical: true,
          query: {
            isActive: true,
            isAvailable: true
          }
        }
      },
      {
        $sort: { distance: 1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          distance: 1,
          distanceKm: { $divide: ["$distance", 1000] },
          isAvailable: 1
        }
      }
    ]);

    console.log(`   Found ${nearbyStaff.length} nearby staff:`);
    nearbyStaff.forEach((staff, index) => {
      console.log(`   ${index + 1}. ${staff.name} - ${staff.distanceKm.toFixed(2)} km`);
    });

    // 7. Cleanup test data
    console.log('\n7. Cleaning up test data...');
    await LabStaff.deleteOne({ _id: testStaff._id });
    await LabTest.deleteOne({ _id: testLabTest._id });
    await LabTestOrder.deleteOne({ _id: testOrder._id });
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
    console.log('\n🎉 Test completed!');
  }
}

// Run the test
testCompleteFlow();