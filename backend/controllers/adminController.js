const Doctor = require('../models/Doctor');
const { sendOTPEmail } = require('../utils/sendEmail');
 const Patient = require('../models/Patient');


const getPendingDoctors = async (req, res) => {
  try {
   
    const pendingDoctors = await Doctor.find({
      verificationStatus: "pending"
    }).select(
      "name email specialization medicalLicenseNumber documents premiumPlan addedAt paymentDetails"
    );

    let approvedDoctors = [];
    
   
    for (const doc of pendingDoctors) {
      
      if (doc.paymentDetails.paymentStatus !== "completed") {
        continue;
      } 
      else {
       
        approvedDoctors.push(doc);
      }
    }

    res.json({
      success: true,
      count: approvedDoctors.length,
      doctors: approvedDoctors
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



const verifyDoctorApplication = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, notes, rejectionReason } = req.body;
    const adminId = req.admin.id;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Use 'verified' or 'rejected'"
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (doctor.verificationStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Doctor already ${doctor.verificationStatus}`
      });
    }

    if (doctor.paymentDetails.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Doctor has not completed payment'
      });
    }

    doctor.verificationStatus = status;
    doctor.verificationNotes = notes;
    doctor.verifiedBy = adminId;
    doctor.verifiedAt = new Date();

    if (status === 'verified') {
      doctor.isActive = true;
      doctor.premiumPlan.isActive = true;
      doctor.dailyStats.maxPatientsAllowed = doctor.premiumPlan.patientLimit;
      doctor.isAvailableToday = true;

      // Send welcome email
      await sendOTPEmail(
        doctor.email,
        'Application Verified - Welcome!',
        `Dear Dr. ${doctor.name},\n\nCongratulations! Your application has been verified.\n\nYour premium plan (${doctor.premiumPlan.selectedPlan}) is now active.\n\nYou can now log in and start accepting patients.`
      );

      await doctor.save();

      return res.json({
        success: true,
        message: "Doctor verified and activated successfully",
        doctor: {
          name: doctor.name,
          email: doctor.email,
          plan: doctor.premiumPlan.selectedPlan,
          patientLimit: doctor.premiumPlan.patientLimit
        }
      });

    } else if (status === 'rejected') {
      doctor.isActive = false;
      doctor.premiumPlan.isActive = false;
      doctor.rejectionReason = rejectionReason;

      await doctor.save();

      await sendOTPEmail(
        doctor.email,
        'Application Status Update',
        `Dear Dr. ${doctor.name},\n\nAfter careful review, we regret to inform you that your application has been rejected.\n\nReason: ${rejectionReason}\n\nYour payment will be refunded within 5-7 business days.`
      );
      return res.json({
        success: true,
        message: "Doctor application rejected",
        data: {
          doctorId: doctor._id,
          email: doctor.email,
          amountPaid: doctor.premiumPlan.amount,
          paymentId: doctor.paymentDetails.razorpayPaymentId,
          actionRequired: 'initiate_refund'
        }
      });
    }
  } catch (error) {
    console.error("Verify doctor error:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select('name email phone gender experience specialization verificationStatus paymentStatus premiumPlan isActive addedAt')
      .sort({ addedAt: -1 });

    const stats = {
      total: doctors.length,
      verified: doctors.filter(d => d.verificationStatus === 'verified').length,
      pending: doctors.filter(d => d.verificationStatus === 'pending').length,
      rejected: doctors.filter(d => d.verificationStatus === 'rejected').length,
      active: doctors.filter(d => d.isActive).length
    };

    res.json({
      success: true,
      stats,
      doctors
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllPatients = async (req , res) =>{
  try{
    let patients = await Patient.find();
    res.json({
      success : true,
      patients
    });
  }catch(err){
     res.status(500).json({ success: false, error: error.message });
  }
}
module.exports = {
  getPendingDoctors,
  verifyDoctorApplication,
  getAllDoctors,
  getAllPatients
};