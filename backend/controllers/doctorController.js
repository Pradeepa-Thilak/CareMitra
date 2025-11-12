const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Get doctor profile
const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).populate('patients', 'name email');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });

  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Edit doctor profile
const editProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialist } = req.body;

    if (!name && !specialist) {
      return res.status(400).json({
        success: false,
        message: 'Name or specialist is required'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (specialist) updateData.specialist = specialist;

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patients', 'name email');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: doctor
    });

  } catch (error) {
    console.error('Edit doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add patient to doctor
const addPatient = async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    if (!doctorId || !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and Patient ID are required'
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

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if patient already added
    if (doctor.patients.includes(patientId)) {
      return res.status(400).json({
        success: false,
        message: 'Patient already added to doctor'
      });
    }

    // Add patient to doctor and doctor to patient (bidirectional)
    doctor.patients.push(patientId);
    patient.doctors.push(doctorId);

    await doctor.save();
    await patient.save();

    // Populate the updated data
    const updatedDoctor = await Doctor.findById(doctorId).populate('patients', 'name email');
    const updatedPatient = await Patient.findById(patientId).populate('doctors', 'name email specialist');

    res.status(200).json({
      success: true,
      message: 'Patient added successfully',
      data: {
        doctor: updatedDoctor,
        patient: updatedPatient
      }
    });

  } catch (error) {
    console.error('Add patient error:', error);
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
  addPatient
};