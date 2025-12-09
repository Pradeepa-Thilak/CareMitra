// // const sgMail = require('@sendgrid/mail');

// // const sendOTPEmail = async (email, otp) => {
// //   console.log('   Starting email send process...');
// //   console.log('   Environment check:');
// //   console.log('   - SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
// //   console.log('   - SENDGRID_API_KEY length:', process.env.SENDGRID_API_KEY?.length);
// //   console.log('   - FROM_EMAIL exists:', !!process.env.EMAIL_FROM);
// //   console.log('   - FROM_EMAIL value:', process.env.EMAIL_FROM);

  
// //   if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
// //     console.log('   SendGrid API key not configured or using placeholder');
// //     console.log('   OTP for development:', otp);
// //     return { 
// //       success: false, 
// //       error: 'SendGrid API key not configured',
// //       development: true 
// //     };
// //   }

  
// //   if (!process.env.EMAIL_FROM) {
// //     console.log(' FROM_EMAIL not set');
// //     return { 
// //       success: false, 
// //       error: 'FROM_EMAIL environment variable is not set' 
// //     };
// //   }

// //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //   if (!emailRegex.test(process.env.EMAIL_FROM)) {
// //     console.log(' FROM_EMAIL format invalid:', process.env.EMAIL_FROM);
// //     return { 
// //       success: false, 
// //       error: 'EMAIL_FROM format is invalid' 
// //     };
// //   }

// //   // Set API key
// //   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// //   const msg = {
// //     to: email,
// //     from: process.env.EMAIL_FROM,
// //     subject: 'Your CareMitra Verification Code',
// //     text: `Your CareMitra OTP is ${otp}. It will expire in 5 minutes.`,
// //     html: `
// //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
// //         <h2 style="color: #2563eb; text-align: center;">CareMitra</h2>
// //         <p>Hello,</p>
// //         <p>Your verification code is:</p>
// //         <h1 style="font-size: 32px; color: #2563eb; letter-spacing: 8px; text-align: center; margin: 30px 0; padding: 15px; background: #f8fafc; border-radius: 8px;">
// //           ${otp}
// //         </h1>
// //         <p>This code will expire in <strong>5 minutes</strong>.</p>
// //         <p>If you didn't request this code, please ignore this email.</p>
// //         <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
// //         <p style="color: #64748b; font-size: 12px; text-align: center;">
// //           Thank you for choosing CareMitra - Your Healthcare Partner
// //         </p>
// //       </div>
// //     `,
// //   };

// //   try {
// //     console.log(` Attempting to send email:`);
// //     console.log(`   To: ${email}`);
// //     console.log(`   From: ${process.env.EMAIL_FROM}`);
// //     console.log(`   OTP: ${otp}`);
    
// //     const result = await sgMail.send(msg);
    
// //     console.log('   Email sent successfully!');
// //     console.log(`   Status Code: ${result[0].statusCode}`);
// //     console.log(`   Headers:`, result[0].headers);
    
// //     return { 
// //       success: true, 
// //       statusCode: result[0].statusCode,
// //       messageId: result[0].headers['x-message-id']
// //     };
    
// //   } catch (error) {
// //     console.error('   SendGrid Error Details:');
// //     console.error('   Error Message:', error.message);
// //     console.error('   Error Code:', error.code);
    
// //     if (error.response) {
// //       console.error('   Response Body:', error.response.body);
// //       console.error('   Response Headers:', error.response.headers);
// //       console.error('   Status Code:', error.response.statusCode);
// //     }
    
// //     return { 
// //       success: false, 
// //       error: error.message,
// //       details: error.response?.body,
// //       statusCode: error.response?.statusCode
// //     };
// //   }
// // };

// // module.exports = { sendOTPEmail };
// const sgMail = require('@sendgrid/mail');

