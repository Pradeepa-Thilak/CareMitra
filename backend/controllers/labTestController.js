const LabTest = require('../models/LabTest');
const LabTestOrder = require('../models/LabTestOrder');
const { razorpay ,verifyPaymentSignature } = require('../config/razorpay');
const { sendGeneralEmail } = require('../utils/sendEmail');
const ReportFile = require("../models/ReportFile");
const kafkaProducer = require('../kafka/producer');
const { EVENT_TYPES } = require('../kafka/topics');
const labStaffController = require('./labStaffController');
const axios = require('axios');
const geocoder = require('../utils/geocoder');
const Patient = require('../models/Patient');

const sendLabOrderConfirmation = async (order) => {
  try {
    const patientEmail = order.patientDetails?.email;
    const patientName = order.patientDetails?.name || 'Patient';
    const orderIdShort = order._id.toString().slice(-8).toUpperCase();
    
    const subject = `Lab Test Order Confirmed - #${orderIdShort}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #059669; text-align: center; margin-bottom: 20px;">🩺 Lab Test Order Confirmed!</h2>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="color: #047857; font-size: 16px;">Hello <strong>${patientName}</strong>,</p>
          <p style="color: #374151;">Your lab test order has been successfully booked.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #059669;">📋 Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Order ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${orderIdShort}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Total Amount:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">₹${order.totalAmount || 0}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>Status:</strong></td>
                <td style="padding: 8px; color: #059669; font-weight: bold;">CONFIRMED</td>
              </tr>
            </table>
          </div>

          <p style="color: #374151;">
            A technician will be assigned shortly and will contact you before arrival.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Track Your Order
          </a>
        </div>

        <p style="color: #64748b; font-size: 12px; text-align: center;">
          For queries, contact: lab.support@caremitra.com | 1800-XXX-XXXX
        </p>
      </div>
    `;

    const result = await sendGeneralEmail(patientEmail, subject, html);
    console.log('Lab order confirmation email sent:', result.success ? 'SUCCESS' : 'FAILED');
    return result;
    
  } catch (error) {
    console.error('Error sending lab order confirmation:', error);
    return { success: false, error: error.message };
  }
};


async function geocodeAddress(address, pincode) {
  try {
    // Using OpenStreetMap Nominatim (FREE, no API key needed)
    const searchQuery = `${address}, ${pincode}, India`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
      {
        headers: {
          'User-Agent': 'CareMitra-Healthcare-App/1.0' // Required by Nominatim
        }
      }
    );

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return {
        type: 'Point',
        coordinates: [parseFloat(lon), parseFloat(lat)] // [longitude, latitude]
      };
    }
    
    // Fallback: Return default coordinates (center of India)
    return {
      type: 'Point',
      coordinates: [78.9629, 20.5937] // Default India coordinates
    };
    
  } catch (error) {
    console.error('Geocoding error:', error.message);
    // Return default coordinates on error
    return {
      type: 'Point',
      coordinates: [78.9629, 20.5937]
    };
  }
}


