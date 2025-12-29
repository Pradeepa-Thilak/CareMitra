const crypto = require("crypto");
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const ConsultingDoctor = require("../models/ConsultingDoctor");
// const Member = require('../models/Member');
// const {razorpay,createOrder} = require('../config/razorpay');

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

    console.log(`Fetching appointments for: ${userId} (${role})`);

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

    // Patient side
    const patientAppointment = {
      _id: doctor._id,            
      doctorName: doctor.name,
      date,
      time,
      reason,
      status: "pending",
      consultionType           
    };

    const doctorAppointment = {
      _id: patient._id,           
      patientName: patient.name,
      date,
      time,
      reason,
      status: "pending",
      consultionType           
    };

    // ----------------------------------------------

    patient.doctors.push(patientAppointment);
    await patient.save();   

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
      'paymentDetails.razorpayPaymentId': { $ne: null } 
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
    const { name, age, gender, phone } = req.body;

    if (!name || !age) {
      return res.status(400).json({
        success: false,
        message: "Name and age are required"
      });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    const newMember = {
      name,
      age,
      gender,
      phoneNumber: phone  // <-- Here's the issue
    };

    patient.members.push(newMember);
    await patient.save();

    // return the LAST added member
    const savedMember = patient.members[patient.members.length - 1];

    return res.status(201).json({
      success: true,
      member: savedMember
    });

  } catch (err) {
    console.error("Add member error:", err);  // <-- Check backend logs
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getMember = async (req, res) => {
  try {
    const patientId = req.user.userId;

    // Find patient by ID
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Return members array from patient document
    return res.status(200).json({
      success: true,
      data: patient.members || [], // Always return array, even if empty
    });
  } catch (err) {
    console.error("Get members error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const addSymptoms = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const { memberId, symptoms } = req.body;  // FIXED

    if (!memberId || !symptoms) {
      return res.status(400).json({
        success: false,
        message: "Member ID and symptoms required",
      });
    }

    let member = await ConsultingDoctor.findOne({
      memberId: memberId,
      PatientId: patientId
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found in DB"
      });
    }

    member.symptoms = symptoms;
    await member.save();

    return res.status(200).json({
      success: true,
      message: "Symptoms saved successfully",
      data: member
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const assignDoctor = async (consult, specialization) => {
  const doctor = await Doctor.findOne({
    specialization,
    isActive: true,
  });


  if(!doctor || !doctor.paymentDetails || !doctor.isActive || !doctor.premiumPlan){
    return null;
  }

  consult.specialistDoctor = {
    doctorId: doctor._id,
    name: doctor.name,
    phone: doctor.phone,
  };

  return doctor;
};

// Select specialist for a specific member
const selectSpecialist = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const { memberId, specialization } = req.body;

    if (!patientId || !specialization || !memberId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID, member ID, and specialization are required.",
      });
    }

    // Fetch the consultation for this patient & member
    const consult = await ConsultingDoctor.findOne({
      PatientId: patientId,
      memberId,
    });

    if (!consult) {
      return res.status(404).json({
        success: false,
        message: "No consultation found for this member.",
      });
    }

    // Save specialization
    consult.specialization = specialization;

    // Assign doctor
    const doctor = await assignDoctor(consult, specialization);
    if (!doctor) {
      return res.status(200).json({
        success: true,
        message: "No available doctor.",
      });
    }

    // Calculate fee based on consulting type
    const baseFee = doctor.baseConsultationFee || 0;
    let finalAmount = 0;

    switch (consult.consultingType) {
      case "audio":
        finalAmount = baseFee * 100;
        break;
      case "video":
        finalAmount = baseFee * 200;
        break;
      default:
        finalAmount = baseFee * 50;
    }

    // Ensure paymentDetails object exists
    if (!consult.paymentDetails) consult.paymentDetails = {};

    //  Safely update paymentDetails
    consult.paymentDetails = {
      ...consult.paymentDetails,
      amount: finalAmount,
      currency: consult.paymentDetails?.currency || "INR",
      status: consult.paymentDetails?.status || "pending",
    };

    await generateMeetingLinks(doctor, consult);

    await consult.save();

    return res.status(200).json({
      success: true,
      message: "Specialist stored successfully.",
      data: consult,
    });
  } catch (err) {
    console.error("Select Specialist Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Generate meeting links
const generateMeetingLinks = (doctor, consult) => {
  const randomId = () => Math.random().toString(36).substring(2, 10);
  const uniqueRoom = `consult-${doctor._id}-${randomId()}`;
  const jitsiBase = "https://meet.jit.si";

  const type = consult.consultingType; // video | audio | chat

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

// CREATE ORDER FOR PAYMENT
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret'
});

const createorder = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ success: false, message: "memberId is required" });
    }

    const consult = await ConsultingDoctor.findOne({ PatientId: patientId,  memberId });

    if (!consult) {
      return res.status(404).json({ success: false, message: "Consultation not found" });
    }

    // Prevent multiple orders for same consult
    if (consult.paymentDetails?.razorpayOrderId) {
      return res.status(400).json({ success: false, message: "Order already created" });
    }

    const amount = Number(consult.paymentDetails?.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Consultation amount not calculated" });
    }

    const receipt = `consult_${consult._id}`;

    // Razorpay Order
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt,
      payment_capture: 1,
    });

    consult.paymentDetails = {
      amount,
      currency: "INR",
      status: "pending",
      razorpayOrderId: order.id,
      razorpayPaymentId: null,
      razorpaySignature: null,
      paidAt: null,
    };

    await consult.save();

    return res.status(200).json({
      success: true,
      paymentDetails: consult.paymentDetails,
      rzpOrder: order,
      appointmentId: consult._id,
      message: "Order created"
    });

  } catch (err) {
    console.log("Razorpay Error:", err);
    return res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: err.message,
    });
  }
};