// // OTP Email function
// const sendOTPEmail = async (email, otp) => {
//   console.log('   Starting email send process...');
//   console.log('   Environment check:');
//   console.log('   - SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
//   console.log('   - SENDGRID_API_KEY length:', process.env.SENDGRID_API_KEY?.length);
//   console.log('   - FROM_EMAIL exists:', !!process.env.EMAIL_FROM);
//   console.log('   - FROM_EMAIL value:', process.env.EMAIL_FROM);

  
//   if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
//     console.log('   SendGrid API key not configured or using placeholder');
//     console.log('   OTP for development:', otp);
//     return { 
//       success: false, 
//       error: 'SendGrid API key not configured',
//       development: true 
//     };
//   }

  
//   if (!process.env.EMAIL_FROM) {
//     console.log(' FROM_EMAIL not set');
//     return { 
//       success: false, 
//       error: 'FROM_EMAIL environment variable is not set' 
//     };
//   }

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(process.env.EMAIL_FROM)) {
//     console.log(' FROM_EMAIL format invalid:', process.env.EMAIL_FROM);
//     return { 
//       success: false, 
//       error: 'EMAIL_FROM format is invalid' 
//     };
//   }

//   // Set API key
//   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//   const msg = {
//     to: email,
//     from: process.env.EMAIL_FROM,
//     subject: 'Your CareMitra Verification Code',
//     text: `Your CareMitra OTP is ${otp}. It will expire in 5 minutes.`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//         <h2 style="color: #2563eb; text-align: center;">CareMitra</h2>
//         <p>Hello,</p>
//         <p>Your verification code is:</p>
//         <h1 style="font-size: 32px; color: #2563eb; letter-spacing: 8px; text-align: center; margin: 30px 0; padding: 15px; background: #f8fafc; border-radius: 8px;">
//           ${otp}
//         </h1>
//         <p>This code will expire in <strong>5 minutes</strong>.</p>
//         <p>If you didn't request this code, please ignore this email.</p>
//         <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
//         <p style="color: #64748b; font-size: 12px; text-align: center;">
//           Thank you for choosing CareMitra - Your Healthcare Partner
//         </p>
//       </div>
//     `,
//   };

//   try {
//     console.log(` Attempting to send email:`);
//     console.log(`   To: ${email}`);
//     console.log(`   From: ${process.env.EMAIL_FROM}`);
//     console.log(`   OTP: ${otp}`);
    
//     const result = await sgMail.send(msg);
    
//     console.log('   Email sent successfully!');
//     console.log(`   Status Code: ${result[0].statusCode}`);
//     console.log(`   Headers:`, result[0].headers);
    
//     return { 
//       success: true, 
//       statusCode: result[0].statusCode,
//       messageId: result[0].headers['x-message-id']
//     };
    
//   } catch (error) {
//     console.error('   SendGrid Error Details:');
//     console.error('   Error Message:', error.message);
//     console.error('   Error Code:', error.code);
    
//     if (error.response) {
//       console.error('   Response Body:', error.response.body);
//       console.error('   Response Headers:', error.response.headers);
//       console.error('   Status Code:', error.response.statusCode);
//     }
    
//     return { 
//       success: false, 
//       error: error.message,
//       details: error.response?.body,
//       statusCode: error.response?.statusCode
//     };
//   }
// };

// // Appointment Status Email function
// const sendAppointmentStatusEmail = async (patientEmail, patientName, doctorName, newStatus, appointment, oldStatus) => {
//   console.log('Sending appointment status email...');
//   console.log('Patient Email:', patientEmail);
//   console.log('New Status:', newStatus);
//   console.log('Old Status:', oldStatus);

//   // Check if SendGrid is configured
//   if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
//     console.log('SendGrid not configured - email would be sent in production');
//     console.log('Email details:', {
//       to: patientEmail,
//       status: newStatus,
//       doctor: doctorName,
//       date: appointment.date,
//       time: appointment.time
//     });
//     return { success: false, development: true };
//   }

//   if (!process.env.EMAIL_FROM) {
//     console.log('FROM_EMAIL not configured');
//     return { success: false, error: 'FROM_EMAIL not configured' };
//   }

//   // Set up email content based on status
//   let emailSubject = '';
//   let emailText = '';
//   let emailHtml = '';

//   switch (newStatus) {
//     case 'confirmed':
//       emailSubject = `Appointment Confirmed with Dr. ${doctorName}`;
//       emailText = `Dear ${patientName}, your appointment with Dr. ${doctorName} on ${appointment.date} at ${appointment.time} has been confirmed.`;
//       emailHtml = getConfirmedEmailTemplate(patientName, doctorName, appointment);
//       break;

//     case 'completed':
//       emailSubject = `Appointment Completed with Dr. ${doctorName}`;
//       emailText = `Dear ${patientName}, your appointment with Dr. ${doctorName} on ${appointment.date} has been marked as completed.`;
//       emailHtml = getCompletedEmailTemplate(patientName, doctorName, appointment);
//       break;

//     case 'cancelled':
//       emailSubject = `Appointment Cancelled with Dr. ${doctorName}`;
//       emailText = `Dear ${patientName}, your appointment with Dr. ${doctorName} on ${appointment.date} at ${appointment.time} has been cancelled. Please book a new appointment.`;
//       emailHtml = getCancelledEmailTemplate(patientName, doctorName, appointment);
//       break;

//     case 'pending':
//       emailSubject = `Appointment Status Updated`;
//       emailText = `Dear ${patientName}, your appointment with Dr. ${doctorName} status has been updated to pending.`;
//       emailHtml = getPendingEmailTemplate(patientName, doctorName, appointment);
//       break;

//     default:
//       return { success: false, error: 'Unknown status' };
//   }

//   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//   const msg = {
//     to: patientEmail,
//     from: process.env.EMAIL_FROM,
//     subject: emailSubject,
//     text: emailText,
//     html: emailHtml,
//   };

//   try {
//     console.log('Sending appointment status email...');
//     const result = await sgMail.send(msg);
    
//     console.log('Appointment status email sent successfully!');
//     return { 
//       success: true, 
//       statusCode: result[0].statusCode,
//       messageId: result[0].headers['x-message-id']
//     };
    
//   } catch (error) {
//     console.error('SendGrid Error for appointment status:', error.message);
//     return { 
//       success: false, 
//       error: error.message,
//       details: error.response?.body
//     };
//   }
// };

// // Reschedule Email function
// const sendRescheduleEmail = async (patientEmail, patientName, doctorName, oldDate, oldTime, newDate, newTime) => {
//   console.log('Sending reschedule email...');
//   console.log('Patient Email:', patientEmail);
//   console.log('Old Appointment:', oldDate, oldTime);
//   console.log('New Appointment:', newDate, newTime);

//   // Check if SendGrid is configured
//   if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
//     console.log('SendGrid not configured - email would be sent in production');
//     console.log('Reschedule email details:', {
//       to: patientEmail,
//       doctor: doctorName,
//       oldDate,
//       oldTime,
//       newDate,
//       newTime
//     });
//     return { success: false, development: true };
//   }

//   if (!process.env.EMAIL_FROM) {
//     console.log('FROM_EMAIL not configured');
//     return { success: false, error: 'FROM_EMAIL not configured' };
//   }

//   const emailSubject = `Appointment Rescheduled with Dr. ${doctorName}`;
//   const emailText = `Dear ${patientName}, your appointment with Dr. ${doctorName} has been rescheduled from ${oldDate} at ${oldTime} to ${newDate} at ${newTime}. We apologize for any inconvenience.`;
  
//   const emailHtml = getRescheduleEmailTemplate(patientName, doctorName, oldDate, oldTime, newDate, newTime);

//   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//   const msg = {
//     to: patientEmail,
//     from: process.env.EMAIL_FROM,
//     subject: emailSubject,
//     text: emailText,
//     html: emailHtml,
//   };

//   try {
//     console.log('Sending reschedule email...');
//     const result = await sgMail.send(msg);
    
//     console.log('Reschedule email sent successfully!');
//     return { 
//       success: true, 
//       statusCode: result[0].statusCode,
//       messageId: result[0].headers['x-message-id']
//     };
    
//   } catch (error) {
//     console.error('SendGrid Error for reschedule email:', error.message);
//     return { 
//       success: false, 
//       error: error.message,
//       details: error.response?.body
//     };
//   }
// };

// // Email Templates
// const getConfirmedEmailTemplate = (patientName, doctorName, appointment) => `
// <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
//   <div style="background: white; padding: 30px; border-radius: 8px; color: #333;">
//     <h2 style="color: #2563eb; text-align: center; margin-bottom: 10px;">🎉 Appointment Confirmed!</h2>
//     <p style="text-align: center; color: #666; margin-bottom: 30px;">CareMitra - Your Healthcare Partner</p>
    
//     <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
//       <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientName}</p>
//       <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
//       <p style="margin: 5px 0;"><strong>Date:</strong> ${appointment.date}</p>
//       <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
//       <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">CONFIRMED</span></p>
//     </div>

//     <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
//       <h4 style="color: #059669; margin-bottom: 10px;">📋 What to Bring:</h4>
//       <ul style="color: #047857; margin: 0; padding-left: 20px;">
//         <li>Your ID proof</li>
//         <li>Previous medical reports (if any)</li>
//         <li>List of current medications</li>
//         <li>Insurance details</li>
//       </ul>
//     </div>

//     <p style="text-align: center; color: #666; margin: 30px 0;">
//       Please arrive 15 minutes before your scheduled appointment time.
//     </p>

//     <div style="text-align: center; margin-top: 30px;">
//       <a href="#" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
//         View Appointment Details
//       </a>
//     </div>
//   </div>
// </div>
// `;

// const getCancelledEmailTemplate = (patientName, doctorName, appointment) => `
// <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border-radius: 10px;">
//   <div style="background: white; padding: 30px; border-radius: 8px; color: #333;">
//     <h2 style="color: #dc2626; text-align: center; margin-bottom: 10px;">❌ Appointment Cancelled</h2>
//     <p style="text-align: center; color: #666; margin-bottom: 30px;">CareMitra - Your Healthcare Partner</p>
    
//     <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
//       <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientName}</p>
//       <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
//       <p style="margin: 5px 0;"><strong>Date:</strong> ${appointment.date}</p>
//       <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
//       <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">CANCELLED</span></p>
//     </div>

//     <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
//       <h4 style="color: #d97706; margin-bottom: 10px;">💡 What's Next?</h4>
//       <p style="color: #92400e; margin: 0;">
//         We're sorry for the inconvenience. You can book a new appointment at your convenience.
//       </p>
//     </div>

//     <p style="text-align: center; color: #666; margin: 30px 0;">
//       If you have any questions, please contact our support team.
//     </p>

//     <div style="text-align: center; margin-top: 30px;">
//       <a href="#" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
//         Book New Appointment
//       </a>
//       <a href="#" style="background: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
//         Contact Support
//       </a>
//     </div>
//   </div>
// </div>
// `;

// const getCompletedEmailTemplate = (patientName, doctorName, appointment) => `
// <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border-radius: 10px;">
//   <div style="background: white; padding: 30px; border-radius: 8px; color: #333;">
//     <h2 style="color: #059669; text-align: center; margin-bottom: 10px;">✅ Appointment Completed</h2>
//     <p style="text-align: center; color: #666; margin-bottom: 30px;">CareMitra - Your Healthcare Partner</p>
    
//     <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
//       <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientName}</p>
//       <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
//       <p style="margin: 5px 0;"><strong>Date:</strong> ${appointment.date}</p>
//       <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
//       <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">COMPLETED</span></p>
//     </div>

//     <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
//       <h4 style="color: #1d4ed8; margin-bottom: 10px;">📝 Follow-up Instructions</h4>
//       <p style="color: #1e40af; margin: 0;">
//         Please follow your doctor's advice and take medications as prescribed. Schedule a follow-up if recommended.
//       </p>
//     </div>

//     <p style="text-align: center; color: #666; margin: 30px 0;">
//       Thank you for choosing CareMitra for your healthcare needs.
//     </p>

//     <div style="text-align: center; margin-top: 30px;">
//       <a href="#" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
//         Book Follow-up
//       </a>
//     </div>
//   </div>
// </div>
// `;

// const getPendingEmailTemplate = (patientName, doctorName, appointment) => `
// <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); color: white; border-radius: 10px;">
//   <div style="background: white; padding: 30px; border-radius: 8px; color: #333;">
//     <h2 style="color: #d97706; text-align: center; margin-bottom: 10px;">⏳ Appointment Status Updated</h2>
//     <p style="text-align: center; color: #666; margin-bottom: 30px;">CareMitra - Your Healthcare Partner</p>
    
//     <div style="background: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #d97706; margin: 20px 0;">
//       <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientName}</p>
//       <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
//       <p style="margin: 5px 0;"><strong>Date:</strong> ${appointment.date}</p>
//       <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
//       <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #d97706; font-weight: bold;">PENDING</span></p>
//     </div>

//     <p style="text-align: center; color: #666; margin: 30px 0;">
//       Your appointment is currently pending confirmation. We'll notify you once it's confirmed by the doctor.
//     </p>

//     <div style="text-align: center; margin-top: 30px;">
//       <a href="#" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
//         View Details
//       </a>
//     </div>
//   </div>
// </div>
// `;

// // Reschedule Email Template
// const getRescheduleEmailTemplate = (patientName, doctorName, oldDate, oldTime, newDate, newTime) => `
// <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
//   <div style="background: white; padding: 30px; border-radius: 8px; color: #333;">
//     <h2 style="color: #d97706; text-align: center; margin-bottom: 10px;">🔄 Appointment Rescheduled</h2>
//     <p style="text-align: center; color: #666; margin-bottom: 30px;">CareMitra - Your Healthcare Partner</p>
    
//     <div style="text-align: center; margin-bottom: 20px;">
//       <p style="color: #666; font-size: 16px;">
//         We sincerely apologize for the inconvenience caused.
//       </p>
//     </div>

//     <!-- Old Appointment Details -->
//     <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
//       <h4 style="color: #dc2626; margin-bottom: 15px; text-align: center;">📅 Previous Appointment</h4>
//       <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
//         <div style="flex: 1; min-width: 200px;">
//           <p style="margin: 8px 0;"><strong>Date:</strong> ${oldDate}</p>
//           <p style="margin: 8px 0;"><strong>Time:</strong> ${oldTime}</p>
//         </div>
//       </div>
//     </div>

//     <!-- Arrow indicating change -->
//     <div style="text-align: center; margin: 20px 0;">
//       <div style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 50px; font-weight: bold;">
//         ↓ RESCHEDULED TO ↓
//       </div>
//     </div>

//     <!-- New Appointment Details -->
//     <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
//       <h4 style="color: #2563eb; margin-bottom: 15px; text-align: center;">📅 New Appointment</h4>
//       <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
//         <div style="flex: 1; min-width: 200px;">
//           <p style="margin: 8px 0;"><strong>Date:</strong> ${newDate}</p>
//           <p style="margin: 8px 0;"><strong>Time:</strong> ${newTime}</p>
//         </div>
//         <div style="flex: 1; min-width: 200px;">
//           <p style="margin: 8px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
//           <p style="margin: 8px 0;"><strong>Patient:</strong> ${patientName}</p>
//         </div>
//       </div>
//     </div>

//     <!-- Apology Message -->
//     <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
//       <h4 style="color: #d97706; margin-bottom: 10px;">🙏 Our Apologies</h4>
//       <p style="color: #92400e; margin: 0;">
//         We understand that rescheduling may cause inconvenience and we sincerely apologize for any disruption to your schedule. This change was necessary due to unforeseen circumstances.
//       </p>
//     </div>

//     <!-- Important Notes -->
//     <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
//       <h4 style="color: #059669; margin-bottom: 10px;">💡 Important Information</h4>
//       <ul style="color: #047857; margin: 0; padding-left: 20px;">
//         <li>Please arrive 15 minutes before your new appointment time</li>
//         <li>Bring your previous medical reports and ID proof</li>
//         <li>Contact us if the new timing doesn't work for you</li>
//         <li>No action required if the new time is acceptable</li>
//       </ul>
//     </div>

//     <!-- Contact Information -->
//     <div style="text-align: center; background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
//       <p style="margin: 5px 0; color: #64748b;">
//         <strong>Need help?</strong> Contact our support team at 
//         <a href="mailto:support@caremitra.com" style="color: #2563eb;">support@caremitra.com</a>
//         or call +1-XXX-XXX-XXXX
//       </p>
//     </div>

//     <div style="text-align: center; margin-top: 30px;">
//       <a href="#" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
//         View Appointment Details
//       </a>
//       <a href="#" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">
//         Request Different Time
//       </a>
//     </div>

//     <p style="text-align: center; color: #666; margin-top: 30px; font-size: 14px;">
//       Thank you for your understanding and cooperation.
//     </p>
//   </div>
// </div>
// `;

// module.exports = { 
//   sendOTPEmail, 
//   sendRescheduleEmail,
//   sendAppointmentStatusEmail
// };


// utils/emailTemplates.js
const sgMail = require('@sendgrid/mail');

/* -----------------------------------------------------------
 * 1. DOCTOR & ADMIN APPLICATION EMAIL TEMPLATES
 * ----------------------------------------------------------*/
const emailTemplates = {
  // Doctor Application Received
  doctorApplicationReceived: (doctorName) => ({
    subject: `Application Received - CareMitra`,
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto;">
        <h2>Dear Dr. ${doctorName},</h2>
        <p>Thank you for applying to join CareMitra!</p>
        <p>Your application is under review. This may take 2–3 business days.</p>
        <br>
        <p>Best Regards,</p>
        <strong>CareMitra Team</strong>
      </div>
    `
  }),

  // Doctor Application Approved
  doctorApplicationApproved: (doctorName, loginUrl) => ({
    subject: `Application Approved - Welcome to CareMitra!`,
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto;">
        <h2 style="color:#4CAF50;">Congratulations Dr. ${doctorName}!</h2>
        <p>Your application has been approved.</p>
        <p>You can now access your doctor dashboard.</p>

        <div style="text-align:center; margin:30px 0;">
          <a href="${loginUrl}" 
            style="background:#4CAF50;color:#fff;padding:12px 24px;text-decoration:none; border-radius:4px;">
            Login to your account
          </a>
        </div>

        <strong>CareMitra Team</strong>
      </div>
    `
  }),

  // Doctor Application Rejected
  doctorApplicationRejected: (doctorName, reason) => ({
    subject: `Application Update - CareMitra`,
    html: `
      <div style="font-family: Arial; max-width:600px; margin:auto;">
        <h2>Dear Dr. ${doctorName},</h2>
        <p>Your application could not be approved at this time.</p>

        <div style="background:#fff3cd; padding:15px; border-radius:5px;">
          <h4>Reason:</h4>
          <p>${reason}</p>
        </div>

        <p>You may reapply after addressing the above issues.</p>
        <strong>CareMitra Team</strong>
      </div>
    `
  }),

  // Admin Notification for New Doctor
  adminNewDoctorApplication: (doctorName, adminPanelUrl) => ({
    subject: `New Doctor Application - ${doctorName}`,
    html: `
      <div style="font-family: Arial; max-width:600px; margin:auto;">
        <h2>New Doctor Application</h2>
        <p><strong>Name:</strong> ${doctorName}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

        <a href="${adminPanelUrl}" 
          style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">
          Review Application
        </a>
      </div>
    `
  }),

  dailyPlanExpired: (doctorName, renewUrl) => ({
  subject: "Your Premium Plan Has Expired",
  html: `
    <p>Dear Dr. ${doctorName},</p>
    <p>Your <strong>1-Day Premium Plan</strong> has expired.</p>
    <p>If you wish to continue using premium features, please renew your plan:</p>
    <p><a href="${renewUrl}" style="color:#1a73e8;">Click here to renew</a></p>
    <br/>
    <p>Thank you,<br/>CareMitra Team</p>
  `
})


};

/* -----------------------------------------------------------
 * 2. SEND OTP EMAIL
 * ----------------------------------------------------------*/
const sendOTPEmail = async (email, otp) => {
  console.log("=== SEND OTP EMAIL ===");
  console.log("Email:", email);
  console.log("OTP:", otp);
  console.log("SENDGRID_API_KEY exists:", !!process.env.SENDGRID_API_KEY);
  console.log("SENDGRID_API_KEY length:", process.env.SENDGRID_API_KEY?.length);
  console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

  // If SendGrid is not configured, log OTP and return success for development
  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.includes('your_')) {
    console.log("⚠️  DEVELOPMENT MODE - SendGrid not configured");
    console.log("📧 OTP would be sent to:", email);
    console.log("🔢 OTP Code:", otp);
    console.log("✅ Returning success for development");
    return { success: true, development: true }; // Changed to success: true
  }

  // Check email configuration
  if (!process.env.EMAIL_FROM) {
    console.error("❌ EMAIL_FROM not configured");
    return { success: false, error: "EMAIL_FROM not configured" };
  }

  // Configure SendGrid
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Your CareMitra Verification Code',
    text: `Your CareMitra OTP is ${otp}. It will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">🔐 CareMitra Verification</h2>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <p style="color: #64748b; margin-bottom: 10px;">Your one-time verification code is:</p>
          <h1 style="font-size: 42px; color: #2563eb; letter-spacing: 10px; margin: 20px 0; padding: 15px; background: white; border-radius: 8px; border: 2px dashed #2563eb;">
            ${otp}
          </h1>
          <p style="color: #64748b; font-size: 14px;">⏰ Valid for 5 minutes only</p>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: #f0f9ff; border-radius: 8px;">
          <p style="color: #0369a1; margin: 0;">
            <strong>💡 Tip:</strong> This code is for your security. Never share it with anyone.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        
        <p style="color: #64748b; font-size: 12px; text-align: center;">
          If you didn't request this code, please ignore this email.<br>
          Thank you for choosing CareMitra - Your Healthcare Partner
        </p>
      </div>
    `,
  };

  try {
    console.log("📤 Attempting to send email via SendGrid...");
    const result = await sgMail.send(msg);
    
    console.log("✅ Email sent successfully!");
    console.log("Status Code:", result[0].statusCode);
    
    return { 
      success: true, 
      statusCode: result[0].statusCode,
      messageId: result[0].headers['x-message-id']
    };
    
  } catch (error) {
    console.error("❌ SendGrid Error:", error.message);
    
    // Log detailed error info
    if (error.response) {
      console.error("Error Response Body:", JSON.stringify(error.response.body, null, 2));
      console.error("Status Code:", error.response.statusCode);
    }
    
    return { 
      success: false, 
      error: error.message,
      details: error.response?.body
    };
  }
};

