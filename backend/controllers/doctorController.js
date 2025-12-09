const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { sendAppointmentStatusEmail, sendRescheduleEmail } = require('../utils/sendEmail');
const crypto = require('crypto');
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { emailTemplates , sendOTPEmail } = require('../utils/sendEmail');

function generateVideoLink() {
  return `https://meet.jit.si/${crypto.randomUUID()}`;
}

const generateChatSession = () => {
  return "chat_" + Math.random().toString(36).substring(2, 15);
};

const sendVideoLinkEmail = async (patientEmail, patientName, doctorName, date, time, meetLink) => {
  const template = emailTemplates.videoConsultationConfirmed(
    patientName,
    doctorName,
    date,
    time,
    meetLink
  );
  
  await sgMail.send({
    to: patientEmail,
    from: process.env.EMAIL_FROM,
    subject: template.subject,
    html: template.html
  });
};

const sendChatSessionEmail = async (patientEmail, patientName, doctorName, date, time, chatId) => {
  const template = emailTemplates.chatConsultationConfirmed(
    patientName,
    doctorName,
    date,
    time,
    chatId
  );
  
  await sgMail.send({
    to: patientEmail,
    from: process.env.EMAIL_FROM,
    subject: template.subject,
    html: template.html
  });
};

// Add this function before the registerDoctor function
const notifyAdminAboutNewDoctor = async (doctor) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@caremitra.com';
    
    const adminNotificationHtml = `
      <h3>New Doctor Registration</h3>
      <p>A new doctor has registered on the platform:</p>
      <ul>
        <li><strong>Name:</strong> ${doctor.name}</li>
        <li><strong>Email:</strong> ${doctor.email}</li>
        <li><strong>Specialization:</strong> ${doctor.specialization}</li>
        <li><strong>License Number:</strong> ${doctor.medicalLicenseNumber}</li>
        <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
      </ul>
      <p>Please review the application in the admin panel.</p>
      <p><a href="${process.env.ADMIN_PANEL_URL || 'http://localhost:3000/admin'}">Go to Admin Panel</a></p>
    `;

    await sendOTPEmail(
      adminEmail,
      'New Doctor Registration - CareMitra',
      '',
      adminNotificationHtml
    );
    
    console.log('✅ Admin notification sent for new doctor:', doctor.email);
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error);
    // Don't throw error - admin notification failure shouldn't break registration
  }
};

const doctorAppointment = async (req, res) => {
  try {
    console.log('Doctor appointments request received');
    console.log('Request user:', req.user);
    
    const { userId, email, role } = req.user;
    console.log('User details:', { userId, email, role });

    // Check if user is a doctor
    if (role !== 'doctor') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Doctor account required." 
      });
    }

    const doctor = await Doctor.findById(userId).populate("patients._id", "name email phone");

    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: "Doctor not found" 
      });
    }

    // Build appointments array
    const appointments = doctor.patients.map(patientAppt => {
      // Default patient info
      let patientInfo = {
        _id: patientAppt._id,
        name: "Unknown Patient",
        email: "",
        phone: ""
      };

      // If patient populated
      if (patientAppt._id && typeof patientAppt._id === 'object') {
        patientInfo = {
          _id: patientAppt._id._id,
          name: patientAppt._id.name || "Unknown Patient",
          email: patientAppt._id.email || "",
          phone: patientAppt._id.phone || ""
        };
      }

      return {
        appointmentId: patientAppt._id,
        patient: patientInfo,
        date: patientAppt.date,
        time: patientAppt.time,
        reason: patientAppt.reason,
        status: patientAppt.status,
        consultionType: patientAppt.consultionType // ✅ Correctly added
      };
    });

    console.log('Final appointments count:', appointments.length);
    console.log('Appointment details:', appointments.map(a => ({
      patient: a.patient.name,
      date: a.date,
      status: a.status,
      consultionType: a.consultionType
    })));
    
    res.status(200).json({ 
      success: true, 
      data: appointments,
      message: `Found ${appointments.length} appointments`
    });

  } catch (err) {
    console.error('Error in doctorAppointment:', err);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};

