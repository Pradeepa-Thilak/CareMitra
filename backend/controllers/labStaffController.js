const LabStaff = require('../models/LabStaff');
const LabTestOrder = require('../models/LabTestOrder');
const { sendGeneralEmail } = require('../utils/sendEmail');
const kafkaProducer = require('../kafka/producer');
const { EVENT_TYPES } = require('../kafka/topics');




// Add these functions to your file:

// Function to handle assignment failure
const handleAssignmentFailure = async (order, user, reason) => {
  try {
    console.log(`❌ Assignment failed for order ${order._id}: ${reason}`);
    
    // Update order status to reflect assignment failure
    order.orderStatus = 'assignment_failed';
    order.assignmentFailureReason = reason;
    order.assignmentFailedAt = new Date();
    order.retryAttempts = (order.retryAttempts || 0) + 1;
    
    await order.save();
    
    // Send notification about assignment failure
    await sendAssignmentFailedNotification(order, reason);
    
    return {
      success: false,
      reason: reason,
      orderId: order._id,
      retryAttempts: order.retryAttempts
    };
    
  } catch (error) {
    console.error('Error in handleAssignmentFailure:', error);
    throw error;
  }
};

// Function to handle complete assignment failure (all strategies failed)
const handleCompleteAssignmentFailure = async (order, user) => {
  try {
    console.log(`🚨 Complete assignment failure for order ${order._id}`);
    
    // Mark order for manual assignment
    order.orderStatus = 'manual_assignment_required';
    order.requiresManualAssignment = true;
    order.manualAssignmentRequiredAt = new Date();
    order.assignmentFailedReasons = [
      'No staff in nearby radius (0-10km)',
      'No staff in extended radius (10-25km)',
      'No staff available in city-wide search',
      'All staff are at maximum capacity'
    ];
    
    await order.save();
    
    // Send admin alert for manual assignment
    await sendAdminManualAssignmentAlert(order, user);
    
    // Send notification to patient
    const orderIdShort = order._id.toString().slice(-8).toUpperCase();
    const patientHtml = `
      <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
        <h2 style="color:#f59e0b;">⚠️ High Demand Notice - #${orderIdShort}</h2>
        <p>Hello ${user?.name || 'Patient'},</p>
        
        <div style="background:#fffbeb; padding:20px; border-radius:10px; margin:20px 0;">
          <p style="color:#92400e;">Due to exceptionally high demand in your area, we're experiencing delays in technician assignment.</p>
          <p style="color:#92400e;">Our team is manually reviewing your order and will assign a technician within the next 2 hours.</p>
        </div>
        
        <div style="background:#f0f9ff; padding:15px; border-radius:8px; margin:15px 0;">
          <h4 style="color:#0369a1;">📞 Next Steps:</h4>
          <ol style="color:#0369a1;">
            <li>Our admin team will contact you within 1 hour</li>
            <li>We'll provide a confirmed technician ETA</li>
            <li>You can choose to reschedule if needed</li>
          </ol>
        </div>
      </div>
    `;
    
    await sendGeneralEmail(
      user?.email || order.user?.email,
      `⚠️ High Demand Notice - #${orderIdShort}`,
      patientHtml
    );
    
    return {
      success: false,
      status: 'manual_assignment_required',
      orderId: order._id,
      message: 'Order requires manual assignment by admin'
    };
    
  } catch (error) {
    console.error('Error in handleCompleteAssignmentFailure:', error);
    throw error;
  }
};

// Function to handle assignment errors
const handleAssignmentError = async (orderId, error) => {
  try {
    console.error(`❌ Assignment error for order ${orderId}:`, error.message);
    
    // Try to find and update the order
    const order = await LabTestOrder.findById(orderId);
    if (order) {
      order.assignmentErrors = order.assignmentErrors || [];
      order.assignmentErrors.push({
        error: error.message,
        stack: error.stack,
        timestamp: new Date()
      });
      await order.save();
    }
    
    // Send error alert to admin
    if (process.env.ADMIN_EMAIL) {
      await sendGeneralEmail(
        process.env.ADMIN_EMAIL,
        `🚨 Auto-Assignment Error - Order ${orderId}`,
        `<div>
          <h2>Auto-Assignment Error</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
         </div>`
      );
    }
    
  } catch (secondaryError) {
    console.error('Secondary error in handleAssignmentError:', secondaryError);
  }
};

// Function to send Kafka event for successful assignment
const sendAssignmentSuccessKafkaEvent = async (order, staff, user, strategy, distanceKm) => {
  try {
    await kafkaProducer.sendLabTestEvent(
      EVENT_TYPES.LAB_TEST_AUTO_ASSIGNED,
      {
        orderId: order._id.toString(),
        staffId: staff._id.toString(),
        staffName: staff.name,
        patientName: user?.name || order.user?.name,
        patientEmail: user?.email || order.user?.email,
        strategy: strategy,
        distanceKm: distanceKm,
        assignedAt: new Date().toISOString(),
        estimatedArrival: order.assignedStaff.estimatedArrival,
        timestamp: new Date().toISOString()
      }
    );
    console.log('📤 Kafka event sent: LAB_TEST_AUTO_ASSIGNED');
  } catch (kafkaError) {
    console.error('⚠️ Failed to send assignment success Kafka event:', kafkaError.message);
  }
};

