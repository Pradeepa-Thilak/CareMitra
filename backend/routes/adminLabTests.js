const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const labTestController = require('../controllers/labTestController');
const admin = require('../middleware/admin'); // Your existing admin middleware

// Configure multer for report uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reports/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow PDFs only for reports
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for reports'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for reports
  }
});

// Admin routes
router.put('/order/:id/sample-status', admin, labTestController.updateSampleStatus);
router.put('/order/:id/processing', admin, labTestController.updateProcessingStatus);
router.put('/order/:id/upload-report', admin, upload.single('report'), labTestController.uploadReport);

module.exports = router;