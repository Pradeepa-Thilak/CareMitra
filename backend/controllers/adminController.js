const Doctor = require('../models/Doctor');
const { sendOTPEmail } = require('../utils/sendEmail');
 const User = require('../models/User');

// const createDoctorUserAccount = async (doctor) => {
//   try {
   
//     let user = await User.findOne({ email: doctor.email });
    
//     if (!user) {
      
//       user = new User({
//         email: doctor.email,
//         name: doctor.name,
//         phone: doctor.phone || '',
//         role: 'doctor',
//         doctorId: doctor._id,
//         isActive: true,
//         isVerified: true,
//         password: doctor.password || 'defaultPassword123' // In production, generate a random password
//       });
      
//       await user.save();
//       console.log(`✅ User account created for doctor: ${doctor.email}`);
//     } else {
//       // Update existing user
//       user.role = 'doctor';
//       user.doctorId = doctor._id;
//       user.isActive = true;
//       await user.save();
//       console.log(`✅ Existing user updated for doctor: ${doctor.email}`);
//     }
    
//     return user;
//   } catch (error) {
//     console.error('❌ Error creating doctor user account:', error);
//     // Don't throw error - continue even if user creation fails
//     return null;
//   }
// };

// const notifyAdminAboutNewDoctor = async (doctor) => {
//   try {
//     const adminEmail = process.env.ADMIN_EMAIL || 'admin@caremitra.com';
    
//     const subject = `New Doctor Registration - ${doctor.name}`;
//     const html = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//           .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
//           .content { padding: 30px; background: #f9f9f9; }
//           .info-box { background: #fff3e0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0; }
//           .btn { display: inline-block; padding: 12px 24px; background: #FF9800; 
//                  color: white; text-decoration: none; border-radius: 5px; }
//           table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//           th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
//           th { background: #f2f2f2; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>New Doctor Registration</h1>
//           </div>
//           <div class="content">
//             <h2>Doctor Registration Alert</h2>
//             <p>A new doctor has registered on the platform and is awaiting verification.</p>
            
//             <div class="info-box">
//               <h3>Registration Details:</h3>
//               <table>
//                 <tr>
//                   <th>Field</th>
//                   <th>Value</th>
//                 </tr>
//                 <tr>
//                   <td><strong>Name</strong></td>
//                   <td>${doctor.name}</td>
//                 </tr>
//                 <tr>
//                   <td><strong>Email</strong></td>
//                   <td>${doctor.email}</td>
//                 </tr>
//                 <tr>
//                   <td><strong>Phone</strong></td>
//                   <td>${doctor.phone || 'Not provided'}</td>
//                 </tr>
//                 <tr>
//                   <td><strong>Specialization</strong></td>
//                   <td>${doctor.specialization}</td>
//                 </tr>
//                 <tr>
//                   <td><strong>License No.</strong></td>
//                   <td>${doctor.medicalLicenseNumber}</td>
//                 </tr>
//                 <tr>
//                   <td><strong>Experience</strong></td>
//                   <td>${doctor.experience || 'Not provided'}</td>
//                 </tr>
//                 <tr>
//                   <td><strong>Registration Date</strong></td>
//                   <td>${new Date().toLocaleString()}</td>
//                 </tr>
//               </table>
//             </div>
            
//             <p><strong>Next Steps:</strong></p>
//             <ol>
//               <li>Doctor needs to select a premium plan</li>
//               <li>Complete payment</li>
//               <li>Then verify credentials</li>
//             </ol>
            
//             <p>
//               <a href="${process.env.ADMIN_PANEL_URL || 'http://localhost:3000/admin'}/doctors/pending" 
//                  class="btn">View Pending Doctors</a>
//             </p>
            
//             <p>Best regards,<br>CareMitra System</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     const text = `New doctor registration: ${doctor.name} (${doctor.email}) - ${doctor.specialization}.\n\nLicense: ${doctor.medicalLicenseNumber}\n\nPlease monitor their progress through plan selection and payment.`;

//     await sendOTPEmail(
//       adminEmail,
//       subject,
//       text,
//       html
//     );
    
//     console.log(`✅ Admin notification sent for new doctor: ${doctor.email}`);
//   } catch (error) {
//     console.error('❌ Error sending admin notification:', error);
//   }
// };

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
      // Activate doctor account
      doctor.isActive = true;
      doctor.premiumPlan.isActive = true;
      doctor.dailyStats.maxPatientsAllowed = doctor.premiumPlan.patientLimit;
      doctor.isAvailableToday = true;

      // Create user account for doctor (if using separate User model)
      await createDoctorUserAccount(doctor);

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
      .select('name email verificationStatus paymentStatus premiumPlan isActive addedAt')
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

module.exports = {
  getPendingDoctors,
  verifyDoctorApplication,
  getAllDoctors
};