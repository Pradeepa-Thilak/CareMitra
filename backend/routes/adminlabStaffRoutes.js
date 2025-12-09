const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin');
const labStaffController = require('../controllers/labStaffController');

// Create LabStaff (Admin)
router.post('/', adminAuth, labStaffController.createLabStaff);

// Update LabStaff (Admin)
router.put('/:id', adminAuth, labStaffController.updateLabStaff);

// List All LabStaff (Admin)
router.get('/', adminAuth, labStaffController.listLabStaff);

// Assign Order to LabStaff (Admin)
router.post('/:id/assign-order', adminAuth, labStaffController.assignOrder);

// Update LabStaff Order Status (Admin or LabStaff)
router.put('/:id/order/:orderId',adminAuth, labStaffController.updateOrderStatus);

module.exports = router;