// VERIFY PAYMENT AND TRANSFER TO DOCTOR
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      memberId,
    } = req.body;

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature|| !memberId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification fields",
      });
    }

    // 1️⃣ Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
   console.log(memberId);
    // 2️⃣ Fetch consultation record
    const consult = await ConsultingDoctor.findOne({
      memberId,
      "paymentDetails.razorpayOrderId": razorpay_order_id
    });
    console.log(consult);

    if (!consult) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    consult.paymentDetails = {
      ...consult.paymentDetails,
      status: "paid",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      razorpayOrderId: razorpay_order_id,
      paidAt: new Date(),
    };

    await consult.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and appointment confirmed",
      appointmentId: consult._id,
      paymentId: razorpay_payment_id,
    });

  } catch (err) {
    console.error("Verify Payment Error:", err);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: err.message,
    });
  }
};


// CHECK PAYMENT STATUS
const checkPaymentStatus = async (req, res) => {
    try {
        const patientId = req.user.userId;
        const consult = await ConsultingDoctor.findOne({ PatientId: patientId });
        
        if (!consult || !consult.paymentDetails) {
            return res.status(404).json({
                success: false,
                message: "No payment record found"
            });
        }
        
        return res.status(200).json({
            success: true,
            paymentStatus: consult.paymentDetails.status,
            // orderId: consult.paymentDetails.orderId,
            amount: consult.paymentDetails.amount,
            createdAt: consult.createdAt
        });
        
    } catch (error) {
        console.error("Check Payment Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to check payment status"
        });
    }
};

const consultingType = async (req, res) => {
  try {
    const memberId = req.params.id;
    const { consultingType } = req.body;
    
    console.log("Request received:", { memberId, consultingType });

    // Validation
    if (!memberId || !consultingType) {
      return res.status(400).json({ 
        success: false,
        message: "Member ID and consultation type are required" 
      });
    }

    const type = consultingType.toLowerCase();
    if (!['video', 'audio', 'chat'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid consultation type" 
      });
    }

    // Find patient and member
    const patient = await Patient.findOne({
      "members._id": memberId
    });

    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: "Member not found" 
      });
    }

    const member = patient.members.id(memberId);
    if (!member) {
      return res.status(404).json({ 
        success: false,
        message: "Member not found" 
      });
    }

    // Create or update consultation
    let consultation = await ConsultingDoctor.findOneAndUpdate(
      {
        PatientId: patient._id,
        name: member.name
      },
      {
        PatientId: patient._id,
        memberId ,
        name: member.name,
        age: member.age,
        gender: member.gender,
        phoneNumber: member.phoneNumber,
        consultingType: type,
        appointmentDate: new Date(),
        status: "scheduled"
      },
      {
        upsert: true, // Create if doesn't exist
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({ 
      success: true,
      message: "Consultation type saved successfully",
      data: {
        consultationId: consultation._id,
        consultingType: consultation.consultingType,
        memberName: consultation.name
      }
    });

  } catch (err) {
    console.error("Error in consultingType:", err);
    
    if (err.name === "CastError") {
      return res.status(400).json({ 
        success: false,
        message: "Invalid ID format" 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};


const getMemberById = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const memberId = req.params.memberId;

    // Find patient
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Find specific member in patient's members array
    const member = patient.members.id(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.status(200).json({
      success: true,
      member: {
        id: member._id,
        name: member.name,
        age: member.age,
        gender: member.gender,
        phone: member.phoneNumber, // Fixed: phoneNumber not number
      },
    });
  } catch (err) {
    console.error("Get member by ID error:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteMember = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const memberId = req.params.id;

    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { $pull: { members: { _id: memberId } } },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient or member not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member deleted successfully"
    });

  } catch (err) {
    console.error("Delete member error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const updateMember = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const memberId = req.params.id;
    const { name, age, gender, phone } = req.body;

    // Find patient
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Find the member
    const member = patient.members.id(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    // Update fields
    if (name) member.name = name;
    if (age) member.age = age;
    if (gender) member.gender = gender;
    if (phone) member.phoneNumber = phone;

    // Save the patient document
    await patient.save();

    return res.status(200).json({
      success: true,
      member: {
        id: member._id,
        name: member.name,
        age: member.age,
        gender: member.gender,
        phoneNumber: member.phoneNumber,
      }
    });

  } catch (err) {
    console.error("Update member error:", err);
    
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Server error"
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
  selectSpecialist,
  createorder,
  checkPaymentStatus,
  consultingType,
  updateMember,
  deleteMember,
  getMemberById
}