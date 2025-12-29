// import React, { useEffect, useState } from "react";
// import { Users, Package, Stethoscope, IndianRupee, AlertTriangle } from "lucide-react";
// import { getDashboardStats } from "../utils/api";
// import { useNavigate } from "react-router-dom";

// export default function Dashboard() {
//   const [data, setData] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     const res = await getDashboardStats();
//     setData(res.data);
//   };

//   if (!data) return <p>Loading...</p>;

//   const { kpis, actions, recent } = data;

//   return (
//     <div className="space-y-8">

//       {/* HEADER */}
//       <h1 className="text-3xl font-bold">Admin Dashboard</h1>

//       {/* KPIs */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Kpi title="Patients" value={kpis.totalPatients} icon={Users} />
//         <Kpi title="Orders" value={kpis.totalOrders} icon={Package} />
//         <Kpi title="Today Consults" value={kpis.todayConsultations} icon={Stethoscope} />
//         <Kpi title="Revenue Today" value={`₹${kpis.todayRevenue}`} icon={IndianRupee} />
//       </div>

//       {/* ACTION REQUIRED */}
//       <div className="bg-red-50 border border-red-200 rounded-xl p-5">
//         <div className="flex items-center gap-2 mb-3">
//           <AlertTriangle className="text-red-600" />
//           <h3 className="font-semibold text-red-700">Action Required</h3>
//         </div>

//         <ul className="text-sm space-y-1">
//           <li onClick={() => navigate("/admin/doctors")} className="cursor-pointer">
//             Pending Doctors: <b>{actions.pendingDoctors}</b>
//           </li>
//           <li onClick={() => navigate("/admin/orders")} className="cursor-pointer">
//             Pending Orders: <b>{actions.pendingOrders}</b>
//           </li>
//           <li onClick={() => navigate("/admin/consultations")} className="cursor-pointer">
//             Unpaid Consultations: <b>{actions.unpaidConsultations}</b>
//           </li>
//         </ul>
//       </div>

//       {/* RECENT */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Recent title="Recent Orders" items={recent.orders} />
//         <Recent title="Recent Consultations" items={recent.consultations} />
//       </div>
//     </div>
//   );
// }

// /* -------- COMPONENTS -------- */

// const Kpi = ({ title, value, icon: Icon }) => (
//   <div className="bg-white p-5 rounded-xl shadow-sm">
//     <div className="flex justify-between items-center">
//       <div>
//         <p className="text-sm text-gray-500">{title}</p>
//         <h2 className="text-2xl font-bold">{value}</h2>
//       </div>
//       <Icon className="w-6 h-6 text-blue-600" />
//     </div>
//   </div>
// );

// const Recent = ({ title, items }) => (
//   <div className="bg-white rounded-xl shadow-sm p-5">
//     <h3 className="font-semibold mb-3">{title}</h3>
//     {items.length === 0 ? (
//       <p className="text-sm text-gray-500">No data</p>
//     ) : (
//       <ul className="text-sm space-y-2">
//         {items.map((i) => (
//           <li key={i._id} className="border-b pb-1">
//             ID: {i._id}
//           </li>
//         ))}
//       </ul>
//     )}
//   </div>
// );


import React, { useEffect, useState } from "react";
import { 
  Users, Package, Stethoscope, IndianRupee, AlertTriangle, 
  TrendingUp, TrendingDown, Clock, CheckCircle, XCircle,
  Calendar, Activity, DollarSign, UserCheck, ShoppingCart,
  FileText, Star, Phone, ArrowUpRight, Zap, Target, Award
} from "lucide-react";

