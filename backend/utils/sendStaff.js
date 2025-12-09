// // utils/sendEmail.js
// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// /**
//  * Send email via SendGrid
//  * @param {string} to - recipient email
//  * @param {string} subject - email subject
//  * @param {string} htmlContent - email body in HTML
//  */
// async function sendEmail(to, subject, htmlContent) {
//   if (!to || !subject || !htmlContent) {
//     throw new Error("SendGrid: Missing required parameters (to, subject, htmlContent)");
//   }

//   const msg = {
//     to,
//     from: process.env.SENDGRID_VERIFIED_EMAIL, // Must be verified
//     subject,
//     html: htmlContent
//   };

//   try {
//     const response = await sgMail.send(msg);
//     console.log("SendGrid response:", response[0].statusCode);
//     return response;
//   } catch (error) {
//     console.error("SendGrid error:", error.response ? error.response.body : error.message);
//     throw error;
//   }
// }

// module.exports = { sendEmail };

const LabStaff = require('../models/LabStaff');
const { sendEmail } = require('../utils/sendStaff');

// --------------------------
// Create LabStaff (Admin)
// --------------------------
exports.createLabStaff = async (req, res) => {
  try {
    const { user, name, phone, email, location, address } = req.body;

    const labStaff = new LabStaff({ user, name, phone, email, location, address });
    await labStaff.save();

    const emailHtml = `
      <h2>Welcome to the Team!</h2>
      <p>Hi ${labStaff.name},</p>
      <p>Your account has been created. Use the credentials provided to log in.</p>
    `;

    // Send email
    await sendEmail(labStaff.email, "Welcome to Admin Panel", emailHtml);

    res.status(201).json({ success: true, labStaff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------
// Update LabStaff (Admin)
// --------------------------
exports.updateLabStaff = async (req, res) => {
  try {
    const updates = req.body;

    const labStaff = await LabStaff.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!labStaff)
      return res.status(404).json({ success: false, message: "LabStaff not found" });

    // Send email about update
    const emailHtml = `
      <h2>Account Updated</h2>
      <p>Hello ${labStaff.name},</p>
      <p>Your account details have been updated by Admin.</p>
      <p><strong>Changes:</strong> ${JSON.stringify(updates)}</p>
    `;
    await sendEmail(labStaff.email, "LabStaff Account Updated", emailHtml);

    res.json({ success: true, labStaff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------
// Assign Order to LabStaff (Admin)
// --------------------------
exports.assignOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const labStaff = await LabStaff.findById(req.params.id);
    if (!labStaff)
      return res.status(404).json({ success: false, message: "LabStaff not found" });

    labStaff.assignedOrders.push({ orderId, assignedAt: new Date(), status: "assigned" });
    await labStaff.save();

    // Send email about assigned order
    const emailHtml = `
      <h2>New Lab Order Assigned</h2>
      <p>Hello ${labStaff.name},</p>
      <p>A new lab order (ID: ${orderId}) has been assigned to you.</p>
      <p>Please check your dashboard for details.</p>
    `;
    await sendEmail(labStaff.email, "New Lab Order Assigned", emailHtml);

    res.json({ success: true, labStaff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------
// Update LabStaff Order Status
// --------------------------
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const labStaff = await LabStaff.findById(req.params.id);
    if (!labStaff) return res.status(404).json({ success: false, message: "LabStaff not found" });

    // Find order by orderId
    const order = labStaff.assignedOrders.find(
      o => o.orderId.toString() === req.params.orderId
    );
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.status = status;
    await labStaff.save();

    // Send email about order status update
    const emailHtml = `
      <h2>Lab Order Status Updated</h2>
      <p>Hello ${labStaff.name},</p>
      <p>The status of your order (ID: ${req.params.orderId}) has been updated to "<strong>${status}</strong>".</p>
    `;
    await sendEmail(labStaff.email, "Lab Order Status Updated", emailHtml);

    res.json({ success: true, labStaff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------------
// List All LabStaff (Admin)
// --------------------------
exports.listLabStaff = async (req, res) => {
  try {
    const labStaffs = await LabStaff.find();
    res.json({ success: true, labStaffs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

