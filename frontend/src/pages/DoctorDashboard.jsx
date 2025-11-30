import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  UserCircle2,
  Edit,
  X,
  Search,
  RefreshCw,
  MoreHorizontal
} from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * DoctorDashboard (enhanced UI)
 * - Search & filter controls
 * - Responsive grid with better card layout + avatar initials
 * - Skeleton loading UI
 * - Accessible reschedule modal (keyboard focus friendly)
 * - Status color mapping and improved badges
 * - Maintains your API structure & optimistic UI updates
 */

const STATUS_STYLES = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
  confirmed: { bg: "bg-green-100", text: "text-green-700" },
  completed: { bg: "bg-blue-100", text: "text-blue-700" },
  cancelled: { bg: "bg-red-100", text: "text-red-700" },
  unknown: { bg: "bg-gray-100", text: "text-gray-700" },
};

const formatDate = (isoDate) => {
  if (!isoDate) return "—";
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return isoDate;
  }
};

const formatTime = (time) => {
  if (!time) return "—";
  // if time like "14:30", convert to 2:30 PM
  try {
    const [hh, mm] = time.split(":");
    const d = new Date();
    d.setHours(Number(hh), Number(mm));
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return time;
  }
};

// small avatar with initials
const Avatar = ({ name }) => {
  const initials = (name || "U").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
  const bgClass = "bg-gradient-to-br from-sky-500 to-indigo-600";
  return (
    <div
      aria-hidden
      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${bgClass}`}
    >
      {initials}
    </div>
  );
};

// skeleton loader component
const SkeletonCard = () => (
  <div className="animate-pulse bg-white p-5 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-10 h-10 rounded-full bg-gray-200" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 w-3/4 rounded mb-2" />
        <div className="h-3 bg-gray-200 w-1/2 rounded" />
      </div>
    </div>
    <div className="h-3 bg-gray-200 w-1/3 rounded mb-2" />
    <div className="h-3 bg-gray-200 w-1/4 rounded" />
    <div className="flex justify-end gap-2 mt-4">
      <div className="h-8 w-20 bg-gray-200 rounded" />
      <div className="h-8 w-20 bg-gray-200 rounded" />
    </div>
  </div>
);

// Appointment card component
const AppointmentCard = ({ appt, onOpenReschedule, onStatusChange }) => {
  const patientName = appt.patient?.name || "Unknown Patient";
  const statusKey = appt.status || "unknown";
  const statusStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.unknown;

  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition flex flex-col">
      <header className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Avatar name={patientName} />
          <div>
            <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
              <UserCircle2 size={16} /> {patientName}
            </h3>
            <p className="text-sm text-gray-500">{appt.reason || "No reason provided"}</p>
            <p className="text-xs text-gray-400 mt-1">{appt.patient?.email || "No email"}</p>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
            aria-live="polite"
          >
            {statusKey}
          </span>
          <div className="text-gray-400 text-xs mt-2">{appt.patient?.phone || "Not provided"}</div>
        </div>
      </header>

      <div className="flex items-center justify-between mt-auto gap-3">
        <div>
          <p className="text-sm text-gray-600">
            <Clock className="inline-block mr-1" size={14} /> {formatTime(appt.time)}
          </p>
          <p className="text-sm text-gray-600">
            <CalendarDays className="inline-block mr-1" size={14} /> {formatDate(appt.date)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReschedule(appt)}
            className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-purple-700 transition flex items-center gap-1"
            aria-label={`Reschedule appointment for ${patientName}`}
          >
            <Edit size={14} /> Reschedule
          </button>

          {/* Conditional action buttons */}
          {appt.status === "pending" && (
            <button
              onClick={() => onStatusChange(appt.patient._id, "confirmed")}
              className="bg-sky-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-sky-700 transition"
            >
              Confirm
            </button>
          )}

          {appt.status === "confirmed" && (
            <button
              onClick={() => onStatusChange(appt.patient._id, "completed")}
              className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-green-700 transition"
            >
              Complete
            </button>
          )}

          {(appt.status === "pending" || appt.status === "confirmed") && (
            <button
              onClick={() => onStatusChange(appt.patient._id, "cancelled")}
              className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-red-700 transition"
            >
              Cancel
            </button>
          )}

          <button
            title="More"
            className="p-2 rounded-md hover:bg-gray-100 transition"
            aria-label={`More actions for ${patientName}`}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </article>
  );
};

// Accessible Modal (reschedule)
const RescheduleModal = ({ data, onClose, onChange, onSubmit }) => {
  // trap focus could be added later with focus-trap-react; keep lightweight for now
  if (!data.showModal) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 id="reschedule-title" className="text-lg font-semibold text-gray-800">
            Reschedule Appointment
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600"><strong>Patient:</strong> {data.patientName}</p>
          <p className="text-sm text-gray-600"><strong>Current:</strong> {formatDate(data.currentDate)} • {formatTime(data.currentTime)}</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
              <input
                type="date"
                value={data.newDate}
                onChange={(e) => onChange("newDate", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
              <input
                type="time"
                value={data.newTime}
                onChange={(e) => onChange("newTime", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 transition">
              Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rescheduleData, setRescheduleData] = useState({
    showModal: false,
    patientId: null,
    patientName: "",
    currentDate: "",
    currentTime: "",
    newDate: "",
    newTime: ""
  });

  // search & filter UI states
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onlyToday, setOnlyToday] = useState(true);

  // Axios instance (keeps same behavior)
  const api = axios.create({
    baseURL: "http://localhost:5000",
    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/doctor/appointments");
      if (response.data?.success) {
        setAppointments(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to load appointments");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // safe appointment check
  const isValidAppointment = (appt) => appt && appt.patient && appt.patient._id;

  // status change handler (optimistic UI)
  const handleStatusChange = async (patientId, newStatus) => {
    if (!patientId) {
      toast.error("Invalid patient data");
      return;
    }

    // optimistic UI: snapshot
    const snapshot = appointments;

    setAppointments(prev =>
      prev.map(appt => (appt.patient?._id === patientId ? { ...appt, status: newStatus } : appt))
    );

    try {
      const response = await api.patch(`/doctor/appointment/${patientId}/status`, { status: newStatus });
      if (!response.data?.success) {
        toast.error(response.data?.message || "Failed to update status");
        setAppointments(snapshot); // revert
      } else {
        toast.success(`Appointment marked ${newStatus}`);
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update status");
      setAppointments(snapshot); // revert
    }
  };

  // reschedule modal management
  const openRescheduleModal = (appt) => {
    if (!isValidAppointment(appt)) {
      toast.error("Invalid appointment data");
      return;
    }
    setRescheduleData({
      showModal: true,
      patientId: appt.patient._id,
      patientName: appt.patient?.name || "Unknown",
      currentDate: appt.date || "",
      currentTime: appt.time || "",
      newDate: appt.date || new Date().toISOString().split("T")[0],
      newTime: appt.time || "09:00"
    });
  };

  const closeRescheduleModal = () => {
    setRescheduleData({
      showModal: false,
      patientId: null,
      patientName: "",
      currentDate: "",
      currentTime: "",
      newDate: "",
      newTime: ""
    });
  };

  const handleRescheduleInputChange = (field, value) => {
    setRescheduleData(prev => ({ ...prev, [field]: value }));
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleData.newDate || !rescheduleData.newTime) {
      toast.error("Please select both date and time");
      return;
    }

    const snapshot = appointments;
    // update UI optimistically
    setAppointments(prev =>
      prev.map(appt =>
        appt.patient?._id === rescheduleData.patientId
          ? { ...appt, date: rescheduleData.newDate, time: rescheduleData.newTime }
          : appt
      )
    );

    try {
      const response = await api.patch(`/doctor/appointment/${rescheduleData.patientId}/reschedule`, {
        date: rescheduleData.newDate,
        time: rescheduleData.newTime
      });

      if (response.data?.success) {
        toast.success("Appointment rescheduled");
        closeRescheduleModal();
      } else {
        toast.error(response.data?.message || "Failed to reschedule");
        setAppointments(snapshot);
      }
    } catch (error) {
      console.error("Reschedule error:", error);
      toast.error("Failed to reschedule appointment");
      setAppointments(snapshot);
    }
  };

  // derived date & filters (memoized)
  const todayIso = new Date().toISOString().split("T")[0];

  const filteredAppointments = useMemo(() => {
    return (appointments || []).filter(appt => {
      if (!isValidAppointment(appt)) return false;

      if (onlyToday && appt.date !== todayIso) return false;

      if (statusFilter !== "all" && (appt.status || "unknown") !== statusFilter) return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        const name = (appt.patient?.name || "").toLowerCase();
        const reason = (appt.reason || "").toLowerCase();
        const email = (appt.patient?.email || "").toLowerCase();
        return name.includes(q) || reason.includes(q) || email.includes(q);
      }
      return true;
    });
  }, [appointments, query, statusFilter, onlyToday, todayIso]);

  const pendingCount = appointments.filter(a => a.status === "pending").length;
  const completedCount = appointments.filter(a => a.status === "completed").length;
  const todayCount = appointments.filter(a => a.date === todayIso).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-10 px-4 sm:px-8 lg:px-20">
      {/* Header */}
      <div className="mb-6 bg-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-sky-700">
            Welcome, Dr. {user?.name || "Doctor"} 👋
          </h1>
          <p className="text-gray-600 mt-1">Manage appointments & connect with patients.</p>
          <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
            <div className="inline-flex items-center gap-1">
              <Clock size={14} /> <span>{pendingCount} pending</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <CheckCircle size={14} /> <span>{completedCount} completed</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <CalendarDays size={14} /> <span>{todayCount} today</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchAppointments(); toast.success("Refreshed"); }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md flex items-center gap-2"
            aria-label="Refresh appointments"
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <button
            onClick={() => navigate("/all-appointments")}
            className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition flex items-center gap-2"
          >
            <CalendarDays size={16} /> All Appointments
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="relative md:col-span-1">
          <div className="absolute left-3 top-2.5 text-gray-400">
            <Search size={16} />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient, reason, or email..."
            className="pl-10 pr-3 py-2 w-full border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Search appointments"
          />
        </div>

        <div className="flex gap-3 items-center">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={onlyToday} onChange={(e) => setOnlyToday(e.target.checked)} className="form-checkbox" />
            Only Today
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 border border-gray-200 rounded-lg bg-white"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Showing <strong>{filteredAppointments.length}</strong> of <strong>{appointments.length}</strong></p>
        </div>
      </div>

      {/* Appointments grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <CalendarDays className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No appointments found.</p>
            <p className="text-gray-500 text-sm mt-2">Try clearing filters or click Refresh.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppointments.map((appt, idx) => (
              <AppointmentCard
                key={appt.appointmentId || appt.patient?._id || idx}
                appt={appt}
                onOpenReschedule={openRescheduleModal}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reschedule modal */}
      <RescheduleModal
        data={rescheduleData}
        onClose={closeRescheduleModal}
        onChange={handleRescheduleInputChange}
        onSubmit={handleReschedule}
      />
    </div>
  );
};

export default DoctorDashboard;
