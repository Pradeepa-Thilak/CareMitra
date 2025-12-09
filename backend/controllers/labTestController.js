const LabTest = require('../models/LabTest');
const LabTestOrder = require('../models/LabTestOrder');
const { verifyPaymentSignature } = require('../config/razorpay');
const { sendGeneralEmail } = require('../utils/sendEmail');
const ReportFile = require("../models/ReportFile");
const kafkaProducer = require('../kafka/producer');
const { EVENT_TYPES } = require('../kafka/topics');
const labStaffController = require('./labStaffController');
// Add this geocoding function at the top of your controller
const axios = require('axios');
const geocoder = require('../utils/geocoder');

const sendLabOrderConfirmation = async (order) => {
  try {
    const patientEmail = order.patientDetails?.email;
    const patientName = order.patientDetails?.name || 'Patient';
    const orderIdShort = order._id.toString().slice(-8).toUpperCase();
    
    const subject = `✅ Lab Test Order Confirmed - #${orderIdShort}`;
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
    console.log('📧 Lab order confirmation email sent:', result.success ? 'SUCCESS' : 'FAILED');
    return result;
    
  } catch (error) {
    console.error('❌ Error sending lab order confirmation:', error);
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

exports.getAllLabTests = async (req, res) => {
  try {
    const labTests = await LabTest.find({ isActive: true }).select('-__v');
    res.json({ success: true, data: labTests, count: labTests.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching lab tests', error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    console.log("=== ORDER CREATION STARTED ===");
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : "No file");

    // Extract form data
    const { testIds, sampleCollectionDetails } = req.body;

    // 1. Parse testIds
    let parsedTestIds;
    if (typeof testIds === 'string') {
      try {
        // Handle array format: ["id1", "id2"]
        if (testIds.startsWith('[') && testIds.endsWith(']')) {
          parsedTestIds = testIds.slice(1, -1).split(',').map(id => 
            id.trim().replace(/"/g, '').replace(/'/g, '')
          );
        } else {
          // Handle single ID
          parsedTestIds = [testIds.trim()];
        }
      } catch (err) {
        console.log("Error parsing testIds, using as single ID");
        parsedTestIds = [testIds];
      }
    } else {
      parsedTestIds = testIds;
    }

    console.log("Parsed testIds:", parsedTestIds);

    // Validate testIds
    if (!parsedTestIds || !Array.isArray(parsedTestIds) || parsedTestIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one test ID is required'
      });
    }

    // 2. Geocode address to get coordinates
    let location = {
      type: 'Point',
      coordinates: [0, 0] // Default coordinates
    };

    if (sampleCollectionDetails.address && sampleCollectionDetails.pincode) {
      console.log('📍 Geocoding address...');
      try {
        const geocodeResult = await geocoder.geocode(
          sampleCollectionDetails.address,
          sampleCollectionDetails.pincode
        );
        
        location = {
          type: 'Point',
          coordinates: geocodeResult.coordinates
        };
        
        console.log(`📍 Coordinates found: ${geocodeResult.coordinates.join(', ')}`);
        console.log(`📍 Accuracy: ${geocodeResult.accuracy}, Source: ${geocodeResult.source}`);
      } catch (geocodeError) {
        console.error('📍 Geocoding failed:', geocodeError.message);
        // Continue with default coordinates
      }
    }

    // 3. Build sampleCollectionDetails with location
    const sampleCollectionDetail = {
      name: sampleCollectionDetails.name || 'Not Provided',
      phone: sampleCollectionDetails.phone || 'Not Provided',
      address: sampleCollectionDetails.address || 'Not Provided',
      pincode: sampleCollectionDetails.pincode || 'Not Provided',
      date: sampleCollectionDetails.date || new Date(),
      time: sampleCollectionDetails.time || '09:00 AM',
      location: location // Add geocoded location
    };

    console.log("Sample Collection Details with Location:", sampleCollectionDetail);

    // 4. Fetch tests from database
    const tests = await LabTest.find({
      _id: { $in: parsedTestIds },
      isActive: true
    });

    console.log("Found tests in DB:", tests.length);

    if (tests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid tests found with the provided IDs'
      });
    }

    // 5. Prepare test items and calculate total
    const testItems = tests.map(test => ({
      testId: test._id,
      name: test.name,
      price: test.finalPrice || test.price,
      originalPrice: test.price,
      discount: test.discount || 0
    }));

    const totalAmount = testItems.reduce((sum, test) => sum + test.price, 0);
    const originalTotal = testItems.reduce((sum, test) => sum + test.originalPrice, 0);
    const totalDiscount = originalTotal - totalAmount;
    
    console.log("Total amount calculated:", totalAmount);
    console.log("Original total:", originalTotal);
    console.log("Total discount:", totalDiscount);

    // 6. Handle prescription file upload
    let prescriptionFileData = null;
    if (req.file) {
      console.log("Processing prescription file...");
      try {
        prescriptionFileData = {
          filename: req.file.originalname,
          data: req.file.buffer.toString('base64'),
          contentType: req.file.mimetype,
          uploadDate: new Date(),
          size: req.file.size
        };
        console.log("Prescription file processed successfully");
      } catch (fileError) {
        console.error("Error processing prescription file:", fileError);
        // Continue without prescription file
      }
    } else {
      console.log("No prescription file provided");
    }

    // 7. Create mock Razorpay order (bypass for testing)
    const mockRazorpayOrder = {
      id: `order_mock_${Date.now()}`,
      amount: totalAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: `lab_test_${Date.now()}`,
      created_at: Date.now(),
      status: 'created'
    };

    console.log("Mock Razorpay order created:", mockRazorpayOrder.id);

    // 8. Create and save lab test order
    const labTestOrder = new LabTestOrder({
      user: req.user.userId,
      tests: testItems,
      totalAmount,
      originalTotal,
      totalDiscount,
      sampleCollectionDetails: sampleCollectionDetail,
      prescriptionFile: prescriptionFileData,
      razorpayOrderId: mockRazorpayOrder.id,
      paymentStatus: 'pending',
      orderStatus: 'created',
      createdAt: new Date()
    });

    await labTestOrder.save();
    console.log("Order saved to database with ID:", labTestOrder._id);

    // 9. ✅ IMMEDIATE: Send order confirmation email to patient
    try {
      await sendLabOrderConfirmation(labTestOrder, req.user);
      console.log('📧 Order confirmation email sent to patient');
    } catch (emailError) {
      console.error('❌ Failed to send order confirmation email:', emailError.message);
      // Don't fail the order if email fails
    }

    // 10. ✅ Send Kafka event for order creation (triggers email handlers)
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_TEST_ORDER_CREATED,
        {
          orderId: labTestOrder._id.toString(),
          userId: req.user.userId,
          patientName: req.user.name || 'User',
          patientEmail: req.user.email,
          patientPhone: req.user.phone || sampleCollectionDetail.phone,
          tests: testItems.map(t => ({
            testId: t.testId.toString(),
            name: t.name,
            price: t.price,
            originalPrice: t.originalPrice,
            discount: t.discount
          })),
          totalAmount: totalAmount,
          originalTotal: originalTotal,
          totalDiscount: totalDiscount,
          sampleCollectionDetails: sampleCollectionDetail,
          prescriptionUploaded: !!prescriptionFileData,
          razorpayOrderId: mockRazorpayOrder.id,
          timestamp: new Date().toISOString(),
          createdAt: labTestOrder.createdAt
        }
      );
      console.log('📤 Kafka event sent: LAB_TEST_ORDER_CREATED');
    } catch (kafkaError) {
      console.error('⚠️  Failed to send Kafka event:', kafkaError.message);
      // Don't fail the order if Kafka fails
    }

    // 11. ✅ Auto-assign order to nearest staff (ASYNC - don't wait for completion)
    console.log('👨‍⚕️ Attempting auto-assignment to nearest staff...');
    
    // Start auto-assignment asynchronously
   labStaffController.autoAssignOrderToStaff(labTestOrder._id, req.user)
      .then(assignmentResult => {
        if (assignmentResult) {
          console.log(`✅ Auto-assigned to staff: ${assignmentResult.staff.name}`);
          console.log(`📍 Distance: ${assignmentResult.distance} km`);
        } else {
          console.log('⚠️  Could not auto-assign staff (no available staff nearby)');
        }
      })
      .catch(assignmentError => {
        console.error('❌ Auto-assignment failed:', assignmentError.message);
      });

    // 12. Populate user details for response
    await labTestOrder.populate("user", "name email phone");

    // 13. Send success response with assignment info
    res.status(201).json({
      success: true,
      message: 'Order created successfully! You will receive confirmation email shortly.',
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
        razorpayOrder: mockRazorpayOrder,
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

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'razorpayOrderId, razorpayPaymentId, and razorpaySignature are required'
      });
    }

    // Find the order with patientDetails (already saved in order)
    const order = await LabTestOrder.findOne({ 
      razorpayOrderId,
      user: req.user.userId
    }).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Skip verification in development
    if (process.env.NODE_ENV !== 'development') {
      const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

      if (!isValid) {
        order.paymentStatus = 'failed';
        await order.save();
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }
    } else {
      console.log('Skipping Razorpay signature verification in development');
    }

    // Update order as paid
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId || `mock_${Date.now()}`;
    order.razorpaySignature = razorpaySignature || `mock_${Date.now()}`;
    await order.save();

    // ✅ Send Kafka event for payment verification
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_TEST_PAYMENT_VERIFIED,
        {
          orderId: order._id.toString(),
          userId: req.user.userId,
          patientName: order.user?.name || 'Customer',
          patientEmail: order.user?.email || req.user.email,
          paymentId: razorpayPaymentId,
          amount: order.totalAmount,
          paymentMethod: 'razorpay',
          timestamp: new Date().toISOString()
        }
      );
      console.log('📤 Kafka event sent: LAB_TEST_PAYMENT_VERIFIED');
    } catch (kafkaError) {
      console.error('⚠️  Failed to send Kafka event:', kafkaError.message);
    }

    // Get patient name - Use order.patientDetails.name instead of order.user.name
    const patientName = order.patientDetails?.name || 'Valued Customer';
    const patientEmail = order.patientDetails?.email || req.user.email;

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
            <p><strong>📅 Order Date:</strong> ${new Date().toLocaleDateString()}</p>
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

    const emailToSend = patientEmail || req.user.email;

    if (emailToSend) {
      try {
        await sendGeneralEmail(
          emailToSend, 
          `🧪 Lab Test Order Confirmed - ${order._id}`,
          emailHtml
        );
        console.log("✅ Lab test confirmation email sent to:", emailToSend);
      } catch (emailError) {
        console.error("❌ Failed to send lab test email:", emailError);
        // Don't fail the whole order if email fails
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: order
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

exports.uploadPrescription = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("USER ID:", userId);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Prescription file is required"
      });
    }

    // Find latest active order for this user
    const order = await LabTestOrder.findOne({ user: userId })
      .sort({ createdAt: -1 });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No active lab test order found for this user"
      });
    }

    // Convert file to base64
    const base64Data = req.file.buffer.toString("base64");

    // Save into order
    order.prescriptionFile = {
      filename: req.file.originalname,
      data: base64Data,
      contentType: req.file.mimetype,
      uploadDate: new Date()
    };

    await order.save();

    res.json({
      success: true,
      message: "Prescription uploaded & saved successfully",
      data: {
        orderId: order._id,
        filename: req.file.originalname,
        size: req.file.size
      }
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading prescription",
      error: error.message
    });
  }
};

