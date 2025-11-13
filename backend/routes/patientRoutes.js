const express = require('express');
const router = express.Router();
const {
  getProfile,
  editProfile,
  addDoctor
} = require('../controllers/patientController');

// @desc    Get patient profile
// @route   GET /api/patient/profile/:id
// @access  Public
router.get('/profile/:id', getProfile);

// @desc    Edit patient profile
// @route   PUT /api/patient/edit/:id
// @access  Public
router.put('/edit/:id', editProfile);

// @desc    Add doctor to patient
// @route   POST /api/patient/add-doctor
// @access  Public
router.post('/add-doctor', addDoctor);

module.exports = router;