const sendPatientAssignmentNotification = async (order, staff, user, distanceKm, strategy) => {
  try {
    const patientEmail = user?.email || order.user?.email;
    const patientName = user?.name || order.user?.name || 'Patient';
    const orderIdShort = order._id.toString().slice(-8).toUpperCase();
    
    let strategyMessage = '';
    let etaMessage = 'within 30 minutes';
    
    switch(strategy) {
      case 'extended_radius':
        strategyMessage = 'found in extended search area';
        etaMessage = `within ${Math.round(30 + (distanceKm * 2))} minutes (${distanceKm} km away)`;
        break;
      case 'city_wide':
        strategyMessage = 'found through city-wide search';
        etaMessage = `within ${Math.round(45 + (distanceKm * 2))} minutes (${distanceKm} km away)`;
        break;
      case 'least_busy':
        strategyMessage = 'assigned our most available technician';
        etaMessage = 'within 45 minutes (technician completing other assignments first)';
        break;
      default:
        strategyMessage = 'assigned from nearby';
    }
    
    const subject = `👨‍⚕️ Technician ${strategy === 'city_wide' ? 'Scheduled' : 'Assigned'} - #${orderIdShort}`;
    const html = `
      <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
        <h2 style="color:#10b981;">${strategy === 'city_wide' ? '✅' : '👨‍⚕️'} Technician ${strategy === 'city_wide' ? 'Scheduled' : 'Assigned'}!</h2>
        <p>Hello ${patientName},</p>
        <p>A technician has been ${strategyMessage} for your sample collection.</p>
        
        <div style="background:#ecfdf5; padding:15px; border-radius:8px; margin:15px 0;">
          <p><strong>Technician:</strong> ${staff.name}</p>
          <p><strong>Contact:</strong> ${staff.phone}</p>
          <p><strong>ETA:</strong> ${etaMessage}</p>
          ${distanceKm > 10 ? `<p><strong>Distance:</strong> ${distanceKm} km away</p>` : ''}
          ${strategy === 'city_wide' ? `<p><strong>Note:</strong> Due to high demand, our technician is traveling from a longer distance.</p>` : ''}
        </div>
        
        ${strategy === 'city_wide' ? `
          <div style="background:#fef3c7; padding:15px; border-radius:8px; margin:15px 0;">
            <h4 style="color:#92400e;">📞 Confirmation Call:</h4>
            <p>The technician will call you 1 hour before arrival to confirm.</p>
          </div>
        ` : ''}
        
        <p>Please keep your ID and any required documents ready.</p>
      </div>
    `;
    
    await sendGeneralEmail(patientEmail, subject, html);
  } catch (error) {
    console.error('Error sending patient assignment notification:', error);
  }
};

// Notify about extended travel
const sendExtendedTravelNotification = async (order, staff, user) => {
  try {
    const subject = `⚠️ Extended Travel Required - Order #${order._id.toString().slice(-8).toUpperCase()}`;
    const html = `
      <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
        <h2 style="color:#f59e0b;">⚠️ Extended Travel Required</h2>
        <p>Hello ${staff.name},</p>
        <p>You have been assigned to a patient ${staff.distanceKm} km away due to high demand.</p>
        <p><strong>Travel Allowance:</strong> Additional ₹${Math.round(staff.distanceKm * 5)} will be added to your payment.</p>
        <p><strong>Please plan accordingly.</strong></p>
      </div>
    `;
    
    await sendGeneralEmail(staff.email, subject, html);
  } catch (error) {
    console.error('Error sending extended travel notification:', error);
  }
};

// Notify about long distance assignment
const sendLongDistanceAssignmentNotification = async (order, staff, user) => {
  try {
    const subject = `🚗 Long Distance Assignment - Order #${order._id.toString().slice(-8).toUpperCase()}`;
    const html = `
      <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
        <h2 style="color:#ef4444;">🚗 Long Distance Assignment</h2>
        <p>Hello ${staff.name},</p>
        <p>You have been assigned to a patient ${staff.distanceKm} km away (city-wide search).</p>
        <div style="background:#fef3c7; padding:15px; border-radius:8px; margin:15px 0;">
          <h4 style="color:#92400e;">💰 Premium Payment:</h4>
          <p>You will receive premium payment for this long-distance assignment:</p>
          <ul>
            <li>Base fare: ₹200</li>
            <li>Distance allowance: ₹${Math.round(staff.distanceKm * 8)} (₹8/km)</li>
            <li>Total: ₹${200 + Math.round(staff.distanceKm * 8)}</li>
          </ul>
        </div>
      </div>
    `;
    
    await sendGeneralEmail(staff.email, subject, html);
  } catch (error) {
    console.error('Error sending long distance notification:', error);
  }
};

