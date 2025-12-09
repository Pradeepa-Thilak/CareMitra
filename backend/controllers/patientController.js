const crypto = require("crypto");
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const ConsultingDoctor = require("../models/ConsultingDoctor");


const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendConsultationEmail = async (patientEmail, data) => {
  const htmlContent = `
    <html>
      <body>
        <h2>Your Consultation is Scheduled</h2>
        <p>Dear <strong>${data.patientName}</strong>,</p>
        <p>Your payment has been confirmed and your consultation is ready.</p>

        <p><strong>Doctor:</strong> ${data.doctorName}</p>
        <p><strong>Specialization:</strong> ${data.doctorSpecialization}</p>
        <p><strong>Date:</strong> ${data.appointmentDate}</p>

        <h3>Meeting Links</h3>
        <p><strong>Video:</strong> <a href="${data.videoLink}">${data.videoLink}</a></p>
        <p><strong>Audio:</strong> <a href="${data.audioLink}">${data.audioLink}</a></p>
        <p><strong>Chat:</strong> <a href="${data.chatLink}">${data.chatLink}</a></p>
      </body>
    </html>
  `;

  const msg = {
    to: patientEmail,
    from: "no-reply@caremitra.com",
    subject: "Your Consultation Details",
    html: htmlContent
  };

  await sgMail.send(msg);
};


const viewProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;

    console.log(`Looking for profile: ${userId} (${role})`);

    let profile;

    const Model = role === "doctor" ? Doctor : Patient;

    profile = await Model.findById(userId).select("-otp -otpExpires");

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    console.error("viewProfile error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const editProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { name, specialist } = req.body;

    if (!name && !specialist) {
      return res.status(400).json({ success: false, message: "No data provided for update" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (specialist && role === "doctor") updateData.specialist = specialist;

    const Model = role === "doctor" ? Doctor : Patient;

    const updatedProfile = await Model.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-otp -otpExpires");

    if (!updatedProfile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};
const myAppointment = async (req, res) => {
  try {
    const { userId, role } = req.user;

    console.log(`🔍 Fetching appointments for: ${userId} (${role})`);

    let profile;

    if (role === "patient") {
      profile = await Patient.findById(userId)
        .populate("doctors.doctorId", "name email specialist");
    } else {
      profile = await Doctor.findById(userId)
        .populate("patients.patientId", "name email");
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    const appointments = role === "patient" ? profile.doctors : profile.patients;

    const formatted = appointments.map(a => ({
      id: a._id,
      doctor: role === "patient" ? a.doctorId : undefined,
      patient: role === "doctor" ? a.patientId : undefined,
      date: a.date,
      time: a.time,
      reason: a.reason,
      status: a.status
    }));

    res.json({ success: true, count: formatted.length, data: formatted });

  } catch (err) {
    console.error("myAppointment error:", err);
    res.status(500).json({ success: false, message: "Error fetching appointments" });
  }
};
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason, consultionType } = req.body;
    const patientId = req.user.userId;

    // Validate
    if (!doctorId || !date || !time || !reason || !consultionType) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Check slot
    const slotTaken = doctor.patients.some(
      (a) => a.date === date && a.time === time
    );
    if (slotTaken)
      return res.status(400).json({ error: "Time slot already booked" });

    // --------- FIXED APPOINTMENT OBJECTS ---------

    // Patient side
    const patientAppointment = {
      _id: doctor._id,             // 🔥 FIXED — schema requires _id, not doctorId
      doctorName: doctor.name,
      date,
      time,
      reason,
      status: "pending",
      consultionType              // 🔥 FIXED — correct spelling
    };

    // Doctor side
    const doctorAppointment = {
      _id: patient._id,            // 🔥 FIXED — schema requires _id
      patientName: patient.name,
      date,
      time,
      reason,
      status: "pending",
      consultionType              // 🔥 FIXED — correct spelling
    };

    // ----------------------------------------------

    patient.doctors.push(patientAppointment);
    await patient.save();   // <-- your error comes exactly here

    doctor.patients.push(doctorAppointment);
    await doctor.save();

    res.json({
      success: true,
      message: "Appointment booked successfully",
      data: {
        patientAppointment,
        doctorAppointment
      }
    });

  } catch (error) {
    console.log("BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


const getAllDoctor = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      isActive: true,
      'paymentDetails.paymentStatus': 'completed',
      'paymentDetails.razorpayPaymentId': { $ne: null } // must have a valid payment
    })
    .select('name specialization hospital experience ratings');

    res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
};

const addMember = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const { name, age, gender } = req.body;

    if (!name || !age || !gender) {
      return res
        .status(400)
        .json({ success: false, message: "Name, age and gender are required." });
    }

    const newMember = await ConsultingDoctor.create({
      patientId,
      name,
      age,
      gender,
    });

    return res
      .status(201)
      .json({ success: true, message: "New member created", data: newMember });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const getMember = async (req, res) => {
  try {
    const patientId = req.user.userId;

    const member = await ConsultingDoctor.findOne({ patientId });

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const addSymptoms = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const symptoms = req.body;

    if (!patientId || !symptoms) {
      return res.status(400).json({
        success: false,
        message: "Patient ID and symptoms required",
      });
    }

    let member = await ConsultingDoctor.findOne({ patientId });

    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found in DB" });
    }

    member.symptoms = symptoms;
    await member.save();

    return res.status(200).json({
      success: true,
      message: "Symptoms saved successfully",
      data: member,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
const selectSpecialist = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const specialist = req.body; // example: { specialization: "Cardiologist" }

    if (!patientId || !specialist) {
      return res.status(400).json({
        success: false,
        message: "Patient ID and specialist are required."
      });
    }

    // Find the patient’s ConsultingDoctor record
    let savedRecord = await ConsultingDoctor.findOne({ patientId });

    if (!savedRecord) {
      return res.status(404).json({
        success: false,
        message: "No data found for this patient."
      });
    }

    // Save specialization
    savedRecord.specialization = specialist;
    await savedRecord.save();

    return res.status(200).json({
      success: true,
      message: "Specialist stored successfully.",
      data: savedRecord
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// Auto-assign doctor
const assignDoctor = async (consult) => {
  const specialization = consult.specialization;

  const doctor = await Doctor.findOne({
    specialization,
    isAvailable: true
  });

  if (!doctor) return null;

  consult.specialistDoctor = {
    doctorId: doctor._id,
    name: doctor.name,
    department: doctor.department || specialization
  };

  await consult.save();
  return doctor;
};

// Generate meeting links
const generateMeetingLinks = (doctor, consult) => {
  const randomId = () => Math.random().toString(36).substring(2, 10);
  const uniqueRoom = `consult-${doctor._id}-${randomId()}`;
  const jitsiBase = "https://meet.jit.si";

  const type = consult.consultationType; // video | audio | chat

  // Base empty structure
  consult.meetingLinks = {
    video: null,
    audio: null,
    chat: null
  };

  // -----------------------------
  // VIDEO CONSULTATION
  // -----------------------------
  if (type === "video") {
    consult.meetingLinks.video = {
      url: `${jitsiBase}/${uniqueRoom}`,
      meetingId: uniqueRoom,
      password: null,
      platform: "jitsi"
    };
  }

  // -----------------------------
  // AUDIO CONSULTATION
  // -----------------------------
  if (type === "audio") {
    consult.meetingLinks.audio = {
      conferenceNumber: null,
      accessCode: null,
      dialInInstructions: `${jitsiBase}/${uniqueRoom}?audio=1`
    };
  }

  // -----------------------------
  // CHAT CONSULTATION
  // -----------------------------
  if (type === "chat") {
    let chatUrl = "";
    let chatPlatform = "custom_chat";

    if (doctor.phoneNumber) {
      chatUrl = `https://wa.me/${doctor.phoneNumber}?text=Hello Doctor`;
      chatPlatform = "whatsapp";
    } else if (doctor.telegramUser) {
      chatUrl = `https://t.me/${doctor.telegramUser}`;
      chatPlatform = "telegram";
    } else {
      chatUrl = `https://your-domain.com/chat/${uniqueRoom}`;
    }

    consult.meetingLinks.chat = {
      roomId: uniqueRoom,
      platform: chatPlatform,
      url: chatUrl
    };
  }

  return consult;
};

// MAIN FUNCTION
const verifyPayment = async (req, res) => {
  try {
    const patientId = req.user.userId;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const consult = await ConsultingDoctor.findOne({ PatientId: patientId });

    if (!consult) {
      return res.status(404).json({
        success: false,
        message: "Consulting record not found."
      });
    }

    // Payment signature verification
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      consult.paymentDetails.status = "failed";
      await consult.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed."
      });
    }

    // Payment success
    consult.paymentDetails = {
      amount: consult.paymentDetails.amount,
      currency: "INR",
      status: "completed",
      transactionId: razorpay_payment_id,
      paymentMethod: "upi",  // Change based on frontend
      paidAt: new Date()
    };

    await consult.save();

    // Assign doctor
    const doctor = await assignDoctor(consult);

    if (!doctor) {
      return res.status(200).json({
        success: true,
        message: "Payment verified but no available doctor.",
      });
    }

    // Generate meeting links
    generateMeetingLinks(doctor, consult);
    await consult.save();

  

    let finalLink = null;

if (consult.consultingType === "video") {
  finalLink = consult.meetingLinks.video?.url || null;
}

if (consult.consultingType === "audio") {
  finalLink = consult.meetingLinks.audio?.dialInInstructions || null;
}

if (consult.consultingType === "chat") {
  // chat may have url or roomId only
  finalLink = consult.meetingLinks.chat?.url || consult.meetingLinks.chat?.roomId || null;
}



    // 6️⃣ Send Email to Patient
  await sendConsultationEmail(consult.PatientId.email, {
  patientName: consult.name,
  doctorName: consult.specialistDoctor.name,
  doctorSpecialization: consult.specialistDoctor.department,
  appointmentDate: consult.appointmentDate,
  consultationType: consult.consultationType,
  meetingLink: finalLink
});



    return res.status(200).json({
      success: true,
      message: "Payment verified, doctor assigned & meeting links generated.",
      assignedDoctor: consult.specialistDoctor,
      meetingLinks: consult.meetingLinks
    });

  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during payment verification."
    });
  }
};




module.exports = {
  viewProfile,
  editProfile,
  myAppointment,
  bookAppointment,
  getAllDoctor,
  addMember,
  getMember,
  addSymptoms,
  verifyPayment,
  selectSpecialist
}