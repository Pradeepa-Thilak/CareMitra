const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/admin");
const adminDashboardController = require('../controllers/adminDashboardController');


router.get("/dashboard", adminAuth, adminDashboardController.getDashboardStats);

module.exports = router;