// Notify busy staff about assignment
const sendBusyStaffAssignmentNotification = async (order, staff, user) => {
  try {
    const subject = `📊 High Priority Assignment - Order #${order._id.toString().slice(-8).toUpperCase()}`;
    const html = `
      <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
        <h2 style="color:#8b5cf6;">📊 High Priority Assignment</h2>
        <p>Hello ${staff.name},</p>
        <p>You have been assigned an additional order despite having ${staff.currentAssignments} current assignments.</p>
        <div style="background:#f5f3ff; padding:15px; border-radius:8px; margin:15px 0;">
          <h4 style="color:#7c3aed;">💎 Overtime Bonus:</h4>
          <p>You will receive a 25% overtime bonus for this assignment.</p>
        </div>
        <p>This is a high-priority case. Please complete your existing assignments and proceed to this one.</p>
      </div>
    `;
    
    await sendGeneralEmail(staff.email, subject, html);
  } catch (error) {
    console.error('Error sending busy staff notification:', error);
  }
};

// Send admin alert for manual assignment
const sendAdminManualAssignmentAlert = async (order, user) => {
  try {
    if (!process.env.ADMIN_EMAIL) return;
    
    const subject = `🚨 MANUAL ASSIGNMENT REQUIRED - Order #${order._id.toString().slice(-8).toUpperCase()}`;
    const html = `
      <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
        <h2 style="color:#dc2626;">🚨 MANUAL ASSIGNMENT REQUIRED</h2>
        
        <div style="background:#fef2f2; padding:20px; border-radius:10px; margin:20px 0; border:2px solid #dc2626;">
          <h3 style="color:#dc2626;">Immediate Action Required</h3>
          
          <div style="background:white; padding:15px; border-radius:8px; margin:15px 0;">
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Number:</strong> ${order._id.toString().slice(-8).toUpperCase()}</p>
            <p><strong>Patient:</strong> ${user?.name || order.user?.name}</p>
            <p><strong>Phone:</strong> ${order.sampleCollectionDetails?.phone}</p>
            <p><strong>Address:</strong> ${order.sampleCollectionDetails?.address}</p>
            <p><strong>Pincode:</strong> ${order.sampleCollectionDetails?.pincode}</p>
            <p><strong>Coordinates:</strong> ${order.sampleCollectionDetails?.location?.coordinates?.join(', ') || 'N/A'}</p>
            <p><strong>Failed Strategies:</strong> Nearby (10km), Extended (25km), City-wide, Least Busy</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <div style="background:#fef3c7; padding:15px; border-radius:8px; margin:15px 0;">
          <h4 style="color:#92400e;">🔄 Assignment Options:</h4>
          <ol style="color:#92400e; margin:0; padding-left:20px;">
            <li>Assign to staff manually from admin panel</li>
            <li>Contact nearby staff by phone for emergency assignment</li>
            <li>Schedule for later time when staff are available</li>
            <li>Contact patient to reschedule</li>
          </ol>
        </div>
        
        <div style="text-align:center; margin:20px 0;">
          <a href="/admin/lab-orders/${order._id}/assign" style="background:#dc2626; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; margin:0 5px;">
            📋 Assign Manually
          </a>
          <a href="/admin/lab-orders/${order._id}" style="background:#3b82f6; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; margin:0 5px;">
            👁️ View Order
          </a>
        </div>
      </div>
    `;
    
    await sendGeneralEmail(process.env.ADMIN_EMAIL, subject, html);
  } catch (error) {
    console.error('Error sending admin manual assignment alert:', error);
  }
};


const sendStaffAssignmentNotification = async (staff, order, distanceKm) => {
  try {
    const orderIdShort = order._id.toString().slice(-8).toUpperCase();
    const patientName = order.patientDetails?.name || 'Patient';
    
    const subject = `📋 New Lab Order Assigned - ${orderIdShort}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3b82f6; text-align: center; margin-bottom: 20px;">📋 New Lab Order Assigned!</h2>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 16px; color: #1e40af;">Hello <strong>${staff.name}</strong>,</p>
          <p style="color: #374151;">A new lab test order has been automatically assigned to you.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #1e40af;">📋 Order Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dbeafe;"><strong>Order ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #dbeafe;">${orderIdShort}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dbeafe;"><strong>Patient Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #dbeafe;">${patientName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dbeafe;"><strong>Address:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #dbeafe;">${order.sampleCollectionDetails?.address || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dbeafe;"><strong>Distance:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #dbeafe;">${distanceKm} km</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>ETA:</strong></td>
                <td style="padding: 8px;">Within 30 minutes</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="color: #92400e;">📍 Collection Address:</h4>
            <p style="color: #92400e; margin: 0;">
              ${order.sampleCollectionDetails?.address || 'Address not provided'}<br>
              ${order.sampleCollectionDetails?.pincode ? `Pincode: ${order.sampleCollectionDetails.pincode}` : ''}
            </p>
          </div>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; text-align: center;">
          Please acknowledge this assignment within 15 minutes.
        </p>
      </div>
    `;

    const result = await sendGeneralEmail(staff.email, subject, html);
    console.log('📧 Staff assignment email sent:', result.success ? 'SUCCESS' : 'FAILED');
    return result;
    
  } catch (error) {
    console.error('❌ Error sending staff assignment:', error);
    return { success: false, error: error.message };
  }
};

