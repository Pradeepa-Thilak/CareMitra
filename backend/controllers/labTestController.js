const LabTest = require('../models/LabTest');
const LabTestOrder = require('../models/LabTestOrder');
const { razorpay, verifyPaymentSignature } = require('../config/razorpay'); // Updated import
const { sendOTPEmail } = require('../utils/sendEmail'); // Your existing email utility

// Get all active lab tests
exports.getAllLabTests = async (req, res) => {
  try {
    const labTests = await LabTest.find({ isActive: true }).select('-__v');
    console.log("🟡🟡 HIT getAllLabTests");

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
    console.log("🔥 HIT getLabTestByKey route");
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

// Create order
exports.createOrder = async (req, res) => {
  try {
    let { testIds, sampleCollectionDetails } = req.body;

    console.log("RAW BODY:", req.body);
    console.log("FILE:", req.file);

    // Handle testIds - could be string from form-data
    if (typeof testIds === "string") {
      try {
        // Remove brackets and split by comma if it's array-like string
        if (testIds.startsWith('[') && testIds.endsWith(']')) {
          testIds = testIds.slice(1, -1).split(',').map(id => id.trim().replace(/"/g, ''));
        } else {
          // Single test ID as string
          testIds = [testIds.trim()];
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid testIds format"
        });
      }
    }

    // Handle sampleCollectionDetails - could be string from form-data
    if (typeof sampleCollectionDetails === "string") {
      try {
        sampleCollectionDetails = JSON.parse(sampleCollectionDetails);
      } catch (err) {
        // If JSON parse fails, try to build object manually
        try {
          sampleCollectionDetails = {
            name: req.body.name || "Not Provided",
            phone: req.body.phone || "Not Provided", 
            address: req.body.address || "Not Provided",
            pincode: req.body.pincode || "Not Provided",
            date: req.body.date || new Date(),
            time: req.body.time || "Not Specified"
          };
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid sample collection details"
          });
        }
      }
    }

    console.log("Processed testIds:", testIds);
    console.log("Processed sampleCollectionDetails:", sampleCollectionDetails);

    // Validation
    if (!testIds || !Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one test is required"
      });
    }

    // Validate MongoDB ObjectId format
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
    const invalidIds = testIds.filter(id => !isValidObjectId(id));
    
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid test IDs: ${invalidIds.join(', ')}`
      });
    }

    // Fetch tests from database
    const tests = await LabTest.find({
      _id: { $in: testIds },
      isActive: true
    });

    console.log("Found tests:", tests);

    if (tests.length !== testIds.length) {
      const foundIds = tests.map(t => t._id.toString());
      const missingIds = testIds.filter(id => !foundIds.includes(id));
      
      return res.status(400).json({
        success: false,
        message: `Tests not found: ${missingIds.join(', ')}`
      });
    }

    // Build test items and calculate total
    const testItems = tests.map(test => ({
      testId: test._id,
      name: test.name,
      price: test.finalPrice || test.price
    }));

    const totalAmount = testItems.reduce((sum, test) => sum + test.price, 0);
    console.log("Total amount:", totalAmount);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: "INR",
      receipt: `lab_test_${Date.now()}`
    });

    console.log("Razorpay order created:", razorpayOrder.id);
    console.log(req.user);

    console.log({
      user: req.user.userId,
      tests: testItems,
      totalAmount,
      sampleCollectionDetails,
      prescriptionUrl: req.file ? req.file.path : null,
      razorpayOrderId: razorpayOrder.id
    })
    
    // Create and save lab test order
    const labTestOrder = new LabTestOrder({
      user: req.user.userId,
      tests: testItems,
      totalAmount,
      sampleCollectionDetails,
      prescriptionUrl: req.file ? req.file.path : null,
      razorpayOrderId: razorpayOrder.id
    });

    await labTestOrder.save();
    console.log("Order saved to database:", labTestOrder._id);

    // Populate user details
    await labTestOrder.populate("user", "name email phone");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order: labTestOrder,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt
        }
      }
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
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
        message: 'Missing payment details'
      });
    }

    // Find the order
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

    // ✅ Use the new verifyPaymentSignature function
    const isValidSignature = verifyPaymentSignature(
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature
    );

    if (!isValidSignature) {
      order.paymentStatus = 'failed';
      await order.save();
      
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update order with payment details
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    // Send confirmation email
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

    await sendOTPEmail(order.user.email, 'Lab Test Order Confirmed', emailHtml);

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
// Upload prescription (separate endpoint)
exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Prescription file is required'
      });
    }

    // You can save this to the user's profile or temporary storage
    // and associate it when creating the order
    res.json({
      success: true,
      message: 'Prescription uploaded successfully',
      data: {
        prescriptionUrl: req.file.path
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

// Admin: Update sample collection status
exports.updateSampleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await LabTestOrder.findById(id).populate('user', 'name email');
    
    console.log("you are entered in these admin dashboard..");
    

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = 'sample_collected';
    await order.save();

    // Send email notification
    const emailHtml = `
      <h2>Sample Collected</h2>
      <p>Dear ${order.user.name},</p>
      <p>Your sample has been successfully collected.</p>
      <p>We are now processing your lab tests.</p>
      <p>Order ID: ${order._id}</p>
      <p>Thank you for choosing our service.</p>
    `;

    await sendOTPEmail(order.user.email, 'Sample Collected - Lab Test', emailHtml);

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

    order.reportUrl = req.file.path;
    order.orderStatus = 'completed';
    await order.save();

    // Send report ready email
    const emailHtml = `
      <h2>Your Lab Report is Ready</h2>
      <p>Dear ${order.user.name},</p>
      <p>Your lab test report has been generated and is now available.</p>
      <p><strong>Download your report:</strong> ${order.reportUrl}</p>
      <p>Order ID: ${order._id}</p>
      <p>Thank you for using our services.</p>
    `;

    await sendOTPEmail(order.user.email, 'Lab Test Report Ready', emailHtml);

    res.json({
      success: true,
      message: 'Report uploaded and order completed successfully',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading report',
      error: error.message
    });
  }
};