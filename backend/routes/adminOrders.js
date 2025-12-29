const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/admin");
const controller = require("../controllers/adminOrderController");

router.get("/orders", adminAuth, controller.getAllOrders);
router.patch("/orders/:id/status", adminAuth, controller.updateOrderStatus);

module.exports = router;