const sendAssignmentFailedNotification = async (order, reason) => {
  try {
    const patientEmail = order.patientDetails?.email;
    const patientName = order.patientDetails?.name || 'Patient';
    const orderIdShort = order._id.toString().slice(-8).toUpperCase();
    
    // Send to patient
    const patientSubject = `⚠️ Order Update - #${orderIdShort}`;
    const patientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b; text-align: center; margin-bottom: 20px;">⏳ Processing Your Order</h2>
        
        <div style="background: #fffbeb; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 16px;">Hello <strong>${patientName}</strong>,</p>
          <p style="color: #374151;">We're currently processing your lab test order <strong>#${orderIdShort}</strong>.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #d97706;">⚠️ <strong>Notice:</strong></p>
            <p style="color: #92400e;">
              We are currently assigning a technician to your location. This may take a little longer than usual.
            </p>
            <p style="color: #92400e;">
              You will receive another notification once a technician is assigned.
            </p>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Track Your Order
          </a>
        </div>
      </div>
    `;

    const patientResult = await sendGeneralEmail(patientEmail, patientSubject, patientHtml);
    
    // Send to admin if configured
    let adminResult = { success: false };
    if (process.env.ADMIN_EMAIL) {
      const adminSubject = `🚨 Assignment Failed - Order #${orderIdShort}`;
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626; text-align: center; margin-bottom: 20px;">🚨 Lab Test Assignment Failed</h2>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #dc2626;">
            <p style="color: #dc2626; font-weight: bold;">Immediate attention required:</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Patient:</strong> ${patientName}</p>
              <p><strong>Address:</strong> ${order.sampleCollectionDetails?.address || 'N/A'}</p>
              <p><strong>Reason:</strong> ${reason || 'No available staff nearby'}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      `;

      adminResult = await sendGeneralEmail(process.env.ADMIN_EMAIL, adminSubject, adminHtml);
    }

    console.log('📧 Assignment failed notifications sent:', {
      patient: patientResult.success,
      admin: adminResult.success
    });
    
    return { patient: patientResult, admin: adminResult };
    
  } catch (error) {
    console.error('❌ Error sending assignment failed notifications:', error);
    return { success: false, error: error.message };
  }
};
// --------------------------
// Create LabStaff (Admin) with Kafka event
// --------------------------
exports.createLabStaff = async (req, res) => {
  try {
    const { user, name, phone, email, location, address } = req.body;
    
    // Validate coordinates
    if (location && location.coordinates) {
      if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates format. Use [longitude, latitude]'
        });
      }
    }

    const labStaff = new LabStaff({
      user,
      name,
      phone,
      email,
      location: location || { type: 'Point', coordinates: [0, 0] },
      address
    });

    await labStaff.save();

    // ✅ Send Kafka event for staff creation
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_STAFF_CREATED,
        {
          staffId: labStaff._id.toString(),
          name: labStaff.name,
          email: labStaff.email,
          location: labStaff.location,
          isActive: labStaff.isActive,
          isAvailable: labStaff.isAvailable,
          timestamp: new Date().toISOString()
        }
      );
      console.log('📤 Kafka event sent: LAB_STAFF_CREATED');
    } catch (kafkaError) {
      console.error('⚠️  Failed to send Kafka event:', kafkaError.message);
    }

    // Send welcome email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; text-align: center;">👨‍⚕️ Welcome to CareMitra Lab Team!</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 16px; color: #334155;">Hello <strong>${labStaff.name}</strong>,</p>
          <p style="color: #475569;">Your account has been created as a Lab Staff member.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #2563eb;">📋 Account Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: bold;">Name:</span>
                <span style="float: right;">${labStaff.name}</span>
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: bold;">Email:</span>
                <span style="float: right;">${labStaff.email}</span>
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: bold;">Phone:</span>
                <span style="float: right;">${labStaff.phone}</span>
              </li>
              <li style="padding: 8px 0;">
                <span style="font-weight: bold;">Staff ID:</span>
                <span style="float: right;">${labStaff._id.toString().slice(-8).toUpperCase()}</span>
              </li>
            </ul>
          </div>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #0369a1; margin-top: 0;">🚀 What's Next?</h4>
            <p style="color: #475569; margin: 5px 0;">1. Login to your dashboard</p>
            <p style="color: #475569; margin: 5px 0;">2. You'll receive orders assigned based on your location</p>
            <p style="color: #475569; margin: 5px 0;">3. Update order status as you complete collections</p>
          </div>
        </div>
        
        <p style="color: #64748b; font-size: 14px; text-align: center;">
          For any queries, contact our admin team at admin@caremitra.com
        </p>
      </div>
    `;

    await sendGeneralEmail(labStaff.email, "Welcome to CareMitra Lab Team", emailHtml);

    res.status(201).json({
      success: true,
      message: 'Lab staff created successfully',
      data: labStaff
    });

  } catch (err) {
    console.error('Create LabStaff error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------
// Find Nearest Available Staff (Auto Assignment Logic)
// --------------------------
exports.autoAssignOrderToStaff = async (orderId, user = null) => {
  try {
    console.log(`🔄 Starting auto-assignment for order: ${orderId}`);
    
    // Get the order with patient location
    const order = await LabTestOrder.findById(orderId)
      .populate('user', 'name email phone');
    
    if (!order) {
      console.log('❌ Order not found for auto assignment');
      return null;
    }

    if (!order.sampleCollectionDetails?.location?.coordinates) {
      console.log('⚠️ Order missing location for auto assignment');
      await handleAssignmentFailure(order, user, 'Missing location coordinates');
      return null;
    }

    const patientLocation = {
      type: 'Point',
      coordinates: order.sampleCollectionDetails.location.coordinates
    };

    console.log(`📍 Patient location: ${patientLocation.coordinates.join(', ')}`);

    // STRATEGY 1: Try immediate nearby staff (0-10km)
    console.log('🔍 STRATEGY 1: Searching nearby staff (0-10km)...');
    let nearestStaff = await findNearestAvailableStaff(patientLocation, 10);
    
    if (nearestStaff) {
      console.log(`✅ Found nearby staff: ${nearestStaff.name} (${nearestStaff.distanceKm} km)`);
      return await assignToStaff(order, nearestStaff, user, 'nearby');
    }

    // STRATEGY 2: Try extended radius (10-25km)
    console.log('🔍 STRATEGY 2: Searching extended radius (10-25km)...');
    nearestStaff = await findNearestAvailableStaff(patientLocation, 25);
    
    if (nearestStaff) {
      console.log(`⚠️ Found staff in extended radius: ${nearestStaff.name} (${nearestStaff.distanceKm} km)`);
      const result = await assignToStaff(order, nearestStaff, user, 'extended_radius');
      
      // Send special notification about extended travel
      await sendExtendedTravelNotification(order, nearestStaff, user);
      return result;
    }

    // STRATEGY 3: Try any available staff in city (no distance limit)
    console.log('🔍 STRATEGY 3: Searching any available staff in city...');
    nearestStaff = await findAnyAvailableStaff(patientLocation);
    
    if (nearestStaff) {
      console.log(`⚠️ Found staff in city: ${nearestStaff.name} (${nearestStaff.distanceKm} km)`);
      const result = await assignToStaff(order, nearestStaff, user, 'city_wide');
      
      // Send premium notification for long distance
      await sendLongDistanceAssignmentNotification(order, nearestStaff, user);
      return result;
    }

    // STRATEGY 4: Try staff with minimum assignments even if busy
    console.log('🔍 STRATEGY 4: Searching least busy staff...');
    nearestStaff = await findLeastBusyStaff(patientLocation);
    
    if (nearestStaff) {
      console.log(`⚠️ Found least busy staff: ${nearestStaff.name} (${nearestStaff.distanceKm} km, busy: ${nearestStaff.currentAssignments})`);
      const result = await assignToStaff(order, nearestStaff, user, 'least_busy');
      
      // Notify staff they're being assigned despite being busy
      await sendBusyStaffAssignmentNotification(order, nearestStaff, user);
      return result;
    }

    // STRATEGY 5: If ALL strategies fail - mark for manual assignment
    console.log('❌ ALL auto-assignment strategies failed');
    await handleCompleteAssignmentFailure(order, user);
    
    return null;

  } catch (error) {
    console.error('❌ Auto assignment error:', error);
    await handleAssignmentError(orderId, error);
    return null;
  }
};

// Helper function to find nearest available staff
// STRATEGY 1: Find nearest available staff within radius
const findNearestAvailableStaff = async (patientLocation, maxDistanceKm = 10) => {
  try {
    const maxDistanceMeters = maxDistanceKm * 1000;

    const nearestStaff = await LabStaff.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: patientLocation.coordinates
          },
          distanceField: "distance",
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: {
            isActive: true,
            isAvailable: true,
            $or: [
              { currentAssignments: { $lt: 5 } },
              { currentAssignments: { $exists: false } }
            ]
          },
          key: "location"
        }
      },
      { $sort: { distance: 1 } },
      { $limit: 1 }
    ]);

    if (nearestStaff.length === 0) return null;

    return {
      ...nearestStaff[0],
      distanceKm: (nearestStaff[0].distance / 1000).toFixed(2)
    };

  } catch (error) {
    console.error('Error finding nearest staff:', error);
    return null;
  }
};