// Mock API - Replace with your actual API call
const getMockDashboardData = () => {
  return {
    kpis: {
      totalPatients: 1247,
      patientsChange: 12.5,
      totalOrders: 342,
      ordersChange: -3.2,
      todayConsultations: 28,
      consultationsChange: 8.7,
      todayRevenue: 45680,
      revenueChange: 15.3,
      monthlyRevenue: 1245000,
      activeOrders: 45,
      completedToday: 23,
      avgConsultationTime: 32
    },
    actions: {
      pendingDoctors: 5,
      pendingOrders: 12,
      unpaidConsultations: 8,
      lowStock: 15,
      pendingRefunds: 3
    },
    recentOrders: [
      { id: "ORD-1234", patient: "Raj Kumar", amount: 2340, status: "pending", time: "10 mins ago" },
      { id: "ORD-1235", patient: "Priya Sharma", amount: 1560, status: "completed", time: "25 mins ago" },
      { id: "ORD-1236", patient: "Amit Patel", amount: 3200, status: "processing", time: "1 hour ago" },
      { id: "ORD-1237", patient: "Sneha Reddy", amount: 890, status: "pending", time: "2 hours ago" },
      { id: "ORD-1238", patient: "Vikram Singh", amount: 4500, status: "completed", time: "3 hours ago" }
    ],
    recentConsultations: [
      { id: "CON-5678", patient: "Anjali Verma", doctor: "Dr. Mehta", status: "completed", time: "5 mins ago", paid: true },
      { id: "CON-5679", patient: "Rohit Joshi", doctor: "Dr. Singh", status: "ongoing", time: "15 mins ago", paid: false },
      { id: "CON-5680", patient: "Kavita Das", doctor: "Dr. Kumar", status: "completed", time: "45 mins ago", paid: true },
      { id: "CON-5681", patient: "Suresh Iyer", doctor: "Dr. Patel", status: "scheduled", time: "In 30 mins", paid: false }
    ],
    topDoctors: [
      { name: "Dr. Rajesh Mehta", consultations: 45, rating: 4.9, revenue: 67500 },
      { name: "Dr. Priya Singh", consultations: 38, rating: 4.8, revenue: 57000 },
      { name: "Dr. Amit Kumar", consultations: 35, rating: 4.7, revenue: 52500 },
      { name: "Dr. Sneha Patel", consultations: 32, rating: 4.9, revenue: 48000 }
    ],
    revenueByDay: [
      { day: "Mon", revenue: 42000 },
      { day: "Tue", revenue: 38000 },
      { day: "Wed", revenue: 51000 },
      { day: "Thu", revenue: 45000 },
      { day: "Fri", revenue: 48000 },
      { day: "Sat", revenue: 35000 },
      { day: "Sun", revenue: 28000 }
    ],
    topProducts: [
      { name: "Paracetamol 500mg", sold: 340, revenue: 17000, stock: 1200 },
      { name: "Amoxicillin 250mg", sold: 210, revenue: 31500, stock: 450 },
      { name: "Vitamin D3", sold: 189, revenue: 28350, stock: 890 },
      { name: "Blood Pressure Monitor", sold: 45, revenue: 67500, stock: 120 }
    ]
  };
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setTimeout(() => {
      setData(getMockDashboardData());
      setLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const { kpis, actions, recentOrders, recentConsultations, topDoctors, revenueByDay, topProducts } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live updates • Last synced just now
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4" />
              Today
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium">
              <Activity className="w-4 h-4" />
              View Reports
            </button>
          </div>
        </div>

        {/* Main KPI Cards - Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            title="Total Patients" 
            value={kpis.totalPatients.toLocaleString()} 
            change={kpis.patientsChange}
            icon={Users} 
            gradient="from-blue-500 to-blue-600"
            bgGradient="from-blue-50 to-blue-100"
          />
          <KpiCard 
            title="Total Orders" 
            value={kpis.totalOrders.toLocaleString()} 
            change={kpis.ordersChange}
            icon={Package} 
            gradient="from-purple-500 to-purple-600"
            bgGradient="from-purple-50 to-purple-100"
          />
          <KpiCard 
            title="Today's Consultations" 
            value={kpis.todayConsultations} 
            change={kpis.consultationsChange}
            icon={Stethoscope} 
            gradient="from-green-500 to-emerald-600"
            bgGradient="from-green-50 to-emerald-100"
          />
          <KpiCard 
            title="Today's Revenue" 
            value={`₹${(kpis.todayRevenue / 1000).toFixed(1)}K`} 
            change={kpis.revenueChange}
            icon={IndianRupee} 
            gradient="from-orange-500 to-red-500"
            bgGradient="from-orange-50 to-red-100"
          />
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStat icon={DollarSign} label="Monthly Revenue" value={`₹${(kpis.monthlyRevenue / 100000).toFixed(1)}L`} color="emerald" />
          <QuickStat icon={ShoppingCart} label="Active Orders" value={kpis.activeOrders} color="blue" />
          <QuickStat icon={CheckCircle} label="Completed Today" value={kpis.completedToday} color="purple" />
          <QuickStat icon={Clock} label="Avg Consultation" value={`${kpis.avgConsultationTime} min`} color="amber" />
        </div>

        {/* Action Required - Enhanced Alert */}
        {(actions.pendingDoctors > 0 || actions.pendingOrders > 0 || actions.unpaidConsultations > 0) && (
          <div className="relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-xl">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <AlertTriangle className="text-white w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-4">⚡ Urgent Actions Required</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <ActionItem label="Pending Doctors" value={actions.pendingDoctors} link="/admin/doctors" />
                    <ActionItem label="Pending Orders" value={actions.pendingOrders} link="/admin/orders" />
                    <ActionItem label="Unpaid Consultations" value={actions.unpaidConsultations} link="/admin/consultations" />
                    <ActionItem label="Low Stock Items" value={actions.lowStock} link="/admin/inventory" />
                    <ActionItem label="Pending Refunds" value={actions.pendingRefunds} link="/admin/refunds" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - 2 spans */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-xl">Recent Orders</h3>
                    <p className="text-blue-100 text-sm mt-1">Latest transactions</p>
                  </div>
                  <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all text-sm font-medium flex items-center gap-2">
                    View All <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {recentOrders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </div>
            </div>

            {/* Recent Consultations */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-xl">Recent Consultations</h3>
                    <p className="text-green-100 text-sm mt-1">Active sessions</p>
                  </div>
                  <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all text-sm font-medium flex items-center gap-2">
                    View All <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {recentConsultations.map((consultation) => (
                  <ConsultationRow key={consultation.id} consultation={consultation} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 1 span */}
          <div className="space-y-6">
            
            {/* Top Doctors */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xl">Top Doctors</h3>
                    <p className="text-amber-100 text-sm">This month's leaders</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {topDoctors.map((doctor, idx) => (
                  <DoctorCard key={idx} doctor={doctor} rank={idx + 1} />
                ))}
              </div>
            </div>

            {/* Weekly Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xl">Weekly Revenue</h3>
                    <p className="text-indigo-100 text-sm">Last 7 days</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {revenueByDay.map((day, idx) => (
                  <RevenueBar key={idx} day={day.day} revenue={day.revenue} max={Math.max(...revenueByDay.map(d => d.revenue))} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl">Top Selling Products</h3>
                  <p className="text-pink-100 text-sm">Best performers</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topProducts.map((product, idx) => (
                <ProductCard key={idx} product={product} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* -------- COMPONENTS -------- */

const KpiCard = ({ title, value, change, icon: Icon, gradient, bgGradient }) => {
  const isPositive = change > 0;

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" 
           style={{background: `linear-gradient(to right, var(--tw-gradient-stops))`}}></div>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-4 rounded-xl bg-gradient-to-br ${bgGradient} shadow-md`}>
            <Icon className={`w-7 h-7 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`} style={{fill: 'url(#grad)'}} />
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium mb-2">{title}</p>
          <h2 className="text-4xl font-bold text-gray-900">{value}</h2>
        </div>
      </div>
    </div>
  );
};

const QuickStat = ({ icon: Icon, label, value, color }) => {
  const colors = {
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    amber: 'from-amber-500 to-orange-500'
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colors[color]} shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const ActionItem = ({ label, value, link }) => (
  <a href={link} className="block p-4 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white hover:scale-105 transition-all cursor-pointer shadow-md">
    <p className="text-xs text-gray-600 font-medium mb-1">{label}</p>
    <p className="text-3xl font-bold text-red-600">{value}</p>
  </a>
);

const OrderRow = ({ order }) => {
  const statusStyles = {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    processing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
  };

  const status = statusStyles[order.status];

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-blue-200">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{order.patient}</p>
          <p className="text-sm text-gray-500">{order.id} • {order.time}</p>
        </div>
      </div>
      <div className="text-right flex items-center gap-3">
        <div>
          <p className="font-bold text-lg text-gray-900">₹{order.amount.toLocaleString()}</p>
          <span className={`text-xs px-3 py-1 rounded-full font-medium border ${status.bg} ${status.text} ${status.border}`}>
            {order.status}
          </span>
        </div>
        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
    </div>
  );
};

const ConsultationRow = ({ consultation }) => {
  const statusConfig = {
    completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    ongoing: { icon: Activity, color: 'text-blue-600 animate-pulse', bg: 'bg-blue-50' },
    scheduled: { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' }
  };

  const config = statusConfig[consultation.status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-green-200">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
          <Stethoscope className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{consultation.patient}</p>
          <p className="text-sm text-gray-500">{consultation.doctor} • {consultation.time}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <StatusIcon className={`w-5 h-5 ${config.color}`} />
        </div>
        {consultation.paid ? (
          <div className="p-2 rounded-lg bg-green-50">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        ) : (
          <div className="p-2 rounded-lg bg-red-50">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
        )}
      </div>
    </div>
  );
};

const DoctorCard = ({ doctor, rank }) => {
  const rankColors = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-gray-300 to-gray-400',
    3: 'from-orange-400 to-amber-600'
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl hover:shadow-md transition-all border border-amber-100">
      <div className={`w-10 h-10 bg-gradient-to-br ${rankColors[rank] || 'from-blue-400 to-blue-500'} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md`}>
        {rank}
      </div>
      <div className="flex-1">
        <p className="font-bold text-gray-900">{doctor.name}</p>
        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
          <span className="flex items-center gap-1">
            <Phone className="w-4 h-4" /> {doctor.consultations}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {doctor.rating}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-green-600">₹{(doctor.revenue / 1000).toFixed(0)}K</p>
      </div>
    </div>
  );
};

const RevenueBar = ({ day, revenue, max }) => {
  const percentage = (revenue / max) * 100;
  
  return (
    <div className="group">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600 font-medium">{day}</span>
        <span className="font-bold text-gray-900">₹{(revenue / 1000).toFixed(0)}K</span>
      </div>
      <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 group-hover:shadow-lg"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const isLowStock = product.stock < 500;
  
  return (
    <div className="p-5 bg-gradient-to-br from-white to-pink-50 border-2 border-pink-100 rounded-xl hover:border-pink-300 hover:shadow-xl transition-all group">
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-bold text-gray-900 line-clamp-2 flex-1">{product.name}</h4>
        <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
          <Package className="w-4 h-4 text-pink-600" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Units Sold</span>
          <span className="font-bold text-gray-900 text-lg">{product.sold}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Revenue</span>
          <span className="font-bold text-green-600 text-lg">₹{(product.revenue / 1000).toFixed(1)}K</span>
        </div>
        <div className="pt-3 border-t border-pink-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Stock Level</span>
            <span className={`font-bold text-lg ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
              {product.stock}
            </span>
          </div>
          {isLowStock && (
            <div className="mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium text-center">
              Low Stock Alert
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
