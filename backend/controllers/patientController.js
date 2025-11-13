const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Get patient profile
const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id).populate('doctors', 'name email specialist');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });

  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Edit patient profile
const editProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const patient = await Patient.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    ).populate('doctors', 'name email specialist');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: patient
    });

  } catch (error) {
    console.error('Edit patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add doctor to patient
const addDoctor = async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and Doctor ID are required'
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if doctor already added
    if (patient.doctors.includes(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Doctor already added to patient'
      });
    }

    // Add doctor to patient and patient to doctor (bidirectional)
    patient.doctors.push(doctorId);
    doctor.patients.push(patientId);

    await patient.save();
    await doctor.save();

    // Populate the updated data
    const updatedPatient = await Patient.findById(patientId).populate('doctors', 'name email specialist');
    const updatedDoctor = await Doctor.findById(doctorId).populate('patients', 'name email');

    res.status(200).json({
      success: true,
      message: 'Doctor added successfully',
      data: {
        patient: updatedPatient,
        doctor: updatedDoctor
      }
    });

  } catch (error) {
    console.error('Add doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  editProfile,
  addDoctor
};