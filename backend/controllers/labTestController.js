const LabTest = require('../models/LabTest');
const LabTestOrder = require('../models/LabTestOrder');
const { razorpay, verifyPaymentSignature } = require('../config/razorpay');
const { sendEmail } = require('../utils/sendEmail');

// Get all active lab tests
exports.getAllLabTests = async (req, res) => {
  try {
    const labTests = await LabTest.find({ isActive: true }).select('-__v');
    res.json({
      success: true,
      data: labTests,
      count: labTests.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lab tests',
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
    const { testIds, name, phone, address, pincode, date, time } = req.body;

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

    // 2. Build sampleCollectionDetails from individual fields
    const sampleCollectionDetails = {
      name: name || 'Not Provided',
      phone: phone || 'Not Provided',
      address: address || 'Not Provided',
      pincode: pincode || 'Not Provided',
      date: date || new Date(),
      time: time || '09:00 AM'
    };

    console.log("Sample Collection Details:", sampleCollectionDetails);

    // 3. Fetch tests from database
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

    if (tests.length !== parsedTestIds.length) {
      const foundIds = tests.map(t => t._id.toString());
      const missingIds = parsedTestIds.filter(id => !foundIds.includes(id));
      console.log("Missing test IDs:", missingIds);
    }

    // 4. Prepare test items and calculate total
    const testItems = tests.map(test => ({
      testId: test._id,
      name: test.name,
      price: test.finalPrice || test.price
    }));

    const totalAmount = testItems.reduce((sum, test) => sum + test.price, 0);
    console.log("Total amount calculated:", totalAmount);

    // 5. Handle prescription file upload
    let prescriptionFileData = null;
    if (req.file) {
      console.log("Processing prescription file...");
      try {
        prescriptionFileData = {
          filename: req.file.originalname,
          data: req.file.buffer.toString('base64'),
          contentType: req.file.mimetype,
          uploadDate: new Date()
        };
        console.log("Prescription file processed successfully");
      } catch (fileError) {
        console.error("Error processing prescription file:", fileError);
        // Continue without prescription file
      }
    } else {
      console.log("No prescription file provided");
    }

    // 6. Create mock Razorpay order (bypass for testing)
    const mockRazorpayOrder = {
      id: `order_mock_${Date.now()}`,
      amount: totalAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: `lab_test_${Date.now()}`
    };

    console.log("Mock Razorpay order created:", mockRazorpayOrder.id);

    // 7. Create and save lab test order
    const labTestOrder = new LabTestOrder({
      user: req.user._id,
      tests: testItems,
      totalAmount,
      sampleCollectionDetails,
      prescriptionFile: prescriptionFileData,
      razorpayOrderId: mockRazorpayOrder.id,
      paymentStatus: 'pending'
    });

    await labTestOrder.save();
    console.log("Order saved to database with ID:", labTestOrder._id);

    // 8. Populate user details for response
    await labTestOrder.populate("user", "name email phone");

    // 9. Send success response
    res.status(201).json({
      success: true,
      message: 'Order created successfully with prescription!',
      data: {
        order: {
          _id: labTestOrder._id,
          tests: labTestOrder.tests,
          totalAmount: labTestOrder.totalAmount,
          sampleCollectionDetails: labTestOrder.sampleCollectionDetails,
          prescriptionFile: labTestOrder.prescriptionFile ? {
            filename: labTestOrder.prescriptionFile.filename,
            uploaded: true
          } : null,
          paymentStatus: labTestOrder.paymentStatus,
          orderStatus: labTestOrder.orderStatus
        },
        razorpayOrder: mockRazorpayOrder
      }
    });

    console.log("=== ORDER CREATION COMPLETED ===");

  } catch (error) {
    console.error("❌ CREATE ORDER ERROR:", error);
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

    if (!razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: 'razorpayOrderId is required'
      });
    }

    // Find the order
    const order = await LabTestOrder.findOne({ 
      razorpayOrderId,
      user: req.user._id 
    }).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Skip signature verification in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Skipping Razorpay signature verification in development');
    } else {
      // Production verification
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        order.paymentStatus = 'failed';
        await order.save();
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }
    }

    // Update order
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId || `mock_${Date.now()}`;
    order.razorpaySignature = razorpaySignature || `mock_${Date.now()}`;
    await order.save();

    // Send email
    const emailHtml = `
      <h2>Lab Test Order Confirmed</h2>
      <p>Dear ${order.user.name},</p>
      <p>Your lab test order has been confirmed successfully.</p>
      <h3>Order Details:</h3>
      <ul>
        ${order.tests.map(test => `<li>${test.name} - ₹${test.price}</li>`).join('')}
      </ul>
      <p><strong>Total Amount: ₹${order.totalAmount}</strong></p>
      <p>Order ID: ${order._id}</p>
      <p>We will contact you soon for sample collection.</p>
    `;

    await sendEmail(order.user.email, 'Lab Test Order Confirmed', emailHtml);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// Upload prescription separately
exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Prescription file is required'
      });
    }

    res.json({
      success: true,
      message: 'Prescription uploaded successfully',
      data: {
        filename: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading prescription',
      error: error.message
    });
  }
};

// Get prescription file
exports.getPrescription = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await LabTestOrder.findById(orderId);
    if (!order || !order.prescriptionFile) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    const fileBuffer = Buffer.from(order.prescriptionFile.data, 'base64');
    
    res.set({
      'Content-Type': order.prescriptionFile.contentType,
      'Content-Disposition': `attachment; filename="${order.prescriptionFile.filename}"`
    });

    res.send(fileBuffer);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving prescription',
      error: error.message
    });
  }
};

// Get report file
exports.getReport = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await LabTestOrder.findById(orderId);
    if (!order || !order.reportFile) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const fileBuffer = Buffer.from(order.reportFile.data, 'base64');
    
    res.set({
      'Content-Type': order.reportFile.contentType,
      'Content-Disposition': `inline; filename="${order.reportFile.filename}"`
    });

    res.send(fileBuffer);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving report',
      error: error.message
    });
  }
};

// Admin: Update sample collection status
exports.updateSampleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await LabTestOrder.findById(id).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = 'sample_collected';
    await order.save();

    const emailHtml = `
      <h2>Sample Collected</h2>
      <p>Dear ${order.user.name},</p>
      <p>Your sample has been successfully collected.</p>
      <p>We are now processing your lab tests.</p>
      <p>Order ID: ${order._id}</p>
      <p>Thank you for choosing our service.</p>
    `;

    await sendEmail(order.user.email, 'Sample Collected - Lab Test', emailHtml);

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
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Report file is required'
      });
    }

    const order = await LabTestOrder.findById(id).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Store report as Base64
    order.reportFile = {
      filename: req.file.originalname,
      data: req.file.buffer.toString('base64'),
      contentType: req.file.mimetype
    };
    order.orderStatus = 'completed';
    await order.save();

    const reportUrl = `${process.env.BASE_URL}/lab-tests/report/${order._id}`;

    const emailHtml = `
      <h2>Your Lab Report is Ready</h2>
      <p>Dear ${order.user.name},</p>
      <p>Your lab test report has been generated and is now available.</p>
      <p><strong>Download your report:</strong> 
        <a href="${reportUrl}">Click here to download report</a>
      </p>
      <p>Order ID: ${order._id}</p>
      <p>Thank you for using our services.</p>
    `;

    await sendEmail(order.user.email, 'Lab Test Report Ready', emailHtml);

    res.json({
      success: true,
      message: 'Report uploaded and order completed successfully',
      data: {
        order,
        reportUrl
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading report',
      error: error.message
    });
  }
};