exports.createOrder = async (req, res) => {
  try {
    console.log("=== ORDER CREATION STARTED ===");
    
    let { testIds, sampleCollectionDetails } = req.body;

       // Parse testIds
    let parsedTestIds;
    if (typeof testIds === 'string') {
      try {
        parsedTestIds = JSON.parse(testIds);
      } catch (err) {
        console.error("Failed to parse testIds as JSON:", err.message);
        parsedTestIds = [testIds.trim()];
      }
    } else {
      parsedTestIds = testIds;
    }

    if (!parsedTestIds || !Array.isArray(parsedTestIds) || parsedTestIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one test ID is required' 
      });
    }

    // Parse sampleCollectionDetails
    let parsedSampleDetails;
    if (typeof sampleCollectionDetails === "string") {
      try {
        parsedSampleDetails = JSON.parse(sampleCollectionDetails);
      } catch (err) {
        console.error("Failed to parse sampleCollectionDetails:", err.message);
        parsedSampleDetails = sampleCollectionDetails;
      }
    } else {
      parsedSampleDetails = sampleCollectionDetails;
    }

    if (!parsedSampleDetails || typeof parsedSampleDetails !== 'object') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid sample collection details' 
      });
    }

    // Geocode address if available
    let location = { type: 'Point', coordinates: [0, 0] };
    if (parsedSampleDetails.address && parsedSampleDetails.pincode) {
      try {
        const geocodeResult = await geocoder.geocode(
          parsedSampleDetails.address,
          parsedSampleDetails.pincode
        );
        location = { type: 'Point', coordinates: geocodeResult.coordinates };
      } catch (geocodeError) {
        console.error('Geocoding failed:', geocodeError.message);
      }
    }

    const sampleCollectionDetail = {
      name: parsedSampleDetails.name || 'Not Provided',
      phone: parsedSampleDetails.phone || 'Not Provided',
      address: parsedSampleDetails.address || 'Not Provided',
      pincode: parsedSampleDetails.pincode || 'Not Provided',
      date: parsedSampleDetails.date || new Date().toISOString().split('T')[0],
      time: parsedSampleDetails.time || '09:00 AM',
      location
    };

    // Fetch tests
    const tests = await LabTest.find({ _id: { $in: parsedTestIds }, isActive: true });
    if (tests.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid tests found with the provided IDs' 
      });
    }

    const testItems = tests.map(test => ({
      testId: test._id,
      name: test.name,
      price: test.finalPrice || test.price,
      originalPrice: test.price,
      discount: test.discount || 0
    }));

    const totalAmount = testItems.reduce((sum, t) => sum + t.price, 0);

    // ✅ FIXED: Create Razorpay order
    let razorpayOrderResponse;

    try {
      // Check if Razorpay keys are configured
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100),
          currency: "INR",
          receipt: `labtest_${Date.now()}`,
          notes: {
            orderType: "lab_test",
            userId: req.user.userId,
            testCount: testItems.length
          }
        });
        
        razorpayOrderResponse = {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
          created_at: razorpayOrder.created_at,
          status: razorpayOrder.status,
          key_id: process.env.RAZORPAY_KEY_ID
        };
        
        console.log("✅ Real Razorpay order created:", razorpayOrder.id);
      } else {
        throw new Error("Razorpay keys not configured");
      }
    } catch (razorpayError) {
      console.error("Razorpay order creation failed:", razorpayError.message);
      
      // Fallback to mock order
      razorpayOrderResponse = {
        id: `order_mock_${Date.now()}`,
        amount: totalAmount * 100,
        currency: 'INR',
        receipt: `lab_test_${Date.now()}`,
        created_at: Date.now(),
        status: 'created',
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX'
      };
      
      console.log("🛠️ Using mock Razorpay order");
    }

    // Create order in DB
    const labTestOrder = new LabTestOrder({
      user: req.user.userId,
      tests: testItems,
      totalAmount,
      originalTotal: testItems.reduce((sum, t) => sum + t.originalPrice, 0),
      totalDiscount: testItems.reduce((sum, t) => sum + (t.originalPrice - t.price), 0),
      patientDetails: {
        name: sampleCollectionDetails.name,
        phone: sampleCollectionDetails.phone,
        email: req.user.email
      },
      sampleCollectionDetails: sampleCollectionDetail,
      prescriptionFile: req.file ? {
        filename: req.file.originalname,
        data: req.file.buffer,
        contentType: req.file.mimetype,
        uploadDate: new Date(),
        size: req.file.size
      } : null,
      razorpayOrderId: razorpayOrderResponse.id,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      createdAt: new Date()
    });

    await labTestOrder.save();
    await labTestOrder.populate("user", "name email phone");
   
    const patient = await Patient.findById(req.user.userId);

if (!patient) {
  return res.status(404).json({ message: "Patient not found" });
}

