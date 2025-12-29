// kafka/emailHandlers.js
const { sendGeneralEmail } = require('../utils/sendEmail');
const LabTestOrder = require('../models/LabTestOrder');
const LabStaff = require('../models/LabStaff');

class KafkaEmailHandlers {
  
  // Lab Test Order Created - Send confirmation to patient
  async handleLabTestOrderCreated(payload) {
    try {
      const { orderId } = payload;
      
      const order = await LabTestOrder.findById(orderId)
        .populate('patientDetails.userId', 'email name')
        .populate('tests.testId', 'name price');
      
      if (!order) {
        console.error('Order not found:', orderId);
        return;
      }

      console.log('📧 Processing lab test order created email for:', orderId);

      const patientEmail = order.patientDetails.email;
      const patientName = order.patientDetails.name || 'Patient';
      const totalAmount = order.totalAmount;
      const tests = order.tests.map(t => t.testId?.name || t.testName).join(', ');
      
      const subject = `✅ Lab Test Order Confirmation - #${order._id.toString().slice(-8).toUpperCase()}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669; text-align: center; margin-bottom: 20px;">🩺 Lab Test Order Confirmed!</h2>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #a7f3d0;">
            <p style="color: #047857; font-size: 16px;">Hello <strong>${patientName}</strong>,</p>
            <p style="color: #374151;">Your lab test order has been successfully booked.</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="color: #059669; margin-top: 0;">📋 Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Order ID:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${order._id.toString().slice(-8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Tests:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${tests}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Total Amount:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${totalAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px;"><strong>Status:</strong></td>
                  <td style="padding: 8px; text-align: right; color: #059669; font-weight: bold;">${order.status.toUpperCase()}</td>
                </tr>
              </table>
            </div>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h4 style="color: #0369a1; margin-top: 0;">📍 Sample Collection</h4>
              <p style="color: #374151; margin: 8px 0;">
                <strong>Address:</strong> ${order.sampleCollectionDetails?.address || 'Address will be shared soon'}<br>
                <strong>Contact:</strong> ${order.sampleCollectionDetails?.contactPhone || order.patientDetails.phone}
              </p>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h4 style="color: #92400e; margin-top: 0;">📞 What's Next?</h4>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>A technician will contact you within 30 minutes</li>
                <li>Please keep your ID and reports ready</li>
                <li>Follow fasting instructions if applicable</li>
                <li>You'll receive results in 24-48 hours</li>
              </ul>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Track Your Order
            </a>
          </div>

          <p style="color: #64748b; font-size: 12px; text-align: center;">
            For queries, contact our lab support: lab.support@caremitra.com | 1800-XXX-XXXX
          </p>
        </div>
      `;

      const emailResult = await sendGeneralEmail(patientEmail, subject, html);
      
      if (emailResult.success) {
        console.log('✅ Lab test order confirmation email sent to:', patientEmail);
      } else {
        console.error('❌ Failed to send lab test order email:', emailResult.error);
      }

      return emailResult;

    } catch (error) {
      console.error('❌ Error handling lab test order created:', error);
      return { success: false, error: error.message };
    }
  }

  // Lab Test Payment Verified
  async handleLabTestPaymentVerified(payload) {
    try {
      const { orderId, paymentId, amount } = payload;
      
      const order = await LabTestOrder.findById(orderId)
        .populate('patientDetails.userId', 'email name');
      
      if (!order) return;

      const patientEmail = order.patientDetails.email;
      const patientName = order.patientDetails.name;
      
      const subject = `✅ Payment Confirmed - Order #${order._id.toString().slice(-8).toUpperCase()}`;
      const html = `
        <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
          <h2 style="color:#059669;">💳 Payment Received</h2>
          <p>Dear ${patientName},</p>
          <p>Payment of <strong>₹${amount}</strong> has been confirmed for your lab test order.</p>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <br>
          <p>Your order is now being processed.</p>
        </div>
      `;

      return await sendGeneralEmail(patientEmail, subject, html);
      
    } catch (error) {
      console.error('Payment verified email error:', error);
    }
  }

