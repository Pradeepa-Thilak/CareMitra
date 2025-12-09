const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const premiumController = require('../controllers/premiumController');
const adminAuth = require('../middleware/admin');

router.get('/plans', premiumController.getPremiumPlans);
router.post('/:doctorId/create-order', paymentController.createPremiumOrder);
router.post('/:doctorId/verify-payment', paymentController.verifyPremiumPayment);
router.post('/:doctorId/refund', adminAuth , paymentController.initiateRefund);

module.exports = router;