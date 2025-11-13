import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  UserCircle2,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Mock doctor appointments
    setAppointments([
      {
        id: 1,
        patientName: "Anitha M",
        date: "2025-11-12",
        time: "9:30 AM",
        reason: "Fever and body pain",
        status: "Pending",
      },
      {
        id: 2,
        patientName: "Karthik R",
        date: "2025-11-12",
        time: "11:00 AM",
        reason: "Routine checkup",
        status: "Confirmed",
      },
      {
        id: 3,
        patientName: "Suresh B",
        date: "2025-11-11",
        time: "4:00 PM",
        reason: "Follow-up consultation",
        status: "Completed",
      },
    ]);
  }, []);

  // Calculate summaries
  const today = "2025-11-12";
  const todayAppointments = appointments.filter((a) => a.date === today);
  const pendingCount = appointments.filter((a) => a.status === "Pending").length;
  const completedCount = appointments.filter((a) => a.status === "Completed").length;

  const handleStatusChange = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id ? { ...appt, status: newStatus } : appt
      )
    );
    toast.success(`Appointment marked as ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-10 px-6 md:px-12 lg:px-20">
      {/* Header */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-sky-700">
            Welcome, {user?.name || "Doctor"} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your appointments and connect with patients effectively.
          </p>
        </div>
        <button
          onClick={() => navigate("/appointment")}
          className="bg-sky-600 text-white px-5 py-2 rounded-lg hover:bg-sky-700 transition flex items-center gap-2 mt-4 md:mt-0"
        >
          <CalendarDays size={18} /> View All Appointments
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
          <Clock className="text-yellow-500" size={30} />
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <h3 className="text-2xl font-semibold">{pendingCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
          <CalendarDays className="text-sky-600" size={30} />
          <div>
            <p className="text-sm text-gray-500">My Appointments</p>
            <h3 className="text-2xl font-semibold">{todayAppointments.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
          <CheckCircle className="text-green-500" size={30} />
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <h3 className="text-2xl font-semibold">{completedCount}</h3>
          </div>
        </div>
      </div>

      {/* Today’s Appointments */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Today’s Appointments
        </h2>

        {todayAppointments.length === 0 ? (
          <p className="text-gray-600 text-sm">No appointments .</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todayAppointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <UserCircle2 size={18} /> {appt.patientName}
                    </h3>
                    <p className="text-gray-500 text-sm">{appt.reason}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      appt.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : appt.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <p>{appt.time}</p>
                  <p>{appt.date}</p>
                </div>

                <div className="flex justify-end gap-2">
                  {appt.status === "Pending" && (
                    <button
                      onClick={() => handleStatusChange(appt.id, "Confirmed")}
                      className="bg-sky-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-sky-700 transition"
                    >
                      Confirm
                    </button>
                  )}
                  {appt.status === "Confirmed" && (
                    <button
                      onClick={() => handleStatusChange(appt.id, "Completed")}
                      className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-green-700 transition"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DoctorDashboard;
