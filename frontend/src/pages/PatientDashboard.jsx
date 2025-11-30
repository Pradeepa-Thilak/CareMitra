import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import AppointmentCard from "../components/user/AppoinmentCard";
import DoctorCard from "../components/user/DoctorCard";
import { CalendarDays, UserCircle2 } from "lucide-react";
import BookAppointmentModal from "../components/modals/BookAppointmentModal";
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
  const [appointments, setAppointments] = useState([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // ui state
  const [query, setQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("All");

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

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/dashboard/doctorAll");
      setRecommendedDoctors(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load doctors");
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // Derived UI values
  // -------------------------
  const specialties = useMemo(() => {
    const s = Array.from(new Set(recommendedDoctors.map((d) => d.specialty).filter(Boolean)));
    return ["All", ...s];
  }, [recommendedDoctors]);

  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recommendedDoctors.filter((d) => {
      const matchesQuery =
        !q ||
        (d?.name && d.name.toLowerCase().includes(q)) ||
        (d?.specialty && d.specialty.toLowerCase().includes(q));
      const matchesFilter = specialtyFilter === "All" || (d?.specialty && d.specialty.toLowerCase().includes(specialtyFilter.toLowerCase()));
      return matchesQuery && matchesFilter;
    });
  }, [recommendedDoctors, query, specialtyFilter]);

  // -------------------------
  // Booking flow
  // -------------------------
  const handleBookAppointment = (doctor = null) => {
    setSelectedDoctor(doctor);
  };

  const handleConfirmAppointment = async (details) => {
    try {
      const payload = {
        doctorId: details?.doctor?._id || details?.doctor?.id,
        date: details.date,
        time: details.time,
        reason: details.reason,
      };

      await api.post("/dashboard/bookAppointment", payload);

      toast.success(`Appointment booked with ${details.doctor?.name || "Doctor"}`);

      // refresh data
      await fetchAppointments();
      setSelectedDoctor(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to book appointment!");
    }
  };

  // -------------------------
  // UI helpers
  // -------------------------
  const apptKey = (a) => a?._id || a?.id || JSON.stringify(a).slice(0, 12);

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

          <div className="mt-6 text-xs text-slate-400">
            <div>Patient ID: <span className="text-slate-600 font-medium">{user?.id || "N/A"}</span></div>
            <div className="mt-2">CareMitra • v1 (Mock)</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Patient Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">Manage appointments, connect with doctors and view reports.</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => handleBookAppointment(null)} className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2">
                <CalendarDays size={16} /> Book Appointment
              </button>
              <button onClick={() => navigate("/profile")} className="bg-white px-3 py-2 rounded-lg shadow-sm">Profile</button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Upcoming" value={appointments.length} icon={<CalendarDays size={18} />} />
            <StatCard title="Doctors" value={recommendedDoctors.length} icon={<UserCircle2 size={18} />} />
            <StatCard title="Reports" value={"3"} icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>} />
            <StatCard title="Notifications" value={2} icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 10-12 0v4l-2 2v1h16v-1l-2-2z"/></svg>} />
          </div>

          {/* Appointments + Doctors split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointments area */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
                    <p className="text-xs text-slate-400">Manage or cancel upcoming visits</p>
                  </div>
                  <div className="text-sm text-slate-500">{appointments.length} items</div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                  {appointments.length > 0 ? (
                    appointments.map((a) => <AppointmentCard key={apptKey(a)} appointment={a} />)
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-500">No upcoming appointments.</div>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Health Timeline</h2>
                    <p className="text-xs text-slate-400">Recent activities & reports</p>
                  </div>
                  <div className="text-xs text-slate-500">Last 30 days</div>
                </div>

                <ul className="mt-4 space-y-3">
                  <li className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">CBC Report</div>
                      <div className="text-xs text-slate-500">Available • 21 Nov 2025</div>
                    </div>
                    <div>
                      <button className="text-xs px-3 py-1 bg-indigo-600 text-white rounded">View</button>
                    </div>
                  </li>

                  <li className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Consultation with Dr. Anya</div>
                      <div className="text-xs text-slate-500">25 Nov 2024</div>
                    </div>
                    <div className="text-xs text-slate-500">Completed</div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Doctors area */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">Find a Doctor</h3>
                    <p className="text-xs text-slate-400">Search by name or specialty</p>
                  </div>
                </div>

                {/* Search + filter */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 bg-slate-50 p-2 rounded">
                    <IconSearch className="w-4 h-4 text-slate-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search doctors or specialty"
                      className="bg-transparent outline-none text-sm w-full"
                    />
                  </div>

                  <select
                    className="p-2 border rounded bg-white text-sm"
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                  >
                    {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Horizontal carousel */}
                <div className="mt-4 flex gap-3 overflow-x-auto py-2">
                  {filteredDoctors.length === 0 ? (
                    <div className="text-sm text-slate-500 p-4">No doctors match your search.</div>
                  ) : (
                    filteredDoctors.map((d) => (
                      <div key={d._id || d.id || d.email} className="flex-shrink-0">
                        <DoctorCard doctor={d} onBook={() => handleBookAppointment(d)} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <h4 className="font-semibold">Quick Actions</h4>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="p-2 rounded-lg bg-sky-600 text-white text-sm flex items-center justify-center gap-2">
                    <IconPlus className="w-4 h-4" /> Order Lab Test
                  </button>
                  <button className="p-2 rounded-lg bg-white border text-sm">View Reports</button>
                  <button className="p-2 rounded-lg bg-white border text-sm">Refill Prescription</button>
                  <button className="p-2 rounded-lg bg-white border text-sm">Chat with Support</button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400">Mock/real data — replace small static values when your APIs provide them.</div>
        </main>
      </div>

      {selectedDoctor && (
        <BookAppointmentModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onConfirm={handleConfirmAppointment}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
