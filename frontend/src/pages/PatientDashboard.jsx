import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { CalendarDays, UserCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../utils/api";

/**
 * PatientDashboard (improved UI)
 * - keeps your backend calls
 * - adds search/filter, stats, sidebar, timeline & carousel
 * - relies on existing AppointmentCard, DoctorCard and BookAppointmentModal
 */

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
    <div className="p-2 rounded-lg bg-sky-100 text-sky-700">{icon}</div>
    <div>
      <div className="text-xs text-slate-400">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  </div>
);

const IconSearch = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconPlus = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // core data
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);

  // ui state
  const [query, setQuery] = useState("");

  // -------------------------
  // Data fetching (real API)
  // -------------------------
  const fetchAppointments = async () => {
    try {
      const res = await api.get("/dashboard/myAppointments");
      setAppointments(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load appointments");
    }
  };



  useEffect(() => {
    fetchAppointments();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3 bg-white rounded-2xl p-4 shadow-sm hidden lg:block sticky top-6 self-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
              <UserCircle2 size={28} />
            </div>
            <div>
              <div className="text-xs text-slate-400">Welcome</div>
              <div className="font-semibold text-slate-800">{user?.name || "Patient"}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            <Link to="/appointments" className="block text-sm px-3 py-2 rounded-lg hover:bg-slate-50">My Appointments</Link>
            <Link to="/reports" className="block text-sm px-3 py-2 rounded-lg hover:bg-slate-50">My Reports</Link>
            <Link to="/prescriptions" className="block text-sm px-3 py-2 rounded-lg hover:bg-slate-50">Prescriptions</Link>
            <Link to="/help" className="block text-sm px-3 py-2 rounded-lg hover:bg-slate-50">Help & Support</Link>
          </nav>

        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Patient Dashboard</h1>
             </div>

            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/profile")} className="bg-white px-3 py-2 rounded-lg shadow-sm">Profile</button>
            </div>
          </div>

          </main>
      </div> 
    </div>
  );
};

export default PatientDashboard;