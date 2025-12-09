const Doctor = require('../models/Doctor');
const { createOrder, verifyPaymentSignature } = require('../config/razorpay');
const { sendOTPEmail , sendGeneralEmail} = require('../utils/sendEmail');

// Email notification functions
const sendPaymentFailureEmail = async (doctor) => {
  try {
    const subject = 'Payment Failed - CareMitra Doctor Registration';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Payment Failed</h2>
        <p>Dear Dr. ${doctor.name},</p>
        <p>Your payment for the <strong>${doctor.premiumPlan.selectedPlan}</strong> plan has failed.</p>
        <p><strong>Plan Details:</strong></p>
        <ul>
          <li>Amount: ₹${doctor.premiumPlan.amount}</li>
          <li>Patient Limit: ${doctor.premiumPlan.patientLimit}</li>
        </ul>
        <p>Please try again or contact support.</p>
        <p>Best regards,<br>CareMitra Team</p>
      </div>
    `;

    await sendGeneralEmail(
      doctor.email,
      subject,
      html
    );
  } catch (error) {
    console.error('Payment failure email error:', error);
  }
};

const notifyAdminAboutPayment = async (doctor) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@caremitra.com';
    const subject = `New Payment - Dr. ${doctor.name}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3;">New Payment Received</h2>
        <p>Doctor: ${doctor.name}</p>
        <p>Email: ${doctor.email}</p>
        <p>Amount: ₹${doctor.premiumPlan.amount}</p>
        <p>Please verify the application.</p>
      </div>
    `;

    await sendGeneralEmail(
      adminEmail,
      subject,
      html
    );
  } catch (error) {
    console.error('Admin notification error:', error);
  }
};

// Create Razorpay order
const createPremiumOrder = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (!doctor.premiumPlan) {
      return res.status(400).json({
        success: false,
        message: 'Please select a premium plan first'
      });
    }

    if (doctor.paymentDetails.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed'
      });
    }

    // Create Razorpay order
    const order = await createOrder(doctor.premiumPlan.amount);

    // Update doctor with order details
    doctor.paymentDetails.paymentStatus = 'completed';

    await doctor.save();

    res.json({
      success: true,
      order,
      doctor: {
        name: doctor.name,
        amount: doctor.premiumPlan.amount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify payment
const verifyPremiumPayment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Verify payment signature
    const isVerified = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isVerified) {
      doctor.paymentStatus = 'failed';
      doctor.paymentDetails.status = 'failed';
      await doctor.save();

      await sendPaymentFailureEmail(doctor);

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Payment successful
    // doctor.paymentStatus = 'completed';
    doctor.premiumPlan.isActive = true
    doctor.paymentDetails = {
      razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    paymentStatus : 'completed',
      paymentDate: new Date(),
      amountPaid:doctor.premiumPlan.amount
    };

    // Set plan expiration (e.g., 30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    doctor.premiumPlan.purchasedAt = new Date();
    doctor.premiumPlan.expiresAt = expiresAt;

    await doctor.save();

    // Notify admin about payment completion
    await notifyAdminAboutPayment(doctor);

    // Send confirmation to doctor
    await sendGeneralEmail(
      doctor.email,
      `Dear Dr. ${doctor.name},\n\nYour payment of ₹${doctor.premiumPlan.amount} has been received successfully.\n\nYour application is now pending admin verification. You will be notified once verified.`,
      'Payment Successful - Awaiting Verification'
    );

    res.json({
      success: true,
      message: 'Payment verified successfully. Awaiting admin verification.',
      data: {
        doctorId: doctor._id,
        paymentStatus: 'completed',
        verificationStatus: 'pending',
        nextStep: 'admin-verification'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Handle refund for rejected doctors
const initiateRefund = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { adminId } = req.body; // Admin who initiated refund

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (doctor.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'No payment to refund'
      });
    }

    if (doctor.verificationStatus !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund rejected doctors'
      });
    }

    // Call Razorpay refund API here
    const refund = await razorpay.payments.refund(doctor.paymentDetails.razorpayPaymentId, {
      amount: doctor.premiumPlan.amount * 100 // in paise
    });

    // For now, simulate refund
    doctor.paymentStatus = 'refunded';
    doctor.refundDetails = {
      refundedAt: new Date(),
      refundedBy: adminId,
      refundAmount: doctor.premiumPlan.amount,
      status: 'completed'
    };

    await doctor.save();

    // Notify doctor about refund
    await sendGeneralEmail(
      doctor.email,
      `Dear Dr. ${doctor.name},\n\nYour payment of ₹${doctor.premiumPlan.amount} has been refunded.\n\nReason: Application rejected during verification.\n\nThe amount will reflect in your account within 5-7 business days.`,
      'Payment Refund Processed'
    );

    res.json({
      success: true,
      message: 'Refund initiated successfully',
      data: {
        doctorId: doctor._id,
        refundAmount: doctor.premiumPlan.amount,
        status: 'refunded'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createPremiumOrder,
  verifyPremiumPayment,
  initiateRefund,
 notifyAdminAboutPayment
};