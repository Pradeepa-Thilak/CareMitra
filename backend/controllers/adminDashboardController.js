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

      revenueByDay,
      topProducts,
      topDoctors
    ] = await Promise.all([
      Patient.countDocuments(),
      Order.countDocuments(),

      ConsultingDoctor.countDocuments({ createdAt: { $gte: today } }),

      Order.aggregate([
        { $match: { createdAt: { $gte: today }, "paymentDetails.paymentStatus": "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),

      Doctor.countDocuments({ status: "pending" }),

      Order.countDocuments({ orderStatus: { $in: ["pending", "processing"] } }),

      ConsultingDoctor.countDocuments({ "paymentDetails.status": "pending" }),

      Order.find().sort({ createdAt: -1 }).limit(5),

      ConsultingDoctor.find().sort({ createdAt: -1 }).limit(5),

      // 🔹 Revenue By Day
      Order.aggregate([
        { $match: { "paymentDetails.paymentStatus": "completed" } },
        {
          $group: {
            _id: { $dayOfWeek: "$createdAt" },
            revenue: { $sum: "$totalAmount" }
          }
        },
        {
          $project: {
            day: {
              $arrayElemAt: [
                ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                { $subtract: ["$_id", 1] }
              ]
            },
            revenue: 1,
            _id: 0
          }
        }
      ]),

      // 🔹 Top Products
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            sold: { $sum: "$items.quantity" },
            revenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] }
            }
          }
        },
        { $sort: { sold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: 0,
            name: "$product.name",
            sold: 1,
            revenue: 1,
            stock: "$product.stock"
          }
        }
      ]),

      // 🔹 Top Doctors
      ConsultingDoctor.aggregate([
        { $match: { "paymentDetails.status": "completed" } },
        {
          $group: {
            _id: "$doctorId",
            consultations: { $sum: 1 },
            revenue: { $sum: "$fee" }
          }
        },
        { $sort: { consultations: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "_id",
            as: "doctor"
          }
        },
        { $unwind: "$doctor" },
        {
          $project: {
            _id: 0,
            name: "$doctor.name",
            rating: "$doctor.rating",
            consultations: 1,
            revenue: 1
          }
        }
      ])
    ]);

    res.json({
      kpis: {
        totalPatients,
        totalOrders,
        todayConsultations,
        todayRevenue: todayRevenue[0]?.total || 0
      },
      actions: {
        pendingDoctors,
        pendingOrders,
        unpaidConsultations
      },
      recent: {
        orders: recentOrders,
        consultations: recentConsultations
      },
      revenueByDay,
      topProducts,
      topDoctors
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
