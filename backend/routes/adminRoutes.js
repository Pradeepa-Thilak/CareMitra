const express = require('express');
const router = express.Router();
const  adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/admin');

router.get('/doctors/pending', adminAuth, adminController.getPendingDoctors);
router.get('/doctors', adminAuth, adminController.getAllDoctors);
router.put('/doctors/:doctorId/verify', adminAuth, adminController.verifyDoctorApplication);


module.exports = router;