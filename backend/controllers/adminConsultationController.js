const ConsultingDoctor = require("../models/ConsultingDoctor");

// ✅ Get all consultations (Admin)
exports.getAllConsultations = async (req, res) => {
  try {
    const consultations = await ConsultingDoctor.find()
      .populate("PatientId", "name phone email")
      .populate("specialistDoctor.doctorId", "name phone specialization")
      .sort({ createdAt: -1 });

    res.json({
      total: consultations.length,
      consultations
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update consultation status
exports.updateConsultationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const consultation = await ConsultingDoctor.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    res.json({ message: "Status updated", consultation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