  // Lab Test Sample Collected
  async handleLabTestSampleCollected(payload) {
    try {
      const { orderId, staffId, collectionTime } = payload;
      
      const order = await LabTestOrder.findById(orderId)
        .populate('user', 'email name phone');
      const staff = await LabStaff.findById(staffId);
      
      if (!order || !staff) return;

      const patientEmail = order.patientDetails.email;
      const patientName = order.patientDetails.name;
      
      const subject = `✅ Sample Collected - Order #${order._id.toString().slice(-8).toUpperCase()}`;
      const html = `
        <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
          <h2 style="color:#3b82f6;">🧪 Sample Collected</h2>
          <p>Dear ${patientName},</p>
          <p>Your sample has been successfully collected by our technician <strong>${staff.name}</strong>.</p>
          
          <div style="background:#eff6ff; padding:15px; border-radius:8px; margin:15px 0;">
            <p><strong>Collection Time:</strong> ${new Date(collectionTime).toLocaleString()}</p>
            <p><strong>Technician:</strong> ${staff.name} (${staff.phone})</p>
            <p><strong>Next Step:</strong> Sample sent to lab for analysis</p>
          </div>
          
          <p>You will receive your test results within 24-48 hours.</p>
        </div>
      `;

      const emailResult = await sendGeneralEmail(patientEmail, subject, html);
      
      // Also notify staff
      if (emailResult.success) {
        const staffSubject = `✅ Sample Collected Confirmation - Order #${order._id.toString().slice(-8).toUpperCase()}`;
        const staffHtml = `
          <div style="font-family: Arial; padding:20px;">
            <h2 style="color:#10b981;">Sample Collection Recorded</h2>
            <p>Hello ${staff.name},</p>
            <p>You have successfully recorded sample collection for order ${orderId}.</p>
            <p>The patient has been notified.</p>
          </div>
        `;
        
        await sendGeneralEmail(staff.email, staffSubject, staffHtml);
      }

      return emailResult;
      
    } catch (error) {
      console.error('Sample collected email error:', error);
    }
  }

  // Lab Test Report Uploaded
  async handleLabTestReportUploaded(payload) {
    try {
      const { orderId, reportUrl, uploadedBy } = payload;
      
      const order = await LabTestOrder.findById(orderId)
  .populate("user", "name email phone"); // ✅ Correct

      
      if (!order) return;

      const patientEmail = order.patientDetails.email;
      const patientName = order.patientDetails.name;
      
      const subject = `📄 Test Results Ready - Order #${order._id.toString().slice(-8).toUpperCase()}`;
      const html = `
        <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
          <h2 style="color:#8b5cf6;">📋 Your Test Results Are Ready</h2>
          <p>Dear ${patientName},</p>
          <p>Your lab test results have been uploaded and are ready for viewing.</p>
          
          <div style="background:#f5f3ff; padding:20px; border-radius:10px; margin:20px 0; text-align:center;">
            <h3 style="color:#7c3aed;">Download Your Report</h3>
            <a href="${reportUrl}" style="background:#8b5cf6; color:white; padding:15px 30px; text-decoration:none; border-radius:8px; display:inline-block; margin:10px; font-weight:bold;">
              📥 Download Report
            </a>
          </div>
          
          <div style="background:#f0f9ff; padding:15px; border-radius:8px; margin:15px 0;">
            <h4 style="color:#0369a1;">🩺 Important Notes:</h4>
            <ul>
              <li>Consult your doctor to interpret the results</li>
              <li>Keep a copy for future reference</li>
              <li>Report uploaded by: ${uploadedBy}</li>
              <li>Upload time: ${new Date().toLocaleString()}</li>
            </ul>
          </div>
        </div>
      `;

      const emailResult = await sendGeneralEmail(patientEmail, subject, html);
      
      if (emailResult.success) {
        console.log('✅ Test report notification sent to:', patientEmail);
        
        // Send to additional email if provided
        if (order.patientDetails.additionalEmail) {
          await sendGeneralEmail(order.patientDetails.additionalEmail, subject, html);
        }
      }

      return emailResult;
      
    } catch (error) {
      console.error('Report uploaded email error:', error);
    }
  }