// STRATEGY 3: Find ANY available staff in the city (no distance limit)
const findAnyAvailableStaff = async (patientLocation) => {
  try {
    const staff = await LabStaff.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: patientLocation.coordinates
          },
          distanceField: "distance",
          spherical: true,
          query: {
            isActive: true,
            isAvailable: true,
            $or: [
              { currentAssignments: { $lt: 5 } },
              { currentAssignments: { $exists: false } }
            ]
          },
          key: "location"
        }
      },
      { $sort: { distance: 1 } },
      { $limit: 1 }
    ]);

    if (staff.length === 0) return null;

    return {
      ...staff[0],
      distanceKm: (staff[0].distance / 1000).toFixed(2)
    };

  } catch (error) {
    console.error('Error finding any staff:', error);
    return null;
  }
};

// STRATEGY 4: Find least busy staff (even if they have many assignments)
const findLeastBusyStaff = async (patientLocation) => {
  try {
    const staff = await LabStaff.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: patientLocation.coordinates
          },
          distanceField: "distance",
          spherical: true,
          query: {
            isActive: true
          },
          key: "location"
        }
      },
      {
        $addFields: {
          assignmentsCount: { $ifNull: ["$currentAssignments", 0] }
        }
      },
      { $sort: { assignmentsCount: 1, distance: 1 } },
      { $limit: 1 }
    ]);

    if (staff.length === 0) return null;

    return {
      ...staff[0],
      distanceKm: (staff[0].distance / 1000).toFixed(2),
      currentAssignments: staff[0].assignmentsCount || 0
    };

  } catch (error) {
    console.error('Error finding least busy staff:', error);
    return null;
  }
};