patient.address = sampleCollectionDetail.address;
await patient.save();


    // Send confirmation email
    try { 
      await sendLabOrderConfirmation(labTestOrder, req.user); 
    } catch (e) { 
      console.error("Email error:", e.message); 
    }

    // Kafka event
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_TEST_ORDER_CREATED,
        {
          orderId: labTestOrder._id.toString(),
          userId: req.user.userId,
          patientName: req.user.name || sampleCollectionDetail.name,
          patientEmail: req.user.email,
          patientPhone: req.user.phone || sampleCollectionDetail.phone,
          tests: testItems,
          totalAmount,
          originalTotal,
          totalDiscount,
          sampleCollectionDetails: sampleCollectionDetail,
          prescriptionUploaded: !!prescriptionFileData,
          razorpayOrderId: razorpayOrderResponse.id,
          timestamp: new Date().toISOString(),
          createdAt: labTestOrder.createdAt
        }
      );
    } catch (kafkaError) { 
      console.error('Kafka error:', kafkaError.message); 
    }

    // Auto-assign staff
    labStaffController.autoAssignOrderToStaff(labTestOrder._id, req.user)
      .then(result => {
        if (result) console.log(`Auto-assigned to staff: ${result.staff.name}`);
      })
      .catch(err => console.error('Auto-assign failed:', err.message));

    // Send response
    res.status(201).json({
      success: true,
      message: 'Order created successfully! Proceed to payment.',
      data: {
        order: {
          _id: labTestOrder._id,
          orderId: labTestOrder._id.toString().slice(-8).toUpperCase(),
          tests: labTestOrder.tests.map(t => ({
            name: t.name,
            price: t.price,
            originalPrice: t.originalPrice,
            discount: t.discount
          })),
          totalAmount: labTestOrder.totalAmount,
          originalTotal: labTestOrder.originalTotal,
          totalDiscount: labTestOrder.totalDiscount,
          sampleCollectionDetails: labTestOrder.sampleCollectionDetails,
          patientDetails: labTestOrder.patientDetails,
          prescriptionFile: labTestOrder.prescriptionFile ? {
            filename: labTestOrder.prescriptionFile.filename,
            uploaded: true,
            size: labTestOrder.prescriptionFile.size
          } : null,
          paymentStatus: labTestOrder.paymentStatus,
          orderStatus: labTestOrder.orderStatus,
          assignedStaff: labTestOrder.assignedStaff || null,
          createdAt: labTestOrder.createdAt
        },
        razorpayOrder: razorpayOrderResponse,
        autoAssignment: {
          initiated: true,
          message: 'Auto-assignment in progress. You will be notified when a technician is assigned.'
        }
      }
    });

    console.log("=== ORDER CREATION COMPLETED ===");
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getAllLabTests = async (req, res) => {
  try {
    const labTests = await LabTest.find({ isActive: true }).select('-__v');
    res.json({ success: true, data: labTests, count: labTests.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching lab tests', error: error.message });
  }
};
// exports.createOrder = async (req, res) => {
//   try {
//     console.log("=== ORDER CREATION STARTED ===");
//     console.log("Request Body:", req.body);
//     console.log("Request File:", req.file ? {
//       originalname: req.file.originalname,
//       mimetype: req.file.mimetype,
//       size: req.file.size
//     } : "No file");

//     let { testIds, sampleCollectionDetails } = req.body;

//     // Parse testIds
//     let parsedTestIds;
//     if (typeof testIds === 'string') {
//       if (testIds.startsWith('[') && testIds.endsWith(']')) {
//         parsedTestIds = testIds.slice(1, -1).split(',').map(id =>
//           id.trim().replace(/"/g, '').replace(/'/g, '')
//         );
//       } else {
//         parsedTestIds = [testIds.trim()];
//       }
//     } else {
//       parsedTestIds = testIds;
//     }

//     if (!parsedTestIds || !Array.isArray(parsedTestIds) || parsedTestIds.length === 0) {
//       return res.status(400).json({ success: false, message: 'At least one test ID is required' });
//     }

//     // Parse sampleCollectionDetails
// let parsedSampleDetails = sampleCollectionDetails;
// if (typeof sampleCollectionDetails === "string") {
//   try {
//     parsedSampleDetails = JSON.parse(sampleCollectionDetails);
//   } catch (err) {
//     console.error("Failed to parse sampleCollectionDetails:", err.message);
//   }
// }
// sampleCollectionDetails = parsedSampleDetails;

//     // Geocode address if available
//     let location = { type: 'Point', coordinates: [0, 0] };
//     if (sampleCollectionDetails.address && sampleCollectionDetails.pincode) {
//       try {
//         const geocodeResult = await geocoder.geocode(
//           sampleCollectionDetails.address,
//           sampleCollectionDetails.pincode
//         );
//         location = { type: 'Point', coordinates: geocodeResult.coordinates };
//       } catch (geocodeError) {
//         console.error('Geocoding failed:', geocodeError.message);
//       }
//     }

//     const sampleCollectionDetail = {
//       name: sampleCollectionDetails.name || 'Not Provided',
//       phone: sampleCollectionDetails.phone || 'Not Provided',
//       address: sampleCollectionDetails.address || 'Not Provided',
//       pincode: sampleCollectionDetails.pincode || 'Not Provided',
//       date: sampleCollectionDetails.date || new Date(),
//       time: sampleCollectionDetails.time || '09:00 AM',
//       location
//     };

//     // Fetch tests
//     const tests = await LabTest.find({ _id: { $in: parsedTestIds }, isActive: true });
//     if (tests.length === 0) {
//       return res.status(400).json({ success: false, message: 'No valid tests found with the provided IDs' });
//     }

//     const testItems = tests.map(test => ({
//       testId: test._id,
//       name: test.name,
//       price: test.finalPrice || test.price,
//       originalPrice: test.price,
//       discount: test.discount || 0
//     }));

//     const totalAmount = testItems.reduce((sum, t) => sum + t.price, 0);
//     const originalTotal = testItems.reduce((sum, t) => sum + t.originalPrice, 0);
//     const totalDiscount = originalTotal - totalAmount;

//     // Prescription file
//     let prescriptionFileData = null;
//     if (req.file) {
//       prescriptionFileData = {
//         filename: req.file.originalname,
//         data: req.file.buffer.toString('base64'),
//         contentType: req.file.mimetype,
//         uploadDate: new Date(),
//         size: req.file.size
//       };
//     }

//     // Mock Razorpay order
//     const mockRazorpayOrder = {
//       id: `order_mock_${Date.now()}`,
//       amount: totalAmount * 100,
//       currency: 'INR',
//       receipt: `lab_test_${Date.now()}`,
//       created_at: Date.now(),
//       status: 'created',
//       key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX'
//     };

//     // Create order in DB
//     const labTestOrder = new LabTestOrder({
//       user: req.user.userId,
//       tests: testItems,
//       totalAmount,
//       originalTotal,
//       totalDiscount,
//       sampleCollectionDetails: sampleCollectionDetail,
//       prescriptionFile: prescriptionFileData,
//       razorpayOrderId: mockRazorpayOrder.id,
//       paymentStatus: 'pending',
//       orderStatus: 'pending', // ✅ FIXED: use valid enum value
//       createdAt: new Date()
//     });

//     await labTestOrder.save();

//     // Send confirmation email (try/catch so it won't fail the order)
//     try { await sendLabOrderConfirmation(labTestOrder, req.user); } catch (e) { console.error(e.message); }

//     // Kafka event
//     try {
//       await kafkaProducer.sendLabTestEvent(
//         EVENT_TYPES.LAB_TEST_ORDER_CREATED,
//         {
//           orderId: labTestOrder._id.toString(),
//           userId: req.user.userId,
//           patientName: req.user.name || 'User',
//           patientEmail: req.user.email,
//           patientPhone: req.user.phone || sampleCollectionDetail.phone,
//           tests: testItems.map(t => ({ testId: t.testId.toString(), name: t.name, price: t.price, originalPrice: t.originalPrice, discount: t.discount })),
//           totalAmount,
//           originalTotal,
//           totalDiscount,
//           sampleCollectionDetails: sampleCollectionDetail,
//           prescriptionUploaded: !!prescriptionFileData,
//           razorpayOrderId: mockRazorpayOrder.id,
//           timestamp: new Date().toISOString(),
//           createdAt: labTestOrder.createdAt
//         }
//       );
//     } catch (kafkaError) { console.error('Kafka error:', kafkaError.message); }

//     // Auto-assign staff (async)
//     labStaffController.autoAssignOrderToStaff(labTestOrder._id, req.user).then(result => {
//       if (result) console.log(`Auto-assigned to staff: ${result.staff.name}`);
//     }).catch(err => console.error('Auto-assign failed:', err.message));

//     // Populate user
//     await labTestOrder.populate("user", "name email phone");

//     // Send response
//     res.status(201).json({
//       success: true,
//       message: 'Order created successfully! You will receive confirmation email shortly.',
//       data: {
//         order: {
//           _id: labTestOrder._id,
//           orderId: labTestOrder._id.toString().slice(-8).toUpperCase(),
//           tests: labTestOrder.tests.map(t => ({
//             name: t.name,
//             price: t.price,
//             originalPrice: t.originalPrice,
//             discount: t.discount
//           })),
//           totalAmount: labTestOrder.totalAmount,
//           originalTotal: labTestOrder.originalTotal,
//           totalDiscount: labTestOrder.totalDiscount,
//           sampleCollectionDetails: labTestOrder.sampleCollectionDetails,
//           prescriptionFile: labTestOrder.prescriptionFile ? {
//             filename: labTestOrder.prescriptionFile.filename,
//             uploaded: true,
//             size: labTestOrder.prescriptionFile.size
//           } : null,
//           paymentStatus: labTestOrder.paymentStatus,
//           orderStatus: labTestOrder.orderStatus,
//           assignedStaff: labTestOrder.assignedStaff || null,
//           createdAt: labTestOrder.createdAt
//         },
//         razorpayOrder: mockRazorpayOrder,
//         autoAssignment: {
//           initiated: true,
//           message: 'Auto-assignment in progress. You will be notified when a technician is assigned.'
//         }
//       }
//     });

//     console.log("=== ORDER CREATION COMPLETED ===");
//   } catch (error) {
//     console.error("CREATE ORDER ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating order',
//       error: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    console.log("=== PAYMENT VERIFICATION STARTED ===");
    console.log("Payment verification data:", req.body);

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'razorpayOrderId, razorpayPaymentId, and razorpaySignature are required'
      });
    }

    // Find the order
    const order = await LabTestOrder.findOne({ 
      razorpayOrderId,
      user: req.user.userId
    }).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log("Order found for verification:", order._id);

    // Check if already paid
    if (order.paymentStatus === 'paid') {
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: order
      });
    }

    // Handle mock orders (development mode)
    if (razorpayOrderId.startsWith('order_mock_')) {
      console.log('✅ Mock order payment verification - skipping signature check');
      
      // For mock orders, we accept any signature
      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature;
      order.paidAt = new Date();
      await order.save();
      
      console.log('✅ Mock payment verified successfully');
    } 
    // Handle real Razorpay orders
    else if (process.env.NODE_ENV === 'production' || process.env.RAZORPAY_KEY_SECRET) {
      console.log('🔐 Verifying real Razorpay payment signature');
      
      const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

      if (!isValid) {
        order.paymentStatus = 'failed';
        await order.save();
        
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed - invalid signature'
        });
      }
      
      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature;
      order.paidAt = new Date();
      await order.save();
      
      console.log('✅ Real payment verified successfully');
    }
    // Development mode with mock verification
    else {
      console.log('🛠️ Development mode - simulating payment verification');
      
      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpayPaymentId || `mock_${Date.now()}`;
      order.razorpaySignature = razorpaySignature || `mock_${Date.now()}`;
      order.paidAt = new Date();
      await order.save();
      
      console.log('Development payment simulated');
    }

    // Send Kafka event for payment verification
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_TEST_PAYMENT_VERIFIED,
        {
          orderId: order._id.toString(),
          userId: req.user.userId,
          patientName: order.patientDetails?.name || order.user?.name || 'Customer',
          patientEmail: order.patientDetails?.email || order.user?.email || req.user.email,
          paymentId: razorpayPaymentId,
          amount: order.totalAmount,
          paymentMethod: 'razorpay',
          timestamp: new Date().toISOString()
        }
      );
      console.log('Kafka event sent: LAB_TEST_PAYMENT_VERIFIED');
    } catch (kafkaError) {
      console.error('Failed to send Kafka event:', kafkaError.message);
    }

    // Get patient details from correct field
    const patientName = order.patientDetails?.name || order.user?.name || 'Valued Customer';
    const patientEmail = order.patientDetails?.email || order.user?.email || req.user.email;
    const patientPhone = order.patientDetails?.phone || order.user?.phone || '';

    // Send confirmation email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; text-align: center;">🧪 Lab Test Order Confirmed</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 16px; color: #334155;">Dear <strong>${patientName}</strong>,</p>
          <p style="color: #475569;">Your lab test order has been confirmed successfully. Here are your order details:</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #2563eb;">📋 Order Details:</h3>
            <ul style="list-style: none; padding: 0;">
              ${order.tests.map(test => `
                <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span style="font-weight: bold;">${test.name}</span>
                  <span style="float: right; color: #059669;">₹${test.price}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0;">
              <strong>💰 Total Amount:</strong> 
              <span style="float: right; font-size: 18px; color: #059669;">₹${order.totalAmount}</span>
            </p>
          </div>
          
          <div style="margin-top: 20px;">
            <p><strong>📦 Order ID:</strong> ${order._id}</p>
            <p><strong>📅 Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>📞 Contact:</strong> ${patientPhone}</p>
          </div>
        </div>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #0369a1; margin-top: 0;">📞 What's Next?</h4>
          <p style="color: #475569; margin: 5px 0;">1. Our team will contact you within 24 hours for sample collection timing</p>
          <p style="color: #475569; margin: 5px 0;">2. A trained phlebotomist will visit your preferred location</p>
          <p style="color: #475569; margin: 5px 0;">3. Reports will be delivered to your CareMitra dashboard</p>
        </div>
        
        <p style="color: #64748b; font-size: 14px; text-align: center;">
          For any queries, contact our support team at support@caremitra.com
        </p>
      </div>
    `;

    if (patientEmail) {
      try {
        await sendGeneralEmail(
          patientEmail, 
          `🧪 Lab Test Order Confirmed - ${order._id}`,
          emailHtml
        );
        console.log("Lab test confirmation email sent to:", patientEmail);
      } catch (emailError) {
        console.error("Failed to send lab test email:", emailError);
        // Don't fail the whole order if email fails
      }
    }

    console.log("=== PAYMENT VERIFICATION COMPLETED ===");
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        _id: order._id,
        orderId: order._id.toString().slice(-8).toUpperCase(),
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        tests: order.tests,
        sampleCollectionDetails: order.sampleCollectionDetails,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.uploadPrescription = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Prescription file is required"
      });
    }

    const order = await LabTestOrder.findOne({ user: userId })
      .sort({ createdAt: -1 });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No active lab test order found"
      });
    }

    // ✅ STORE BUFFER DIRECTLY
    order.prescriptionFile = {
      filename: req.file.originalname,
      data: req.file.buffer,      // 🔥 FIX
      contentType: req.file.mimetype,
      uploadDate: new Date()
    };

    await order.save();

    res.json({
      success: true,
      message: "Prescription uploaded successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};


// Get prescription file by razorpayOrderId
exports.getPrescription = async (req, res) => {
  try {
    const { razorpayOrderId } = req.params;

    const order = await LabTestOrder.findOne({ razorpayOrderId });

    if (!order || !order.prescriptionFile || !order.prescriptionFile.data) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }

    let { data, contentType, filename } = order.prescriptionFile;

    // 🔁 IMPORTANT: handle old base64 + new buffer
    if (!Buffer.isBuffer(data)) {
      data = Buffer.from(data, "base64");
    }

    res.setHeader("Content-Type", contentType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename || "prescription"}"`
    );
    res.setHeader("Content-Length", data.length);

    return res.send(data);
  } catch (error) {
    console.error("GET PRESCRIPTION ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching prescription"
    });
  }
};