  // Lab Order Assignment Failed
  async handleLabOrderAssignmentFailed(payload) {
    try {
      const { orderId, reason, patientLocation } = payload;
      
      const order = await LabTestOrder.findById(orderId)
        .populate('patientDetails.userId', 'email name');
      
      if (!order) return;

      const patientEmail = order.patientDetails.email;
      const patientName = order.patientDetails.name;
      
      const subject = `⚠️ Order Update - Order #${order._id.toString().slice(-8).toUpperCase()}`;
      const html = `
        <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
          <h2 style="color:#f59e0b;">⏳ Processing Your Order</h2>
          <p>Dear ${patientName},</p>
          <p>We're currently processing your lab test order <strong>#${orderId.slice(-8).toUpperCase()}</strong>.</p>
          
          <div style="background:#fffbeb; padding:20px; border-radius:10px; margin:20px 0; border:2px solid #f59e0b;">
            <h3 style="color:#d97706;">⚠️ Important Update</h3>
            <p>We are currently assigning a technician to your location.</p>
            <p><strong>Reason for delay:</strong> ${reason || 'Finding nearest available technician'}</p>
            <p>You will receive another notification once a technician is assigned.</p>
          </div>
          
          <div style="background:#f0f9ff; padding:15px; border-radius:8px; margin:15px 0;">
            <h4 style="color:#0369a1;">📞 Need Immediate Assistance?</h4>
            <p>Contact our support team:</p>
            <p>📱 <strong>1800-XXX-XXXX</strong></p>
            <p>✉️ <strong>lab.support@caremitra.com</strong></p>
          </div>
        </div>
      `;

      const emailResult = await sendGeneralEmail(patientEmail, subject, html);
      
      // Also notify admin if assignment failed
      if (process.env.ADMIN_EMAIL) {
        const adminSubject = `🚨 Assignment Failed - Order #${orderId}`;
        const adminHtml = `
          <div style="font-family: Arial; padding:20px;">
            <h2 style="color:#dc2626;">Assignment Failed</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Patient:</strong> ${patientName}</p>
            <p><strong>Location:</strong> ${JSON.stringify(patientLocation)}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `;
        
        await sendGeneralEmail(process.env.ADMIN_EMAIL, adminSubject, adminHtml);
      }

      return emailResult;
      
    } catch (error) {
      console.error('Assignment failed email error:', error);
    }
  }

  // Lab Order Auto Assigned
  async handleLabOrderAutoAssigned(payload) {
    try {
      const { orderId, staffId, staffName, distanceKm } = payload;
      
      // Get order details
      const order = await LabTestOrder.findById(orderId)
        .populate('patientDetails.userId', 'email name')
        .populate('tests.testId', 'name');
      
      if (!order) return;

      // Send to patient
      const patientEmail = order.patientDetails.email;
      const patientName = order.patientDetails.name;
      
      const patientSubject = `👨‍⚕️ Technician Assigned - Order #${order._id.toString().slice(-8).toUpperCase()}`;
      const patientHtml = `
        <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
          <h2 style="color:#10b981;">✅ Technician On The Way</h2>
          <p>Dear ${patientName},</p>
          <p>A technician has been assigned for your sample collection.</p>
          
          <div style="background:#ecfdf5; padding:20px; border-radius:10px; margin:20px 0;">
            <h3 style="color:#059669;">🩺 Technician Details</h3>
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding:10px; border-bottom:1px solid #a7f3d0;"><strong>Name:</strong></td>
                <td style="padding:10px; border-bottom:1px solid #a7f3d0;">${staffName}</td>
              </tr>
              <tr>
                <td style="padding:10px; border-bottom:1px solid #a7f3d0;"><strong>Order ID:</strong></td>
                <td style="padding:10px; border-bottom:1px solid #a7f3d0;">${orderId.slice(-8).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding:10px; border-bottom:1px solid #a7f3d0;"><strong>Distance:</strong></td>
                <td style="padding:10px; border-bottom:1px solid #a7f3d0;">${distanceKm} km away</td>
              </tr>
              <tr>
                <td style="padding:10px;"><strong>ETA:</strong></td>
                <td style="padding:10px;">Within 30 minutes</td>
              </tr>
            </table>
          </div>
          
          <p>Please keep your ID and any fasting instructions ready.</p>
        </div>
      `;

      await sendGeneralEmail(patientEmail, patientSubject, patientHtml);
      
      // Get staff email and send confirmation
      const staff = await LabStaff.findById(staffId);
      if (staff && staff.email) {
        const staffSubject = `✅ Assignment Confirmed - Order #${orderId.slice(-8).toUpperCase()}`;
        const staffHtml = `
          <div style="font-family: Arial; padding:20px;">
            <h2 style="color:#3b82f6;">Assignment Confirmed</h2>
            <p>Hello ${staffName},</p>
            <p>You have been assigned to collect samples for:</p>
            <p><strong>Patient:</strong> ${patientName}</p>
            <p><strong>Address:</strong> ${order.sampleCollectionDetails?.address}</p>
            <p><strong>Tests:</strong> ${order.tests.map(t => t.testId?.name || t.testName).join(', ')}</p>
            <p><strong>Contact Patient:</strong> ${order.sampleCollectionDetails?.contactPhone || order.patientDetails.phone}</p>
          </div>
        `;
        
        await sendGeneralEmail(staff.email, staffSubject, staffHtml);
      }

      return { success: true };
      
    } catch (error) {
      console.error('Auto assignment email error:', error);
    }
  }

