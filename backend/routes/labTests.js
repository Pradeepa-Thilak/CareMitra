const express = require('express');
const router = express.Router();
const labTestController = require('../controllers/labTestController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/fileUpload');

// Public routes
router.get('/', labTestController.getAllLabTests);
router.get('/:key', labTestController.getLabTestByKey);

// Protected routes
router.post('/order', auth, upload.single('prescription'), labTestController.createOrder);
router.post('/payment/verify', auth, labTestController.verifyPayment);
router.post('/upload-prescription', auth, upload.single('prescription'), labTestController.uploadPrescription);

// File download routes
router.get('/report/:reportId', auth, labTestController.getReport);



module.exports = router;