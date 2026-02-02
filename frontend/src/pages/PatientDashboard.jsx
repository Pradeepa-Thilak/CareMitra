import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  UserCircle2,
  FileText,
  Heart,
  Activity,
  Stethoscope,
  Download,
  Eye,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../utils/api";

const StatCard = ({ title, value, icon, color = "sky" }) => {
  const colorClasses = {
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    pink: "bg-pink-50 text-pink-600 border-pink-100",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center border ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);

  // State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const [payments, setPayments] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const fetchRecentPayments = async () => {
    try {
      setPaymentsLoading(true);
      const res = await api.get("/dashboard/fetchDetails");
      if (res.data?.success) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payment details");
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Data fetching
  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const res = await api.get(`lab-tests/reports/patient`);
      setReports(res?.data?.data || res?.data?.reports || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reports");
    } finally {
      setReportsLoading(false);
    }
  };

  const handleDownloadReport = async (reportId, fileName) => {
    try {
      // Use the correct endpoint to get report by reportId
      const res = await api.get(`/lab-tests/report/${reportId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download report");
    }
  };

  const handleViewReport = async (reportId) => {
    try {
      // Use the correct endpoint to get report by reportId
      const res = await api.get(`/lab-tests/report/${reportId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      window.open(url, "_blank");

      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error(err);
      toast.error("Failed to view report");
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard" && user?._id) {
      fetchRecentPayments();
    }

    if (activeTab === "reports" && user?._id) {
      fetchReports();
    }
  }, [activeTab, user]);

  // Calculate stats (using reports only now)
  const totalReports = reports.length;

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Activity className="w-4 h-4" />,
    },
    { id: "reports", label: "Reports", icon: <FileText className="w-4 h-4" /> },
    // { id: "prescriptions", label: "Prescriptions", icon: <Pill className="w-4 h-4" /> },
    { id: "help", label: "Help", icon: <Stethoscope className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Patient Dashboard
                </h1>
                <p className="text-xs text-gray-500">
                  Manage your health journey
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-sky-500 text-white"
                      : "text-gray-700 hover:text-sky-600 hover:bg-sky-50"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="md:hidden flex overflow-x-auto pb-3 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-sky-500 text-white"
                    : "text-gray-700 hover:text-sky-600 hover:bg-sky-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 mb-8 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.name || "Patient"}! 👋
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Here's your health overview for today
                  </p>
                  <p className="text-blue-200 text-sm mt-1">{user?.email}</p>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <UserCircle2 className="w-20 h-20 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary Section */}
            <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Recent Payments Summary
              </h3>

              {paymentsLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                </div>
              ) : !payments ? (
                <p className="text-gray-500 text-center">
                  No payment data available
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard
                    title="Lab Tests Paid"
                    value={`₹${Math.abs(payments.labTotalAmount ?? 0).toFixed(
                      2
                    )}`}
                    icon={<FileText className="w-6 h-6" />}
                    color="purple"
                  />
                  <StatCard
                    title="Orders Paid"
                    value={`₹${Math.abs(payments.orderTotalAmount ?? 0).toFixed(
                      2
                    )}`}
                    icon={<Activity className="w-6 h-6" />}
                    color="blue"
                  />
                  <StatCard
                    title="Consulting Paid"
                    value={`₹${Math.abs(
                      payments.consultingTotalAmount ?? 0
                    ).toFixed(2)}`}
                    icon={<Stethoscope className="w-6 h-6" />}
                    color="green"
                  />
                  <StatCard
                    title="Total Paid"
                    value={`₹${(payments.total ?? 0).toFixed(2)}`}
                    icon={<Heart className="w-6 h-6" />}
                    color="orange"
                  />
                </div>
              )}
            </div>

            {/* Stats Grid */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Reports"
                value={totalReports}
                icon={<FileText className="w-6 h-6" />}
                color="purple"
              />
              <StatCard
                title="Recent Activity"
                value="View Reports"
                icon={<Activity className="w-6 h-6" />}
                color="sky"
              />
              <StatCard
                title="Health Status"
                value="Good"
                icon={<Heart className="w-6 h-6" />}
                color="green"
              />
            </div> */}
          </>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Medical Reports
                </h2>
                <p className="text-gray-500 mt-1">
                  View and download your medical reports
                </p>
              </div>
            </div>

            {reportsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Reports Available
                </h3>
                <p className="text-gray-500">
                  Your medical reports will appear here once uploaded by your
                  healthcare provider.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-sky-600" />
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full">
                        PDF
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 truncate">
                      {report.fileName || "Medical Report"}
                    </h3>

                    {report.uploadedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(report.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewReport(report._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() =>
                          handleDownloadReport(report._id, report.fileName)
                        }
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prescriptions Tab */}
        {/* {activeTab === "prescriptions" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Prescriptions</h3>
            <p className="text-gray-500">Your prescriptions will appear here.</p>
          </div>
        )} */}

        {/* Help Tab */}
        {activeTab === "help" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Help & Support
            </h3>
            <p className="text-gray-500">
              Need assistance? Contact our support team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