// Helper to assign order to staff
const assignToStaff = async (order, nearestStaff, user, strategy) => {
  try {
    const staff = await LabStaff.findById(nearestStaff._id);
    
    // Create assignment record
    const assignmentRecord = {
      orderId: order._id,
      orderNumber: order._id.toString().slice(-8).toUpperCase(),
      assignedAt: new Date(),
      status: 'assigned',
      distanceKm: nearestStaff.distanceKm,
      strategy: strategy,
      patientName: user?.name || order.user?.name,
      patientPhone: order.sampleCollectionDetails?.phone,
      address: order.sampleCollectionDetails?.address
    };
    
    staff.assignedOrders.push(assignmentRecord);
    staff.currentAssignments = (staff.currentAssignments || 0) + 1;
    staff.isAvailable = staff.currentAssignments < (staff.maxAssignments || 5);
    staff.lastAssignedAt = new Date();
    
    await staff.save();

    // Update order
    order.assignedStaff = {
      staffId: staff._id,
      staffName: staff.name,
      staffEmail: staff.email,
      staffPhone: staff.phone,
      autoAssigned: true,
      assignmentStrategy: strategy,
      distanceKm: nearestStaff.distanceKm,
      assignedAt: new Date(),
      estimatedArrival: calculateETA(nearestStaff.distanceKm),
      assignmentRecordId: assignmentRecord._id
    };
    
    order.orderStatus = 'assigned';
    order.assignedAt = new Date();
    await order.save();

    console.log(`✅ Order assigned using strategy: ${strategy}`);

    // Send notifications
    await sendStaffAssignmentNotification(staff, order, nearestStaff.distanceKm, strategy);
    await sendPatientAssignmentNotification(order, staff, user, nearestStaff.distanceKm, strategy);
    
    // Send Kafka event
    await sendAssignmentSuccessKafkaEvent(order, staff, user, strategy, nearestStaff.distanceKm);

    return {
      success: true,
      strategy: strategy,
      staff: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone
      },
      order: {
        _id: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        assignedStaff: order.assignedStaff
      },
      distance: nearestStaff.distanceKm,
      assignedAt: new Date()
    };

  } catch (error) {
    console.error('Error in assignToStaff:', error);
    throw error;
  }
};

// Calculate ETA based on distance
const calculateETA = (distanceKm) => {
  const baseMinutes = 30; // Base ETA
  const minutesPerKm = 2; // Additional minutes per km
  const totalMinutes = baseMinutes + (distanceKm * minutesPerKm);
  return new Date(Date.now() + totalMinutes * 60000);
};

