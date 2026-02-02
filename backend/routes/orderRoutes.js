// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  createCODOrder,
  getOrderById,
  getPatientOrders,
} = require("../controllers/orderController");

// Middleware (optional - add authentication if needed)
const auth  = require("../middleware/auth");

// =====================================================
// ORDER ROUTES
// =====================================================
// router.use(auth);
// 1. Create Order (for Card/UPI payment via Razorpay)
router.post("/create", auth ,createOrder);

// 2. Verify Payment (after Razorpay payment)
router.post("/verify-payment", auth ,verifyPayment);

// 3. Create COD Order (Cash on Delivery)
router.post("/cod", auth ,createCODOrder);

// 4. Get order by ID
router.get("/:orderId", auth ,getOrderById);

// 5. Get all orders for a patient
router.get("/patient/:patientId", auth,getPatientOrders);

module.exports = router;