const changeStatus = async (req, res) => {
  try {
    console.log('Change status request received');
    console.log('Request user:', req.user);
    
    const { userId, email, role } = req.user;
    const { patientId } = req.params;
    const { status } = req.body;

    console.log('User details:', { userId, email, role});
    console.log('Patient ID:', patientId);
    console.log('New status:', status);

    // Check if user is a doctor
    if (role !== 'doctor') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Doctor account required." 
      });
    }

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    let doctor = await Doctor.findById(userId);

    // Find doctor based on which collection they're in
    // if (role === 'doctor') {
    //   doctor = await Doctor.findById(userId);
    // } else if (role === 'patient') {
    //   doctor = await Doctor.findOne({ email: email });
    // } else {
    //   return res.status(403).json({ 
    //     success: false, 
    //     message: "Invalid user type for doctor operations." 
    //   });
    // }

    console.log('Found doctor:', doctor ? doctor.name : 'NOT FOUND');
    
    if (!doctor) return res.status(403).json({ success: false, message: "Doctor account required" });

    //  CRITICAL FIX: Ensure patients array exists
    if (!doctor.patients) {
      console.log('doctor.patients is undefined, initializing empty array');
      doctor.patients = [];
    }

    const patient = await Patient.findById(patientId);
    console.log('Found patient:', patient ? patient.name : 'NOT FOUND');
    
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    // 🔥 CRITICAL FIX: Ensure doctors array exists
    if (!patient.doctors) {
      console.log('patient.doctors is undefined, initializing empty array');
      patient.doctors = [];
    }

    console.log('Doctor patients array:', doctor.patients);
    console.log('Patient doctors array:', patient.doctors);

    const docAppointment = doctor.patients.find(p => String(p._id) === String(patientId));
    const patAppointment = patient.doctors.find(d => String(d._id) === String(doctor._id));

    console.log(' Doctor appointment:', docAppointment ? 'FOUND' : 'NOT FOUND');
    console.log(' Patient appointment:', patAppointment ? 'FOUND' : 'NOT FOUND');

    // If no appointment found, return error
    if (!docAppointment || !patAppointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found between this doctor and patient" 
      });
    }

    const oldStatus = docAppointment.status;

    // SPECIAL HANDLING FOR CANCELLED STATUS
    if (status === 'cancelled') {
      console.log(' Removing appointment relationship');
      
      // Store appointment info before removal
      const patientEmail = patient.email;
      const patientName = patient.name;
      const appointmentDate = docAppointment.date;
      const appointmentTime = docAppointment.time;
      const appointmentReason = docAppointment.reason;
      const appointmentType = docAppointment.consultionType;

      // 1. Remove patient from doctor's patients array
      const initialDoctorCount = doctor.patients.length;
      doctor.patients = doctor.patients.filter(p => String(p._id) !== String(patientId));
      const doctorRemoved = doctor.patients.length < initialDoctorCount;
      console.log(' Removed from doctor.patients:', doctorRemoved);

      // 2. Remove doctor from patient's doctors array
      const initialPatientCount = patient.doctors.length;
      patient.doctors = patient.doctors.filter(d => String(d._id) !== String(doctor._id));
      const patientRemoved = patient.doctors.length < initialPatientCount;
      console.log('Removed from patient.doctors:', patientRemoved);

      // Save changes
      await doctor.save();
      await patient.save();

      // Send cancellation email
      try {
        await sendAppointmentStatusEmail(
          patientEmail, 
          patientName, 
          doctor.name, 
          status, 
          { 
            date: appointmentDate, 
            time: appointmentTime, 
            reason: appointmentReason,
            status: oldStatus,
            consultionType : appointmentType
          }, 
          oldStatus
        );
        console.log('✅ Cancellation email sent');
      } catch (emailError) {
        console.error('Cancellation email failed:', emailError);
      }

      return res.status(200).json({
        success: true,
        message: "Appointment cancelled successfully",
        data: {
          doctor: doctor.name,
          patient: patientName,
          status: 'cancelled',
          date: appointmentDate,
          time: appointmentTime,
          consultionType : appointmentType,
          appointmentRemoved: true
        }
      });
    } 
    // NORMAL STATUS UPDATE FOR OTHER STATUSES
    else {
      console.log(' Updating appointment status to:', status);
      
      // Update status in both doctor and patient appointments
      docAppointment.status = status;
      patAppointment.status = status;

      // Generate and send meeting/chat links for confirmed appointments
      if (status === "confirmed") {
        console.log("Appointment confirmed, checking consultation type...");

        const appointmentDate = docAppointment.date;
        const appointmentTime = docAppointment.time;

        // VIDEO CONSULTATION
        if (patAppointment.consultionType === "video") {
          console.log(" Generating video meeting link...");

          const meetLink = generateVideoLink();
          // docAppointment.meetLink = meetLink;
          // patAppointment.meetLink = meetLink;

          await sendVideoLinkEmail(
            patient.email,
            patient.name,
            doctor.name,
            appointmentDate,
            appointmentTime,
            meetLink
          );
          console.log("Video link email sent!");
        }

        // CHAT CONSULTATION
        else if (patAppointment.consultionType === "chat") {
          console.log("Generating chat session...");

          const chatId = generateChatSession();
          // docAppointment.chatSessionId = chatId;
          // patAppointment.chatSessionId = chatId;

          await sendChatSessionEmail(
            patient.email,
            patient.name,
            doctor.name,
            appointmentDate,
            appointmentTime,
            chatId
          );
          console.log(" Chat session email sent!");
        }
      }

      // Save changes
      await doctor.save();
      await patient.save();

      // Send email notification
      try {
        await sendAppointmentStatusEmail(
          patient.email, 
          patient.name, 
          doctor.name, 
          status, 
          docAppointment, 
          oldStatus
        );
        console.log('Status update email sent');
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }

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
    }
  } catch (err) {
    console.error(' Error in changeStatus:', err);
    console.error(' Error stack:', err.stack);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};

