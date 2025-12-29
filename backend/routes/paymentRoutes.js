const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const premiumController = require('../controllers/premiumController');
const adminAuth = require('../middleware/admin');
const auth = require('../middleware/auth');
router.get('/plans', premiumController.getPremiumPlans);
router.post('/create-order', auth ,paymentController.createPremiumOrder);
router.post('/verify-payment', auth ,paymentController.verifyPremiumPayment);
router.post('/:doctorId/refund', auth ,adminAuth , paymentController.initiateRefund);

module.exports = router;