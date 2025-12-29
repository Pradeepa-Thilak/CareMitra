const Patient = require("../models/Patient");
const Order = require("../models/Order");
const ConsultingDoctor = require("../models/ConsultingDoctor");
const Doctor = require("../models/Doctor");

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalPatients,
      totalOrders,
      todayConsultations,
      todayRevenue,
      pendingDoctors,
      pendingOrders,
      unpaidConsultations,
      recentOrders,
      recentConsultations,
    ] = await Promise.all([
      Patient.countDocuments(),
      Order.countDocuments(),
      ConsultingDoctor.countDocuments({ createdAt: { $gte: today } }),

      Order.aggregate([
        { $match: { createdAt: { $gte: today }, "paymentDetails.paymentStatus": "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      Doctor.countDocuments({ status: "pending" }),
      Order.countDocuments({ orderStatus: { $in: ["pending", "processing"] } }),
      ConsultingDoctor.countDocuments({ "paymentDetails.status": "pending" }),

      Order.find().sort({ createdAt: -1 }).limit(5),
      ConsultingDoctor.find().sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      kpis: {
        totalPatients,
        totalOrders,
        todayConsultations,
        todayRevenue: todayRevenue[0]?.total || 0,
      },
      actions: {
        pendingDoctors,
        pendingOrders,
        unpaidConsultations,
      },
      recent: {
        orders: recentOrders,
        consultations: recentConsultations,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
