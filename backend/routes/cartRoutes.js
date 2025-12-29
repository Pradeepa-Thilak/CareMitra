const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrderByStatus
} = require("../controllers/cartController");

router.post("/add/:id", auth, addToCart);
router.get("/", auth, getCart);
router.delete("/remove/:id", auth, removeFromCart);
router.put("/update/:id", auth, updateQuantity);
router.delete("/clear", auth, clearCart);
router.post("/create-order", auth, createOrder);
router.post("/verify-payment", auth, verifyPayment);

router.get("/my-orders",auth, getMyOrders);
router.get("/order/:status",auth , getOrderByStatus);
// Get single order details
router.get("/:orderId", getOrderById);

// Cancel order (if status is still "confirmed")
router.put("/:orderId/cancel", cancelOrder);

module.exports = router;