// Reschedule appointment - UPDATED for your auth middleware
const reschedule = async (req, res) => {
  try {
    console.log(' Reschedule request received');
    console.log(' Request user:', req.user);
    
    const { userId, email, role, model } = req.user;
    const { patientId } = req.params;
    const { date, time } = req.body;

    console.log('User details:', { userId, email, role, model });
    console.log(' Patient ID:', patientId);
    console.log(' New date:', date);
    console.log(' New time:', time);

    // Check if user is a doctor
    if (role !== 'doctor') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Doctor account required." 
      });
    }

    if (!date || !time) {
      return res.status(400).json({ success: false, message: "Date and time are required" });
    }

    let doctor;

    
    if (model === 'Doctor') {
      doctor = await Doctor.findById(userId);
    } else if (model === 'User') {
      doctor = await Doctor.findOne({ email: email });
    } else {
      return res.status(403).json({ 
        success: false, 
        message: "Invalid user type for doctor operations." 
      });
    }

    console.log('Found doctor:', doctor ? doctor.name : 'NOT FOUND');
    
    if (!doctor) return res.status(403).json({ success: false, message: "Doctor account required" });

    const patient = await Patient.findById(patientId);
    console.log('Found patient:', patient ? patient.name : 'NOT FOUND');
    
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    const docAppointment = doctor.patients.find(p => String(p._id) === String(patientId));
    const patAppointment = patient.doctors.find(d => String(d._id) === String(doctor._id));

    console.log(' Doctor appointment:', docAppointment ? 'FOUND' : 'NOT FOUND');
    console.log('Patient appointment:', patAppointment ? 'FOUND' : 'NOT FOUND');

    if (!docAppointment || !patAppointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Store old date and time for email
    const oldDate = docAppointment.date;
    const oldTime = docAppointment.time;

    // Update dates
    docAppointment.date = date;
    docAppointment.time = time;
    patAppointment.date = date;
    patAppointment.time = time;

    await doctor.save();
    await patient.save();

    // Send reschedule email notification to patient
    try {
      await sendRescheduleEmail(
        patient.email, 
        patient.name, 
        doctor.name, 
        oldDate, 
        oldTime, 
        date, 
        time
      );
    } catch (emailError) {
      console.error('Reschedule email notification failed:', emailError);
      // Continue even if email fails
    }

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
    console.error('❌ Error in reschedule:', err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Add a new doctor
const registerDoctor = async (req, res) => {
  try {
    const doctorData = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ 
      $or: [
        { email: doctorData.email },
        { medicalLicenseNumber: doctorData.medicalLicenseNumber }
      ]
    });
    
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email or license number already exists'
      });
    }

    // Set initial status
    doctorData.verificationStatus = 'pending'; // pending, verified, rejected
    doctorData.paymentStatus = 'pending'; // pending, completed, refunded
    doctorData.isActive = false;
    doctorData.premiumPlan = {
      selectedPlan: null,
      amount: 0,
      patientLimit: 0,
      isActive: false,
      purchasedAt: null,
      expiresAt: null
    };

    const doctor = new Doctor(doctorData);
    await doctor.save();

    // Send confirmation email to doctor
    await sendOTPEmail(
      doctor.email,
      'Doctor Registration Received',
      `Dear Dr. ${doctor.name},\n\nYour registration has been received. Please proceed to select a premium plan.`
    );

    // Notify admin about new registration
    await notifyAdminAboutNewDoctor(doctor);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please select a premium plan.',
      data: {
        doctorId: doctor._id,
        nextStep: 'select-premium'
      }
    });

  } catch (error) {
    console.error("Register doctor error:", error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
};

// Get doctor's details for premium selection
const getDoctorForPremium = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const doctor = await Doctor.findById(doctorId)
      .select('name email verificationStatus paymentStatus premiumPlan');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


module.exports = {
  reschedule,
  doctorAppointment,
  changeStatus,
  registerDoctor,
  getDoctorForPremium
};