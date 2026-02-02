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
  getOrderById ,
  cancelOrder,
  getOrdersByStatus

} = require("../controllers/cartController");

router.post("/add/:id", auth, addToCart);
router.get("/", auth, getCart);
router.delete("/remove/:id", auth, removeFromCart);
router.put("/update/:id", auth, updateQuantity);
router.delete("/clear", auth, clearCart);
router.post("/create-order", auth, createOrder);
router.post("/verify-payment", auth, verifyPayment);

router.get("/my-orders",auth, getMyOrders);
router.get("/order/:status",auth , getOrdersByStatus);

router.get("/:orderId", getOrderById);
router.put("/:orderId/cancel", cancelOrder);

module.exports = router;