/* -----------------------------------------------------------
 * 3. SEND APPOINTMENT STATUS EMAIL
 * ----------------------------------------------------------*/
const sendAppointmentStatusEmail = async (
  email, patientName, doctorName, newStatus, appointment
) => {
  if (!process.env.SENDGRID_API_KEY) return { success: false, development: true };

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  let subject = "";
  let html = "";

  switch (newStatus) {
    case "confirmed":
      subject = `Appointment Confirmed with Dr. ${doctorName}`;
      html = getConfirmedEmailTemplate(patientName, doctorName, appointment);
      break;

    case "cancelled":
      subject = `Appointment Cancelled with Dr. ${doctorName}`;
      html = getCancelledEmailTemplate(patientName, doctorName, appointment);
      break;

    case "completed":
      subject = `Appointment Completed with Dr. ${doctorName}`;
      html = getCompletedEmailTemplate(patientName, doctorName, appointment);
      break;

    case "pending":
      subject = `Appointment Status Updated`;
      html = getPendingEmailTemplate(patientName, doctorName, appointment);
      break;
  }

  try {
    await sgMail.send({ to: email, from: process.env.EMAIL_FROM, subject, html });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/* -----------------------------------------------------------
 * 4. SEND RESCHEDULE EMAIL
 * ----------------------------------------------------------*/
const sendRescheduleEmail = async (
  email, patientName, doctorName, oldDate, oldTime, newDate, newTime
) => {
  if (!process.env.SENDGRID_API_KEY) return { success: false, development: true };

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const subject = `Appointment Rescheduled with Dr. ${doctorName}`;
  const html = getRescheduleEmailTemplate(
    patientName, doctorName, oldDate, oldTime, newDate, newTime
  );

  try {
    await sgMail.send({ to: email, from: process.env.EMAIL_FROM, subject, html });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/* -----------------------------------------------------------
 * 5. EMAIL TEMPLATE HTML
 * ----------------------------------------------------------*/
const getConfirmedEmailTemplate = (patientName, doctorName, appointment) => `
<div style="font-family:Arial; max-width:600px; margin:auto; padding:20px;">
  <h2 style="color:#059669;">🎉 Appointment Confirmed</h2>
  <p><strong>Patient:</strong> ${patientName}</p>
  <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
  <p><strong>Date:</strong> ${appointment.date}</p>
  <p><strong>Time:</strong> ${appointment.time}</p>
</div>
`;

const getCancelledEmailTemplate = (patientName, doctorName, appointment) => `
<div style="font-family:Arial; max-width:600px; margin:auto; padding:20px;">
  <h2 style="color:#dc2626;">❌ Appointment Cancelled</h2>
  <p>Your appointment with Dr. ${doctorName} has been cancelled.</p>
</div>
`;

const getCompletedEmailTemplate = () => `
<div style="font-family:Arial; padding:20px;">
  <h2>Appointment Completed</h2>
  <p>Thank you for visiting CareMitra.</p>
</div>
`;

const getPendingEmailTemplate = () => `
<div style="font-family:Arial; padding:20px;">
  <h2>Appointment Pending</h2>
  <p>Your appointment status is now pending.</p>
</div>
`;

const getRescheduleEmailTemplate = (patientName, doctorName, oldD, oldT, newD, newT) => `
<div style="font-family:Arial; padding:20px;">
  <h2>🔁 Appointment Rescheduled</h2>
  <p>Dear ${patientName},</p>
  <p>Your appointment with Dr. ${doctorName} has been rescheduled.</p>

  <p><strong>Old:</strong> ${oldD} at ${oldT}</p>
  <p><strong>New:</strong> ${newD} at ${newT}</p>
</div>
`;
// Add this function to sendEmail.js
const sendGeneralEmail = async (email, subject, htmlContent) => {
  console.log('\n=== DEBUG SEND GENERAL EMAIL ===');
  console.log('To:', email);
  console.log('Subject:', subject);
  console.log('HTML length:', htmlContent?.length || 0);
  console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
  console.log('SENDGRID_API_KEY starts with:', process.env.SENDGRID_API_KEY?.substring(0, 10) + '...');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  
  // If SendGrid is not configured, simulate success
  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.includes('your_')) {
    console.log('⚠️  DEVELOPMENT MODE - SendGrid not configured');
    console.log('📧 Email would be sent to:', email);
    console.log('📝 Subject:', subject);
    console.log('✅ Returning simulated success');
    return { success: true, development: true, simulated: true };
  }

  // Check email configuration
  if (!process.env.EMAIL_FROM) {
    console.error('❌ EMAIL_FROM not configured');
    return { success: false, error: "EMAIL_FROM not configured" };
  }

  // Configure SendGrid
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid API key set');
  } catch (sgError) {
    console.error('❌ Error setting SendGrid API key:', sgError.message);
    return { success: false, error: sgError.message };
  }

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: subject,
    html: htmlContent,
  };

  try {
    console.log('📤 Attempting to send email via SendGrid...');
    const result = await sgMail.send(msg);
    
    console.log('✅ Email sent successfully!');
    console.log('Status Code:', result[0].statusCode);
    console.log('Response:', result[0]);
    
    return { 
      success: true, 
      statusCode: result[0].statusCode,
      messageId: result[0].headers['x-message-id']
    };
    
  } catch (error) {
    console.error('❌ SendGrid Error:', error.message);
    
    // Log detailed error info
    if (error.response) {
      console.error('Error Response:', {
        statusCode: error.response.statusCode,
        body: error.response.body,
        headers: error.response.headers
      });
    }
    
    return { 
      success: false, 
      error: error.message,
      details: error.response?.body
    };
  }
};

// =====================================================
// LAB TEST ORDER EMAIL TO PATIENT
// =====================================================
const sendLabTestOrderEmail = async (order) => {
  console.log("📨 Sending lab test order confirmation...");

  const { patientEmail, patientName, orderId, tests, totalAmount, appointmentTime, address } = order;

  const subject = `Lab Test Order Confirmation - #${orderId}`;

  const html = `
    <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px;">
      <h2 style="color: #2563eb; text-align: center;">🩺 Lab Test Order Confirmed</h2>

      <div style="background: #f0f9ff; padding: 20px; border-radius: 10px;">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Patient Name:</strong> ${patientName}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Appointment Time:</strong> ${appointmentTime}</p>
        <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
        <p><strong>Tests:</strong> ${tests.join(", ")}</p>
      </div>

      <p style="font-size: 12px; text-align: center; margin-top: 20px;">
        Thank you for choosing CareMitra Lab Services.
      </p>
    </div>
  `;

  return await sendGeneralEmail(patientEmail, subject, html);
};


// =====================================================
// LAB STAFF ASSIGNMENT EMAIL
// =====================================================
const sendLabStaffAssignmentEmail = async (staff, order) => {
  console.log("📨 Sending staff assignment email...");

  const { email, name } = staff;
  const { orderId, patientName, address, appointmentTime } = order;

  const subject = `New Lab Test Assignment - Order #${orderId}`;

  const html = `
    <div style="font-family: Arial; max-width: 600px; margin: auto;">
      <h2 style="color: #059669; text-align: center;">🧪 New Lab Test Assignment</h2>

      <p><strong>Staff:</strong> ${name}</p>
      <p><strong>Order:</strong> #${orderId}</p>
      <p><strong>Patient:</strong> ${patientName}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Appointment:</strong> ${appointmentTime}</p>
    </div>
  `;

  return await sendGeneralEmail(email, subject, html);
};


// =====================================================
// ASSIGNMENT FAILED → EMAIL TO PATIENT
// =====================================================
const sendLabAssignmentFailedEmail = async (order) => {
  console.log("📨 Sending assignment failure to patient...");

  const { patientEmail, patientName, orderId } = order;

  const subject = `Update on Your Lab Test Order #${orderId}`;

  const html = `
    <div style="font-family: Arial; max-width: 600px; margin: auto;">
      <h2 style="color: #d97706; text-align: center;">⏳ Processing Your Order</h2>
      <p>Dear ${patientName},</p>
      <p>Your lab test order <strong>#${orderId}</strong> is still being assigned.</p>
    </div>
  `;

  return await sendGeneralEmail(patientEmail, subject, html);
};


// =====================================================
// ASSIGNMENT FAILED → EMAIL TO ADMIN
// =====================================================
const sendAdminAssignmentFailureEmail = async (order) => {
  console.log("📨 Sending admin failure email...");

  if (!process.env.ADMIN_EMAIL) {
    console.log("⚠️ ADMIN_EMAIL not set");
    return { success: false };
  }

  const { orderId, patientName, address, tests } = order;

  const subject = `🚨 Lab Assignment Failed - Order #${orderId}`;

  const html = `
    <div style="font-family: Arial; max-width: 600px; margin: auto;">
      <h2 style="color: #dc2626; text-align: center;">Assignment Failed</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Patient:</strong> ${patientName}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Tests:</strong> ${tests.join(", ")}</p>
    </div>
  `;

  return await sendGeneralEmail(process.env.ADMIN_EMAIL, subject, html);
};

module.exports = {
  emailTemplates,
  sendOTPEmail,
  sendAppointmentStatusEmail,
  sendRescheduleEmail,
  sendGeneralEmail,
  sendLabTestOrderEmail,
  sendLabStaffAssignmentEmail,
  sendLabAssignmentFailedEmail,
  sendAdminAssignmentFailureEmail
};
