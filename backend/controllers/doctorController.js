const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const reschedule = async (req, res) => {
  try {
    const { userId } = req.user;
    const { patientId } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ success: false, message: "Date and time are required" });
    }

    const doctor = await Doctor.findById(userId);
    const patient = await Patient.findById(patientId);

    if (!doctor || !patient) {
      return res.status(404).json({ success: false, message: "Doctor or Patient not found" });
    }

    const docAppointment = doctor.patients.find((p) => p._id.equals(patientId));
    const patAppointment = patient.doctors.find((d) => d._id.equals(userId));

    if (!docAppointment || !patAppointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Update both records
    docAppointment.date = date;
    docAppointment.time = time;
    
    patAppointment.date = date;
    patAppointment.time = time;

    await doctor.save();
    await patient.save();

    res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: { 
        doctor: doctor.name, 
        patient: patient.name, 
        date, 
        time,
        status: docAppointment.status
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

const doctorAppointment = async (req, res) => {
  try {
    const { userId } = req.user;

    const doctor = await Doctor.findById(userId).populate(
      "patients._id",
      "name email phone"
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Format response with patient details
    const appointments = doctor.patients.map(patient => ({
      appointmentId: patient._id,
      patient: {
        _id: patient._id._id,
        name: patient._id.name,
        email: patient._id.email,
        phone: patient._id.phone
      },
      date: patient.date,
      time: patient.time,
      reason: patient.reason,
      status: patient.status
    }));

    res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

const changeStatus = async (req, res) => {
  try {
    const { userId } = req.user;
    const { patientId } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status. Use: pending, confirmed, or cancelled" });
    }

    const doctor = await Doctor.findById(userId);
    const patient = await Patient.findById(patientId);

    if (!doctor || !patient) {
      return res.status(404).json({ success: false, message: "Doctor or Patient not found" });
    }

    // Update in doctor's record
    const docAppointment = doctor.patients.find((p) => p._id.equals(patientId));
    // Update in patient's record
    const patAppointment = patient.doctors.find((d) => d._id.equals(userId));

    if (!docAppointment || !patAppointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    docAppointment.status = status;
    patAppointment.status = status;

    await doctor.save();
    await patient.save();

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: { 
        doctor: doctor.name, 
        patient: patient.name, 
        status,
        date: docAppointment.date,
        time: docAppointment.time
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
module.exports = {
  reschedule,
  doctorAppointment,
  changeStatus
};