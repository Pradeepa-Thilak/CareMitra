const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin');
const labStaffController = require('../controllers/labStaffController');


router.post('/', adminAuth, labStaffController.createLabStaff);

router.put('/:id', adminAuth, labStaffController.updateLabStaff);

router.get('/', adminAuth, labStaffController.listLabStaff);

router.post('/:id/assign-order', adminAuth, labStaffController.assignOrder);

router.put('/:id/order/:orderId',adminAuth, labStaffController.updateOrderStatus);

router.get('/order' , auth ,labStaffController.listOfOrders);

module.exports = router;