// GET REPORT USING REPORT ID
exports.getReport = async (req, res) => {
  try {
    const reportId = req.params.reportId;

    const report = await ReportFile.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.set({
      "Content-Type": report.fileType,
      "Content-Disposition": `attachment; filename=\"${report.fileName}\"`
    });

    return res.send(report.fileData); // send PDF binary

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Admin: Update sample collection status
exports.updateSampleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch order and populate user
    const order = await LabTestOrder.findById(id)
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.orderStatus = 'sample_collected';
    await order.save();

    // Prepare Kafka event payload safely
    const kafkaPayload = {
      orderId: order._id.toString(),
      userId: order.user?._id?.toString() || null,
      patientName: order.patientDetails?.name || order.user?.name || 'Patient',
      patientEmail: order.user?.email || null,
      collectedBy: req.user?.name || 'Staff',
      collectionTime: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };

    // Send Kafka event
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_TEST_SAMPLE_COLLECTED,
        kafkaPayload
      );
      console.log('Kafka event sent: LAB_TEST_SAMPLE_COLLECTED', kafkaPayload);
    } catch (kafkaError) {
      console.error('Failed to send Kafka event:', kafkaError.message);
    }

    // Send email ONLY if patient email exists
    const patientEmail = order.user?.email || order.patientDetails?.email;
    const patientName = order.patientDetails?.name || order.user?.name || 'Patient';

    if (patientEmail) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #10b981; color: white; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; margin: 0 auto 15px; font-size: 28px;">✓</div>
              <h2 style="color: #10b981; margin-bottom: 10px;">Sample Successfully Collected!</h2>
              <p style="color: #6b7280;">Your lab test process is now underway</p>
            </div>
            <p>Dear <strong>${patientName}</strong>,</p>
            <p>Your biological sample has been successfully collected by our staff (${kafkaPayload.collectedBy}). The sample is now being prepared for analysis at our laboratory.</p>
            <p>Order ID: LAB${order._id.toString().slice(-8).toUpperCase()}</p>
            <p>Collection Time: ${new Date().toLocaleString()}</p>
            <p>Thank you for using CareMitra services.</p>
          </div>
        `;

        await sendGeneralEmail(
          patientEmail,
          `Sample Collected Successfully - Order LAB${order._id.toString().slice(-8).toUpperCase()}`,
          emailHtml
        );

        console.log(`Sample collected email sent to: ${patientEmail}`);
      } catch (emailError) {
        console.error('Failed to send sample collected email:', emailError.message);
      }
    }

    res.json({
      success: true,
      message: 'Sample status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Error updating sample status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sample status',
      error: error.message
    });
  }
};


// Admin: Update processing status
exports.updateProcessingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await LabTestOrder.findByIdAndUpdate(
      id,
      { orderStatus: 'processing' },
      { new: true }
    ).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Processing status updated successfully',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating processing status',
      error: error.message
    });
  }
};

// Admin: Upload final report
exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Report file is required"
      });
    }

    const orderId = req.params.id;

const order = await LabTestOrder.findById(orderId)
  .populate("user", "name email phone");
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // SAVE FILE IN SEPARATE DOCUMENT (BINARY BUFFER)
    const report = await ReportFile.create({
      orderId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileData: req.file.buffer
    });

    // Save report reference in the order
    order.orderStatus = "completed";
    await order.save();

    // ✅ Send Kafka event for report upload
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_TEST_REPORT_UPLOADED,
        {
          orderId: order._id.toString(),
          userId: order.user?._id?.toString(),
          patientName: order.patientDetails?.name || order.user?.name || 'Patient',
          patientEmail: order.user?.email,
          reportId: report._id.toString(),
          reportFileName: req.file.originalname,
          reportFileType: req.file.mimetype,
          reportSize: req.file.size,
          timestamp: new Date().toISOString()
        }
      );
      console.log('Kafka event sent: LAB_TEST_REPORT_UPLOADED');
    } catch (kafkaError) {
      console.error('Failed to send Kafka event:', kafkaError.message);
    }

    // Send email notification
    if (order.user?.email) {
      const reportUrl = `${process.env.BASE_URL}/api/lab-tests/report/${report._id}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981; text-align: center;">📄 Your Lab Report is Ready!</h2>
          <p>Dear ${order.patientDetails?.name || order.user?.name},</p>
          <p>Your lab test report has been generated and is now available.</p>
          <p><strong>Download your report:</strong></p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${reportUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              📥 Download Report
            </a>
          </div>
          <p>Order ID: ${order._id}</p>
          <p>Thank you for using our services.</p>
        </div>
      `;
      
      try {
       await sendGeneralEmail(
  order.user.email,
  `Lab Test Report Ready - Order ${order._id}`,
  emailHtml
);

        console.log(`Report ready email sent to ${order.user.email}`);
      } catch (emailError) {
        console.error('Failed to send email:', emailError.message);
      }
    }

    res.json({
      success: true,
      message: "Report uploaded successfully",
      data: {
        orderId: order._id
      }
    });

  } catch (error) {
    console.error("Report upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading report",
      error: error.message
    });
  }
};

// Get single test by key
exports.getLabTestByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const labTest = await LabTest.findOne({ 
      key: key.toLowerCase(), 
      isActive: true 
    }).select('-__v');
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    res.json({
      success: true,
      data: labTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lab test',
      error: error.message
    });
  }
};

// Helper method
exports.parseTestIds = (testIds) => {
  if (typeof testIds === 'string') {
    if (testIds.startsWith('[') && testIds.endsWith(']')) {
      return testIds.slice(1, -1).split(',').map(id => 
        id.trim().replace(/"/g, '').replace(/'/g, '')
      );
    }
    return [testIds.trim()];
  }
  return testIds;
};

exports.changeActive = async (req, res) => {
  try {
    const labId = req.params.id;
    if (!labId) {
      return res.status(400).json({ message: "Lab Id not provided" });
    }

    const labTest = await LabTest.findById(labId);

    if (!labTest) {
      return res.status(404).json({ message: "Not Found in DB" });
    }

    labTest.isActive = !labTest.isActive;
    await labTest.save();

    return res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const labId = req.params.id;
    if (!labId) {
      return res.status(400).json({ message: "Lab Id not provided" });
    }

    const deleted = await LabTest.findByIdAndDelete(labId);

    if (!deleted) {
      return res.status(404).json({ message: "Not Found in DB" });
    }

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.editProfile = async (req, res) => {
  try {
    const labId = req.params.id;
    if (!labId) {
      return res.status(400).json({ message: "Lab Id not provided" });
    }

    const labTest = await LabTest.findById(labId);

    if (!labTest) {
      return res.status(404).json({ message: "Not Found in DB" });
    }

    const { name, price, discountedPrice } = req.body;

    if (name) labTest.name = name;
    if (price !== undefined) labTest.price = price;
    if (discountedPrice !== undefined) labTest.discountedPrice = discountedPrice;

    await labTest.save();

    return res.status(200).json({ message: "Successfully Edited" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.createTest = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountedPrice,
      isActive,
      sampleType,
      reportTime
    } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    if (
      discountedPrice !== undefined &&
      discountedPrice < 0
    ) {
      return res.status(400).json({ message: "Discounted price cannot be negative" });
    }
    const labtest = new LabTest({
      name,
      description,
      price: Number(price),
      discountedPrice: discountedPrice !== undefined ? Number(discountedPrice) : undefined,
      isActive: isActive !== undefined ? isActive : true,
      sampleType,
      reportTime
    });

    await labtest.save();

    return res.status(201).json({
      message: "Lab Test created successfully",
      data: labtest
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getAllLabTestOrders = async (req, res) => {
  try {
    const orders = await LabTestOrder.find()
      .populate("user", "name email phone")
      .populate("tests.testId", "name price category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get lab orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lab test orders",
    });
  }
};
