const express = require('express');
const router = express.Router();
const  adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/admin');
const {registerDoctor} = require("../controllers/doctorController");
// doctor Details
router.get('/doctors/pending', adminAuth, adminController.getPendingDoctors);
router.get('/doctors', adminAuth, adminController.getAllDoctors);
router.patch('/doctors/:doctorId/verify', adminAuth, adminController.verifyDoctorApplication);
router.post("/register/doctor" ,adminAuth ,registerDoctor);
// patient details
router.get('/patients', adminAuth , adminController.getAllPatients);

module.exports = router;