// Get prescription file by razorpayOrderId
exports.getPrescription = async (req, res) => {
  try {
    console.log('=== GET PRESCRIPTION START ===');

    // Get razorpayOrderId from route param or query param
    const razorpayOrderId = req.params.razorpayOrderId || req.query.razorpayOrderId;
    if (!razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: 'razorpayOrderId is required. Pass it as /prescription/:razorpayOrderId or ?razorpayOrderId=...'
      });
    }

    console.log('Fetching order with razorpayOrderId:', razorpayOrderId);

    // Find order by razorpayOrderId
    const order = await LabTestOrder.findOne({ razorpayOrderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with razorpayOrderId "${razorpayOrderId}" not found`
      });
    }

    if (!order.prescriptionFile || !order.prescriptionFile.data) {
      return res.status(404).json({
        success: false,
        message: 'Prescription file not found for this order',
        orderId: order._id
      });
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(order.prescriptionFile.data, 'base64');

    // Send file
    res.set({
      'Content-Type': order.prescriptionFile.contentType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${order.prescriptionFile.filename || 'prescription.jpg'}"`,
      'Content-Length': fileBuffer.length
    });

    console.log(`Prescription sent for razorpayOrderId ${razorpayOrderId}`);
    return res.send(fileBuffer);

  } catch (error) {
    console.error('Prescription retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving prescription',
      error: error.message
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

    const order = await LabTestOrder.findById(id)
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = 'sample_collected';
    await order.save();

    // ✅ Send Kafka event for sample collection
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_TEST_SAMPLE_COLLECTED,
        {
          orderId: order._id.toString(),
          userId: order.user?._id?.toString(),
          patientName: order.user?.name || 'Patient',
          patientEmail: order.user?.email,
          collectedBy: req.user.name || 'Staff',
          collectionTime: new Date().toISOString(),
          timestamp: new Date().toISOString()
        }
      );
      console.log('📤 Kafka event sent: LAB_TEST_SAMPLE_COLLECTED');
    } catch (kafkaError) {
      console.error('⚠️  Failed to send Kafka event:', kafkaError.message);
    }

    // Send email ONLY if user exists
    if (order.user && order.user.email) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #10b981; color: white; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; margin: 0 auto 15px; font-size: 28px;">
                ✓
              </div>
              <h2 style="color: #10b981; margin-bottom: 10px;">Sample Successfully Collected!</h2>
              <p style="color: #6b7280;">Your lab test process is now underway</p>
            </div>
            
            <div style="background: #f9fafb; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">
                Dear <strong style="color: #111827;">${order.user.name}</strong>,
              </p>
              
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                We're pleased to inform you that your biological sample has been successfully collected by our trained phlebotomist. 
                Your samples are now being prepared for analysis at our accredited laboratory.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                <h3 style="color: #111827; margin-top: 0; margin-bottom: 15px;">📋 Collection Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">
                      LAB${order._id.toString().slice(-8).toUpperCase()}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Collection Date:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">
                      ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Collection Time:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">
                      ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
              <h4 style="color: #0369a1; margin-top: 0; margin-bottom: 15px;">🔬 What Happens Next?</h4>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="background: #dbeafe; color: #1d4ed8; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
                    1
                  </div>
                  <div>
                    <p style="font-weight: 600; color: #1e40af; margin: 0 0 4px 0;">Sample Processing</p>
                    <p style="color: #4b5563; margin: 0; font-size: 14px;">Your samples are being transported to our laboratory under controlled conditions</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="background: #dbeafe; color: #1d4ed8; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
                    2
                  </div>
                  <div>
                    <p style="font-weight: 600; color: #1e40af; margin: 0 0 4px 0;">Lab Analysis</p>
                    <p style="color: #4b5563; margin: 0; font-size: 14px;">Advanced testing equipment will analyze your samples with precision</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="background: #dbeafe; color: #1d4ed8; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
                    3
                  </div>
                  <div>
                    <p style="font-weight: 600; color: #1e40af; margin: 0 0 4px 0;">Report Generation</p>
                    <p style="color: #4b5563; margin: 0; font-size: 14px;">Detailed reports will be reviewed by certified pathologists</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="background: #dbeafe; color: #1d4ed8; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
                    4
                  </div>
                  <div>
                    <p style="font-weight: 600; color: #1e40af; margin: 0 0 4px 0;">Report Delivery</p>
                    <p style="color: #4b5563; margin: 0; font-size: 14px;">Your digital reports will be available in your CareMitra dashboard</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #92400e; margin: 0; display: flex; align-items: flex-start; gap: 8px;">
                <span style="font-size: 18px;">💡</span>
                <span>
                  <strong>Important:</strong> Most test results will be available within <strong>24-48 hours</strong>. 
                  Some specialized tests may take 3-5 days. You'll receive a notification when your reports are ready.
                </span>
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
                <strong>Need Assistance?</strong>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                📧 <a href="mailto:support@caremitra.com" style="color: #2563eb; text-decoration: none;">support@caremitra.com</a> | 
                📞 +91-XXXXXXXXXX | 
                🌐 <a href="https://caremitra.com" style="color: #2563eb; text-decoration: none;">caremitra.com</a>
              </p>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 25px;">
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        `;

        await sendGeneralEmail(
          order.user.email, 
          `✅ Sample Collected Successfully - Order LAB${order._id.toString().slice(-8).toUpperCase()}`,
          emailHtml
        );
        
        console.log(`✅ Sample collected email sent to: ${order.user.email}`);
        
      } catch (emailError) {
        console.error(`❌ Failed to send sample collected email:`, emailError);
        // Don't fail the main operation if email fails
      }
    }
    
    res.json({
      success: true,
      message: 'Sample status updated successfully',
      data: order
    });

  } catch (error) {
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

    const order = await LabTestOrder.findById(orderId).populate("user", "name email");
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
    order.reportFile = report._id;
    order.orderStatus = "completed";
    await order.save();

    // ✅ Send Kafka event for report upload
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_TEST_REPORT_UPLOADED,
        {
          orderId: order._id.toString(),
          userId: order.user?._id?.toString(),
          patientName: order.user?.name || 'Patient',
          patientEmail: order.user?.email,
          reportId: report._id.toString(),
          reportFileName: req.file.originalname,
          reportFileType: req.file.mimetype,
          reportSize: req.file.size,
          timestamp: new Date().toISOString()
        }
      );
      console.log('📤 Kafka event sent: LAB_TEST_REPORT_UPLOADED');
    } catch (kafkaError) {
      console.error('⚠️  Failed to send Kafka event:', kafkaError.message);
    }

    // Send email notification
    if (order.user?.email) {
      const reportUrl = `${process.env.BASE_URL}/api/lab-tests/report/${report._id}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981; text-align: center;">📄 Your Lab Report is Ready!</h2>
          <p>Dear ${order.user.name},</p>
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
          `📄 Lab Test Report Ready - Order ${order._id}`,
          emailHtml
        );
        console.log(`✅ Report ready email sent to ${order.user.email}`);
      } catch (emailError) {
        console.error('⚠️  Failed to send email:', emailError.message);
      }
    }

    res.json({
      success: true,
      message: "Report uploaded successfully",
      data: {
        orderId: order._id,
        reportId: report._id
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