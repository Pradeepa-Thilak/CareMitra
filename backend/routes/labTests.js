const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const labTestController = require('../controllers/labTestController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/prescriptions/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// ✔️ Correct route order
router.get('/key/:key', labTestController.getLabTestByKey);
router.get('/', auth , admin ,labTestController.getAllLabTests);

// Protected routes
router.post('/order', auth, upload.single('prescription'), labTestController.createOrder);
router.post('/payment/verify', auth, labTestController.verifyPayment);
router.post('/upload-prescription', auth, upload.single('prescription'), labTestController.uploadPrescription);

module.exports = router;