// --------------------------
// Manual Assign Order to LabStaff (Admin) with Kafka
// --------------------------
exports.assignOrder = async (req, res) => {
  try {
    const { orderId, staffId } = req.body;
    
    // Find staff
    const labStaff = await LabStaff.findById(staffId || req.params.id);
    if (!labStaff) {
      return res.status(404).json({
        success: false,
        message: "LabStaff not found"
      });
    }

    // Find order
    const order = await LabTestOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if staff is available
    if (!labStaff.isAvailable || !labStaff.isActive) {
      return res.status(400).json({
        success: false,
        message: "Staff is not available for assignment"
      });
    }

    // Assign order
    labStaff.assignedOrders.push({
      orderId: order._id,
      assignedAt: new Date(),
      status: "assigned"
    });

    // Mark as busy if has 3+ orders
    labStaff.isAvailable = labStaff.assignedOrders.length < 3;
    await labStaff.save();

    // Update order with staff info
    order.assignedStaff = {
      staffId: labStaff._id,
      staffName: labStaff.name,
      staffPhone: labStaff.phone,
      assignedAt: new Date(),
      assignedBy: req.admin?.name || 'Admin',
      estimatedArrival: new Date(Date.now() + 30 * 60000) // 30 mins from now
    };
    await order.save();

    // ✅ Send Kafka event for manual assignment
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_ORDER_MANUALLY_ASSIGNED,
        {
          orderId: order._id.toString(),
          staffId: labStaff._id.toString(),
          staffName: labStaff.name,
          assignedBy: req.admin?.name || 'Admin',
          assignmentTime: new Date().toISOString(),
          timestamp: new Date().toISOString()
        }
      );
      console.log('📤 Kafka event sent: LAB_ORDER_MANUALLY_ASSIGNED');
    } catch (kafkaError) {
      console.error('⚠️  Failed to send Kafka event:', kafkaError.message);
    }

    // Send email to staff
    const staffEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #8b5cf6; text-align: center;">📋 Lab Order Manually Assigned</h2>
        <div style="background: #f5f3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 16px; color: #5b21b6;">Hello <strong>${labStaff.name}</strong>,</p>
          <p style="color: #4b5563;">An order has been manually assigned to you by admin.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #7c3aed;">📋 Assignment Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #ede9fe;">
                <span style="font-weight: bold;">Order ID:</span>
                <span style="float: right;">${order._id.toString().slice(-8).toUpperCase()}</span>
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #ede9fe;">
                <span style="font-weight: bold;">Assigned By:</span>
                <span style="float: right;">${req.admin?.name || 'Admin'}</span>
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #ede9fe;">
                <span style="font-weight: bold;">Patient:</span>
                <span style="float: right;">${order.patientDetails?.name || 'Patient'}</span>
              </li>
              <li style="padding: 8px 0;">
                <span style="font-weight: bold;">Collection Time:</span>
                <span style="float: right;">Within 30 minutes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    `;

    await sendGeneralEmail(
      labStaff.email,
      `📋 Lab Order Assigned Manually - ${order._id.toString().slice(-8).toUpperCase()}`,
      staffEmailHtml
    );

    res.json({
      success: true,
      message: 'Order assigned successfully',
      data: {
        staff: {
          id: labStaff._id,
          name: labStaff.name,
          email: labStaff.email
        },
        order: {
          id: order._id,
          assignedStaff: order.assignedStaff
        }
      }
    });

  } catch (err) {
    console.error('Assign order error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------
// Update LabStaff Status (Available/Busy)
// --------------------------
exports.updateStaffStatus = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const { id } = req.params;

    const labStaff = await LabStaff.findById(id);
    if (!labStaff) {
      return res.status(404).json({
        success: false,
        message: "LabStaff not found"
      });
    }

    labStaff.isAvailable = isAvailable;
    await labStaff.save();

    // ✅ Send Kafka event for status update
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_STAFF_STATUS_UPDATED,
        {
          staffId: labStaff._id.toString(),
          name: labStaff.name,
          isAvailable: labStaff.isAvailable,
          assignedOrdersCount: labStaff.assignedOrders.length,
          timestamp: new Date().toISOString()
        }
      );
      console.log('📤 Kafka event sent: LAB_STAFF_STATUS_UPDATED');
    } catch (kafkaError) {
      console.error('⚠️  Failed to send Kafka event:', kafkaError.message);
    }

    res.json({
      success: true,
      message: `Staff status updated to ${isAvailable ? 'Available' : 'Busy'}`,
      data: labStaff
    });

  } catch (err) {
    console.error('Update staff status error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------
// Update LabStaff Order Status with Kafka
// --------------------------
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const { id, orderId } = req.params;

    const labStaff = await LabStaff.findById(id);
    if (!labStaff) {
      return res.status(404).json({
        success: false,
        message: "LabStaff not found"
      });
    }

    // Admin check
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Admin access required"
      });
    }

    // Find the assigned order
    const orderIndex = labStaff.assignedOrders.findIndex(
      o => o.orderId.toString() === orderId
    );

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Order not found in staff's assigned orders"
      });
    }

    // Update order status
    labStaff.assignedOrders[orderIndex].status = status;
    labStaff.assignedOrders[orderIndex].updatedAt = new Date();
    
    if (notes) {
      labStaff.assignedOrders[orderIndex].notes = notes;
    }

    // If order completed, move to completed count
    if (status === 'completed') {
      labStaff.completedOrders = (labStaff.completedOrders || 0) + 1;
      
      // Remove from assigned orders
      labStaff.assignedOrders.splice(orderIndex, 1);
      
      // Make staff available again if they have less than 3 orders
      labStaff.isAvailable = labStaff.assignedOrders.length < 3;
    }

    await labStaff.save();

    // ✅ Send Kafka event for order status update
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_STAFF_ORDER_STATUS_UPDATED,
        {
          staffId: labStaff._id.toString(),
          staffName: labStaff.name,
          orderId: orderId,
          newStatus: status,
          notes: notes,
          timestamp: new Date().toISOString()
        }
      );
      console.log('📤 Kafka event sent: LAB_STAFF_ORDER_STATUS_UPDATED');
    } catch (kafkaError) {
      console.error('⚠️  Failed to send Kafka event:', kafkaError.message);
    }

    // Send email notification
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #059669; text-align: center;">📊 Order Status Updated</h2>
        <div style="background: #ecfdf5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 16px; color: #047857;">Hello <strong>${labStaff.name}</strong>,</p>
          <p style="color: #374151;">The status of your assigned order has been updated.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #059669;">📋 Status Update:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #a7f3d0;">
                <span style="font-weight: bold;">Order ID:</span>
                <span style="float: right;">${orderId.slice(-8).toUpperCase()}</span>
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #a7f3d0;">
                <span style="font-weight: bold;">New Status:</span>
                <span style="float: right; color: ${
                  status === 'completed' ? '#059669' : 
                  status === 'in_progress' ? '#f59e0b' : '#ef4444'
                };">${status.toUpperCase()}</span>
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #a7f3d0;">
                <span style="font-weight: bold;">Updated By:</span>
                <span style="float: right;">Admin</span>
              </li>
              ${notes ? `
                <li style="padding: 8px 0;">
                  <span style="font-weight: bold;">Notes:</span>
                  <span style="float: right;">${notes}</span>
                </li>
              ` : ''}
            </ul>
          </div>
        </div>
      </div>
    `;

    await sendGeneralEmail(
      labStaff.email,
      `📊 Order Status Updated - ${orderId.slice(-8).toUpperCase()}`,
      emailHtml
    );

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: {
        staff: {
          id: labStaff._id,
          name: labStaff.name,
          available: labStaff.isAvailable,
          assignedOrders: labStaff.assignedOrders.length,
          completedOrders: labStaff.completedOrders
        },
        order: {
          id: orderId,
          status: status
        }
      }
    });

  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------
