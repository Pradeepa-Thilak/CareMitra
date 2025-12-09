const LabTest = require('../models/LabTest');
const LabTestOrder = require('../models/LabTestOrder');
const kafkaProducer = require('../kafka/producer');
const { EVENT_TYPES } = require('../kafka/topics');
const { sendGeneralEmail } = require('../utils/sendEmail');

class LabTestService {
  async createOrder(userId, data, prescriptionFile) {
    const order = await LabTestOrder.create({
      user: userId,
      tests: data.tests,
      totalAmount: data.totalAmount,
      patientDetails: data.patientDetails,
      sampleCollectionDetails: data.sampleCollectionDetails,
      prescriptionFile,
      razorpayOrderId: data.razorpayOrderId,
      paymentStatus: 'pending'
    });

    // Send Kafka event
    await kafkaProducer.sendLabTestEvent(
      EVENT_TYPES.LAB_TEST_ORDER_CREATED,
      {
        orderId: order._id,
        userId,
        tests: data.tests.map(t => t.testId),
        totalAmount: data.totalAmount,
        patientDetails: data.patientDetails,
        timestamp: new Date().toISOString()
      }
    );

    return order;
  }

  async verifyPayment(orderId, paymentData, userId) {
    const order = await LabTestOrder.findOneAndUpdate(
      { _id: orderId, user: userId },
      {
        paymentStatus: 'paid',
        razorpayPaymentId: paymentData.razorpayPaymentId,
        razorpaySignature: paymentData.razorpaySignature,
        orderStatus: 'ordered'
      },
      { new: true }
    ).populate('user', 'name email');

    if (!order) throw new Error('Order not found');

    // Send Kafka event
    await kafkaProducer.sendLabTestEvent(
      EVENT_TYPES.LAB_TEST_PAYMENT_VERIFIED,
      {
        orderId: order._id,
        userId,
        paymentId: paymentData.razorpayPaymentId,
        amount: order.totalAmount,
        timestamp: new Date().toISOString()
      }
    );

    // Send confirmation email
    const emailHtml = this.getPaymentConfirmationEmail(order);
    if (order.user.email) {
      await sendGeneralEmail(
        order.user.email,
        `🧪 Lab Test Order Confirmed - ${order._id}`,
        emailHtml
      );
    }

    return order;
  }

  async updateSampleStatus(orderId, updatedBy) {
    const order = await LabTestOrder.findByIdAndUpdate(
      orderId,
      { orderStatus: 'sample_collected' },
      { new: true }
    ).populate('user', 'name email');

    if (!order) throw new Error('Order not found');

    // Send Kafka event
    await kafkaProducer.sendLabTestEvent(
      EVENT_TYPES.LAB_TEST_SAMPLE_COLLECTED,
      {
        orderId: order._id,
        collectedBy: updatedBy,
        patientName: order.patientDetails?.name,
        timestamp: new Date().toISOString()
      }
    );

    // Send email notification
    if (order.user?.email) {
      const emailHtml = this.getSampleCollectedEmail(order);
      await sendGeneralEmail(
        order.user.email,
        `✅ Sample Collected Successfully - Order ${order._id}`,
        emailHtml
      );
    }

    return order;
  }

  async uploadReport(orderId, file) {
    const order = await LabTestOrder.findById(orderId).populate('user', 'name email');
    if (!order) throw new Error('Order not found');

    // Your existing report upload logic...
    // Then send Kafka event

    await kafkaProducer.sendLabTestEvent(
      EVENT_TYPES.LAB_TEST_REPORT_UPLOADED,
      {
        orderId: order._id,
        userId: order.user._id,
        reportInfo: {
          filename: file.originalname,
          size: file.size,
          type: file.mimetype
        },
        timestamp: new Date().toISOString()
      }
    );

    // Send email notification
    if (order.user?.email) {
      const emailHtml = this.getReportReadyEmail(order);
      await sendGeneralEmail(
        order.user.email,
        `📄 Lab Test Report Ready - Order ${order._id}`,
        emailHtml
      );
    }

    return order;
  }

  // Email template methods
  getPaymentConfirmationEmail(order) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; text-align: center;">🧪 Lab Test Order Confirmed</h2>
        <!-- Your existing email template -->
      </div>
    `;
  }

  getSampleCollectedEmail(order) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981; text-align: center;">✅ Sample Successfully Collected!</h2>
        <!-- Your existing email template -->
      </div>
    `;
  }

  getReportReadyEmail(order) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #8b5cf6; text-align: center;">📄 Your Lab Report is Ready!</h2>
        <!-- Your existing email template -->
      </div>
    `;
  }
}

module.exports = new LabTestService();