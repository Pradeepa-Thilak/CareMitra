const express = require('express');
const router = express.Router();
const {
  getProfile,
  editProfile,
  addPatient
} = require('../controllers/doctorController');

// @desc    Get doctor profile
// @route   GET /api/doctor/profile/:id
// @access  Public
router.get('/profile/:id', getProfile);

// @desc    Edit doctor profile
// @route   PUT /api/doctor/edit/:id
// @access  Public
router.put('/edit/:id', editProfile);

// @desc    Add patient to doctor
// @route   POST /api/doctor/add-patient
// @access  Public
router.post('/add-patient', addPatient);

module.exports = router;