// List All LabStaff with Kafka events
// --------------------------
exports.listLabStaff = async (req, res) => {
  try {
    const { available, location } = req.query;
    
    let query = {};
    
    if (available === 'true') {
      query.isAvailable = true;
      query.isActive = true;
    }
    
    if (location) {
      try {
        const [lng, lat] = location.split(',').map(Number);
        if (!isNaN(lng) && !isNaN(lat)) {
          // This would require geospatial query
          // For simplicity, we'll just add coordinates to response
          query.location = { $exists: true };
        }
      } catch (e) {
        console.log('Invalid location format');
      }
    }

    const labStaffs = await LabStaff.find(query)
      .select('-verificationDocuments -__v')
      .sort({ isAvailable: -1, createdAt: -1 });

    // ✅ Send Kafka event for staff list access (admin monitoring)
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_STAFF_LIST_ACCESSED,
        {
          accessedBy: req.admin?.name || 'Admin',
          filter: { available, location },
          count: labStaffs.length,
          timestamp: new Date().toISOString()
        }
      );
    } catch (kafkaError) {
      // Silent fail for monitoring events
    }

    res.json({
      success: true,
      count: labStaffs.length,
      data: labStaffs
    });

  } catch (err) {
    console.error('List lab staff error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------
// Update LabStaff (Admin) with Kafka
// --------------------------
exports.updateLabStaff = async (req, res) => {
  try {
    const updates = req.body;
    const { id } = req.params;

    // Don't allow changing critical fields directly
    const allowedUpdates = [
      'name', 'phone', 'email', 'address', 'isActive', 
      'isAvailable', 'location'
    ];
    
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const labStaff = await LabStaff.findByIdAndUpdate(
      id, 
      filteredUpdates, 
      { new: true, runValidators: true }
    );
    
    if (!labStaff) {
      return res.status(404).json({
        success: false,
        message: "LabStaff not found"
      });
    }

    // ✅ Send Kafka event for staff update
    try {
      await kafkaProducer.sendLabTestEvent(
        EVENT_TYPES.LAB_STAFF_UPDATED,
        {
          staffId: labStaff._id.toString(),
          name: labStaff.name,
          updatedFields: Object.keys(filteredUpdates),
          updatedBy: req.admin?.name || 'Admin',
          timestamp: new Date().toISOString()
        }
      );
      console.log('📤 Kafka event sent: LAB_STAFF_UPDATED');
    } catch (kafkaError) {
      console.error('⚠️  Failed to send Kafka event:', kafkaError.message);
    }

    // Send update email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b; text-align: center;">🔧 Account Updated</h2>
        <div style="background: #fffbeb; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 16px; color: #92400e;">Hello <strong>${labStaff.name}</strong>,</p>
          <p style="color: #4b5563;">Your account details have been updated by Admin.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #d97706;">📋 Updated Fields:</h3>
            <ul style="list-style: none; padding: 0;">
              ${Object.keys(filteredUpdates).map(field => `
                <li style="padding: 8px 0; border-bottom: 1px solid #fde68a;">
                  <span style="font-weight: bold;">${field}:</span>
                  <span style="float: right;">${updates[field]}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          
          <p style="color: #92400e; font-size: 14px;">
            If you didn't request these changes, please contact admin immediately.
          </p>
        </div>
      </div>
    `;

    await sendGeneralEmail(
      labStaff.email,
      "🔧 LabStaff Account Updated",
      emailHtml
    );

    res.json({
      success: true,
      message: 'Lab staff updated successfully',
      data: labStaff
    });

  } catch (err) {
    console.error('Update lab staff error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};