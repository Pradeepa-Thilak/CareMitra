const Cart = require("../models/Cart");
const Product = require("../models/Product");
const crypto = require("crypto");
const { razorpay } = require("../config/razorpay");
const Order = require('../models/Order');
const Patient = require('../models/Patient');
// ADD TO CART
exports.addToCart = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const productId = req.params.id;

    // Validate product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    if (product.stock !== undefined && product.stock <= 0) {
      return res.status(400).json({ message: "Product Out of Stock" });
    }

    let cart = await Cart.findOne({ patientId });

    if (!cart) {
      cart = await Cart.create({
        patientId,
        items: [{ productId, quantity: 1 }],
      });
      return res.json({ success: true, cart });
    }

    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index > -1) {
      // Check stock before incrementing
      if (product.stock !== undefined && cart.items[index].quantity >= product.stock) {
        return res.status(400).json({ message: "Cannot add more, insufficient stock" });
      }
      cart.items[index].quantity += 1;
    } else {
      cart.items.push({ productId, quantity: 1 });
    }

    await cart.save();
    
    // Populate cart items before sending response
    await cart.populate('items.productId');
    
    res.json({ success: true, cart });

  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET CART
exports.getCart = async (req, res) => {
  try {
    const patientId = req.user.userId;

    const cart = await Cart.findOne({ patientId }).populate("items.productId");

    if (!cart) {
      return res.json({ success: true, cart: { items: [] } });
    }

    res.json({ success: true, cart });

  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: err.message });
  }
};

// REMOVE ITEM
exports.removeFromCart = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const productId = req.params.id;

    const cart = await Cart.findOne({ patientId });
    if (!cart) {
      return res.status(404).json({ message: "Cart Not Found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.productId');
    
    res.json({ success: true, cart });

  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE QUANTITY
exports.updateQuantity = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const productId = req.params.id;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await Cart.findOne({ patientId });
    if (!cart) {
      return res.status(404).json({ message: "Cart Not Found" });
    }

    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({ message: "Item Not Found in Cart" });
    }

    // Validate stock if increasing quantity
    if (quantity > cart.items[index].quantity) {
      const product = await Product.findById(productId);
      if (product && product.stock !== undefined && quantity > product.stock) {
        return res.status(400).json({ message: "Insufficient stock available" });
      }
    }

    if (quantity <= 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.productId');
    
    res.json({ success: true, cart });

  } catch (err) {
    console.error("Update quantity error:", err);
    res.status(500).json({ message: err.message });
  }
};

// CLEAR CART
exports.clearCart = async (req, res) => {
  try {
    const patientId = req.user.userId;
    await Cart.findOneAndDelete({ patientId });
    res.json({ success: true, message: "Cart Cleared" });

  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: err.message });
  }
};

// CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const cart = await Cart.findOne({ patientId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is Empty" });
    }

    let total = 0;
    
    // Validate all items and calculate total
    for (const item of cart.items) {
      if (!item.productId) {
        return res.status(400).json({ message: "Invalid cart item" });
      }
      
      const price = item.productId.discountedPrice || item.productId.price;
      
      // Check stock availability
      if (item.productId.stock !== undefined && item.quantity > item.productId.stock) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.productId.name}` 
        });
      }
      
      total += price * item.quantity;
    }

    const options = {
      amount: Math.round(total * 100), // Razorpay amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      amount: total,
    });

  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      shippingAddress
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details"
      });
    }

    if (!shippingAddress || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required"
      });
    }
    console.log(shippingAddress);
    console.log(shippingAddress.city);
    const sign = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }
    const patientId = req.user.userId;

    const cart = await Cart.findOne({ patientId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart not found or empty"
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.productId;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product not found in cart"
        });
      }

      const price =
        product.discountedPrice !== undefined
          ? product.discountedPrice
          : product.price;

      totalAmount += price * item.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
        image: product.images?.[0] || product.image
      });

      if (product.stock !== undefined) {
        product.stock = Math.max(product.stock - item.quantity, 0);
        await product.save();
      }
    }

    const order = await Order.create({
      orderId: `ORD_${razorpayPaymentId}`,
      patientId,
      items: orderItems,
      totalAmount,
      paymentDetails: {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentStatus: "completed"
      },
      shippingAddress,
      orderStatus: "confirmed"
    });

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    patient.address = shippingAddress.city;
    await patient.save();

    await Cart.findOneAndDelete({ patientId });

    return res.status(200).json({
      success: true,
      message: "Payment verified & order created successfully",
      order: {
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt
      }
    });

  } catch (err) {
    console.error("Verify payment error:", err);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: err.message
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const patientId = req.user.userId;
    console.log(patientId);
    
    const orders = await Order.find({ patientId })
      .populate("orderId totalAmount orderStatus")
      .sort({ createdAt: -1 }); // Most recent first

    res.json({ 
      success: true, 
      orders
    });

  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const { orderId } = req.params;

    const order = await Order.findOne({ 
      orderId, 
      patientId 
    }).populate("items.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, order });

  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ message: err.message });
  }
};

// CANCEL ORDER
exports.cancelOrder = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const { orderId } = req.params;

    const order = await Order.findOne({ 
      orderId, 
      patientId 
    }).populate("items.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "confirmed") {
      return res.status(400).json({ 
        message: `Cannot cancel order with status: ${order.orderStatus}` 
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      if (item.productId && item.productId.stock !== undefined) {
        item.productId.stock += item.quantity;
        await item.productId.save();
      }
    }

    res.json({ 
      success: true, 
      message: "Order cancelled successfully",
      order 
    });

  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderByStatus = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const { status } = req.params;

    if (!patientId || !status) {
      return res.status(400).json({ message: "Patient ID or Status missing" });
    }

    const orders = await Order.find({
      patientId: patientId,
      orderStatus: status
    })
      .populate("orderId totalAmount orderStatus")
      .sort({ createdAt: -1 }); // newest first

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (err) {
    console.error("Get order by status error:", err);
    res.status(500).json({ message: err.message });
  }
};