  // Doctor Appointment Booked
  async handleDoctorAppointmentBooked(payload) {
    try {
      const { appointmentId, patientId, doctorId, slot, date } = payload;
      
      // You would fetch appointment, patient, and doctor details here
      // For now, we'll use the payload data
      
      const subject = `✅ Doctor Appointment Confirmed`;
      const html = `
        <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
          <h2 style="color:#059669;">👨‍⚕️ Appointment Booked</h2>
          <p>Your doctor appointment has been confirmed.</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${slot}</p>
          <p><strong>Appointment ID:</strong> ${appointmentId}</p>
        </div>
      `;

      // In reality, you would fetch patient email from database
      // return await sendGeneralEmail(patientEmail, subject, html);
      console.log('Doctor appointment booked email would be sent');
      return { success: true, simulated: true };
      
    } catch (error) {
      console.error('Doctor appointment email error:', error);
    }
  }

  // Doctor Appointment Cancelled
  async handleDoctorAppointmentCancelled(payload) {
    try {
      const { appointmentId, reason } = payload;
      
      const subject = `❌ Appointment Cancelled`;
      const html = `
        <div style="font-family: Arial; padding:20px;">
          <h2 style="color:#dc2626;">Appointment Cancelled</h2>
          <p>Your doctor appointment has been cancelled.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Appointment ID:</strong> ${appointmentId}</p>
        </div>
      `;

      // In reality, you would fetch patient email from database
      console.log('Doctor appointment cancelled email would be sent');
      return { success: true, simulated: true };
      
    } catch (error) {
      console.error('Doctor cancellation email error:', error);
    }
  }

  // Staff Created - Already handled in your controller, but can be moved here
  async handleLabStaffCreated(payload) {
  try {
    if (!payload || !payload.email) {
      console.warn('LAB_STAFF_CREATED payload missing:', payload);
      return;
    }

    const { staffId, name, email } = payload;

    const subject = '👨‍⚕️ Welcome to CareMitra Lab Team';

    const html = `
      <div style="font-family: Arial; padding:20px;">
        <h2>Welcome ${name || 'Team Member'}!</h2>
        <p>Your account has been created as <strong>Lab Staff</strong>.</p>
        <p><strong>Staff ID:</strong> ${staffId || 'N/A'}</p>
        <p>You will start receiving assignments soon.</p>
      </div>
    `;

    await sendGeneralEmail(email, subject, html);

    console.log(`Lab staff welcome email sent to ${email}`);
  } catch (error) {
    console.error('Staff created email error:', error);
  }
}
}

module.exports = new KafkaEmailHandlers();