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

router.get('/profile', auth ,labStaffController.getStaffProfile);
router.put('/availability', auth ,labStaffController.toggleAvailability);

// Order routes
router.get('/order', auth ,labStaffController.getStaffOrders);
router.get('/order/:orderId', auth ,labStaffController.getOrderById);
router.put('/order/:orderId/status', auth ,labStaffController.updateOrderStatus);

// Collection workflow
router.post('/order/:orderId/start-collection', auth ,labStaffController.startCollection);
router.post('/order/:orderId/complete-collection', auth ,labStaffController.completeCollection);


module.exports = router;
