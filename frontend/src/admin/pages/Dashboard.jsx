// src/admin/pages/Dashboard.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  FlaskConical,
  Stethoscope,
  Pill,
  ArrowRight,
  Activity,
  CalendarDays, 
  IndianRupee,
  AlertTriangle,
  Truck,
  Package,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";



const ActionRequired = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-red-50 border border-red-200 rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-red-700">
          Action Required
        </h3>
      </div>

      <ul className="space-y-2 text-sm text-red-700">
        <li>• 3 doctors awaiting verification</li>
        <li>• 2 lab reports pending upload</li>
        <li>• 4 medicines out of stock</li>
      </ul>
    </motion.div>
  );
};

const OrdersDeliveryOverview = () => {
  const navigate = useNavigate();

  const items = [
    {
      label: "Orders in Processing",
      value: 14,
      icon: Package,
      color: "text-blue-600",
    },
    {
      label: "Out for Delivery",
      value: 9,
      icon: Truck,
      color: "text-green-600",
    },
    {
      label: "Delayed Deliveries",
      value: 2,
      icon: AlertCircle,
      color: "text-red-600",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Orders & Delivery Overview
        </h3>
        <button
          onClick={() => navigate("/admin/orders")}
          className="flex items-center text-sm text-blue-600 hover:underline"
        >
          View All Orders <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
            whileHover={{ scale: 1.03}}
            whileTap={{ scale: 0.98}}
              key={idx}
              className="border rounded-lg p-4 flex items-center gap-3"
            >
              <Icon className={`w-6 h-6 ${item.color}`} />
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-xl font-semibold text-gray-800">
                  {item.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-500 mt-4">
        Monitor medicine order fulfillment and delivery status in real time.
      </p>
    </motion.div>
  );
};


const TodaySnapshot = () => {
    const navigate = useNavigate();
  const items = [
    {
      label: "Appointments Today",
      value: 18,
      icon: CalendarDays,
      color: "text-blue-600",
      route: "/admin/patients?tab=appointments&today=true",
    },
    {
      label: "Lab Tests Scheduled",
      value: 12,
      icon: FlaskConical,
      color: "text-green-600",
      route: "/admin/lab-tests&today=true",
    },
    {
      label: "Payments Received",
      value: "₹24,500",
      icon: IndianRupee,
      color: "text-purple-600",
      route: "/admin/orders&today=true",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Today’s Snapshot
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(item.route)}
                className="border rounded-lg p-4 flex items-center gap-3 cursor-pointer
                         hover:bg-gray-50 hover:shadow-md transition"
            >
              <Icon className={`w-6 h-6 ${item.color}`} />
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-xl font-semibold text-gray-800">
                  {item.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// sample stats
const stats = [
  { title: "Pending Doctors", value: 12, icon: Stethoscope, color: "bg-blue-100 text-blue-700", route: "/admin/doctors" },
  { title: "Lab Tests Today", value: 34, icon: FlaskConical, color: "bg-green-100 text-green-700", route: "/admin/lab-tests" },
  { title: "Active Lab Staff", value: 8, icon: Users, color: "bg-purple-100 text-purple-700", route: "/admin/lab-staff" },
  { title: "Out of Stock Medicines", value: 5, icon: Pill, color: "bg-red-100 text-red-700", route: "/admin/medicines" },
  { title: "Orders delivery today", value:20, icon: Truck, color: "bg-orange-100 text-orange-600", route: "/admin/orders"},
];

// animation presets
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
const card = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Monitor overall activity and performance</p>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              variants={card}
              whileHover={{ scale: 1.04 }}
              className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md"
              onClick={() => navigate(item.route)}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 truncate whitespace-nowrap">{item.title}</p>
                  <h2 className="text-3xl font-bold text-gray-800 mt-1">{item.value}</h2>
                </div>
                <div className={`p-3 rounded-lg ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-600">
                View Details <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

        <ActionRequired />

        <TodaySnapshot />

        <OrdersDeliveryOverview />

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <ul className="divide-y divide-gray-100">
          <li className="py-3 flex justify-between items-center">
            <span className="text-gray-700 text-sm">Dr. Kavitha’s account verified</span>
            <span className="text-xs text-gray-400">5 min ago</span>
          </li>
          <li className="py-3 flex justify-between items-center">
            <span className="text-gray-700 text-sm">New lab test booked by Arjun</span>
            <span className="text-xs text-gray-400">12 min ago</span>
          </li>
          <li className="py-3 flex justify-between items-center">
            <span className="text-gray-700 text-sm">Medicine “Paracetamol” marked out of stock</span>
            <span className="text-xs text-gray-400">20 min ago</span>
          </li>
        </ul>
      </motion.div>

    </div>
  );
};

export default Dashboard;
