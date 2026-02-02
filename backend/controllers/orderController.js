// controllers/orderController.js
const Order = require("../models/Order");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =====================================================
// 1. CREATE ORDER (For Card/UPI - Razorpay)
// =====================================================
exports.createOrder = async (req, res) => {
  try {
    const { patientId, items, totalAmount, shippingAddress } = req.body;

    // Validation
    if (!patientId || !items || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Patient ID, items, and total amount are required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    // Generate unique order ID
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // Convert to paise (smallest currency unit)
      currency: "INR",
      receipt: orderId,
      notes: {
        patientId: patientId.toString(),
        orderType: "product_order",
      },
    });

    // Create order in database (pending payment)
    const newOrder = new Order({
      orderId,
      patientId,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "",
      })),
      totalAmount,
      paymentDetails: {
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: "pending",
      },
      shippingAddress: shippingAddress || {},
      orderStatus: "pending",
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: newOrder.orderId,
        _id: newOrder._id,
        rzpOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: process.env.RAZORPAY_KEY_ID,
        },
        totalAmount: newOrder.totalAmount,
        items: newOrder.items,
      },
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

// =====================================================
// 2. VERIFY PAYMENT (After Razorpay payment success)
// =====================================================
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId, // Your custom orderId (optional)
    } = req.body;

    // Validation
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters",
      });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Find and update order
    const order = await Order.findOne({
      "paymentDetails.razorpayOrderId": razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update payment details
    order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
    order.paymentDetails.razorpaySignature = razorpay_signature;
    order.paymentDetails.paymentStatus = "completed";
    order.orderStatus = "confirmed";

    await order.save();

    // Optional: Send confirmation email/SMS
    // await sendOrderConfirmationEmail(order);

    res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed",
      data: {
        orderId: order.orderId,
        _id: order._id,
        paymentId: razorpay_payment_id,
        amount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentDetails.paymentStatus,
        items: order.items,
      },
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

// =====================================================
// 3. CREATE COD ORDER (Cash on Delivery)
// =====================================================
exports.createCODOrder = async (req, res) => {
  try {
    const { patientId, items, totalAmount, shippingAddress } = req.body;

    // Validation
    if (!patientId || !items || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Patient ID, items, and total amount are required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required for COD orders",
      });
    }

    // Generate unique order ID for COD
    const orderId = `COD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create COD order in database
    const newOrder = new Order({
      orderId,
      patientId,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "",
      })),
      totalAmount,
      paymentDetails: {
        paymentStatus: "pending", // Will be paid on delivery
      },
      shippingAddress: {
        fullName: shippingAddress.fullName || shippingAddress.name,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.addressLine1 || shippingAddress.house || shippingAddress.line1,
        addressLine2: shippingAddress.addressLine2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode || shippingAddress.postalCode,
      },
      orderStatus: "confirmed", // COD orders are confirmed immediately
    });

    await newOrder.save();

    // Optional: Send COD confirmation email/SMS
    // await sendCODConfirmationEmail(newOrder);

    // Optional: Notify delivery team
    // await notifyDeliveryTeam(newOrder);

    res.status(201).json({
      success: true,
      message: "COD order created successfully",
      data: {
        orderId: newOrder.orderId,
        _id: newOrder._id,
        totalAmount: newOrder.totalAmount,
        orderStatus: newOrder.orderStatus,
        paymentStatus: newOrder.paymentDetails.paymentStatus,
        items: newOrder.items,
        shippingAddress: newOrder.shippingAddress,
        paymentMethod: "cod",
      },
    });
  } catch (error) {
    console.error("COD Order Creation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create COD order",
    });
  }
};

// =====================================================
// BONUS: Get Order by ID
// =====================================================
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId })
      .populate("patientId", "name email phone")
      .populate("items.productId", "name price image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};

// =====================================================
// BONUS: Get All Orders for a Patient
// =====================================================
exports.getPatientOrders = async (req, res) => {
  try {
    const { patientId } = req.params;

    const orders = await Order.find({ patientId })
      .populate("items.productId", "name price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get Patient Orders Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};