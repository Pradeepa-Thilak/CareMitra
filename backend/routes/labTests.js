const express = require('express');
const router = express.Router();
const labTestController = require('../controllers/labTestController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/fileUpload');

// Public routes
// routes/packageRoutes.js
router.get("/featured", labTestController.getAllPackages);
router.get('/', labTestController.getAllLabTests);
router.get('/:key', labTestController.getLabTestByKey);

// Protected routes
router.post('/create-order', auth, upload.single('prescription'), labTestController.createOrder);
router.post('/payment/verify', auth, labTestController.verifyPayment);
router.post('/upload-prescription', auth, upload.single('prescription'), labTestController.uploadPrescription);

// File download routes
router.get('/report/:reportId', auth, labTestController.getReport);

// Get all reports for a patient
router.get('/reports/patient', auth, labTestController.getPatientReports);


router.post('/package-orders', auth, upload.single('prescription'), labTestController.createPackageOrder);

module.exports = router;