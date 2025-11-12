import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { CalendarDays, UserCircle2, Stethoscope, Check, XCircle, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

const Appointment = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Mock data based on role
    if (user?.role === "doctor") {
      setAppointments([
        {
          id: 1,
          patientName: "Anitha M",
          date: "2025-11-14",
          time: "9:30 AM",
          reason: "Routine checkup",
          status: "Confirmed",
        },
        {
          id: 2,
          patientName: "Karthik R",
          date: "2025-11-17",
          time: "11:00 AM",
          reason: "Follow-up consultation",
          status: "Pending",
        },
      ]);
    } else if (user?.role === "patient") {
      setAppointments([
        {
          id: 1,
          doctorName: "Dr. Priya Sharma",
          specialization: "Cardiologist",
          date: "2025-11-20",
          time: "10:30 AM",
          status: "Confirmed",
        },
        {
          id: 2,
          doctorName: "Dr. Ramesh Kumar",
          specialization: "Dermatologist",
          date: "2025-11-25",
          time: "3:00 PM",
          status: "Pending",
        },
      ]);
    }
  }, [user]);

  const updateStatus = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id ? { ...appt, status: newStatus } : appt
      )
    );
    toast.success(`Appointment marked as ${newStatus}`);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-gray-500 text-lg">
        Please log in to view your appointments.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 md:px-12 lg:px-20">
      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sky-700 font-medium mb-6 hover:underline hover:text-sky-800 transition"
      >
        <ArrowLeft size={18} /> Back to {user.role === "doctor" ? "Dashboard" : "Dashboard"}
      </button>

      {/* 🩺 Page Header */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <CalendarDays className="text-sky-600" />
        {user.role === "doctor" ? "Patient Appointments" : "My Appointments"}
      </h1>

      {appointments.length === 0 ? (
        <p className="text-center text-gray-500 mt-20 text-sm">
          No appointments found.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-5"
            >
              {/* Common Details */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  {user.role === "doctor" ? (
                    <>
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <UserCircle2 size={18} /> {appt.patientName}
                      </h2>
                      <p className="text-gray-500 text-sm">{appt.reason}</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Stethoscope size={18} /> {appt.doctorName}
                      </h2>
                      <p className="text-gray-500 text-sm">
                        {appt.specialization}
                      </p>
                    </>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    appt.status === "Confirmed"
                      ? "bg-green-100 text-green-700"
                      : appt.status === "Completed"
                      ? "bg-blue-100 text-blue-700"
                      : appt.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {appt.status}
                </span>
              </div>

              {/* Date & Time */}
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <p>{appt.date}</p>
                <p>{appt.time}</p>
              </div>

              {/* Role-based Actions */}
              {user.role === "doctor" ? (
                <div className="flex justify-end gap-2">
                  {appt.status !== "Completed" && appt.status !== "Cancelled" && (
                    <button
                      onClick={() =>
                        updateStatus(
                          appt.id,
                          appt.status === "Pending"
                            ? "Confirmed"
                            : "Completed"
                        )
                      }
                      className="bg-sky-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-sky-700 transition flex items-center gap-1"
                    >
                      <Check size={14} />
                      {appt.status === "Pending"
                        ? "Confirm"
                        : "Mark Completed"}
                    </button>
                  )}
                  {appt.status !== "Cancelled" && (
                    <button
                      onClick={() => updateStatus(appt.id, "Cancelled")}
                      className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-md hover:bg-red-600 transition flex items-center gap-1"
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex justify-end">
                  {appt.status !== "Cancelled" && (
                    <button
                      onClick={() => updateStatus(appt.id, "Cancelled")}
                      className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-md hover:bg-red-600 transition flex items-center gap-1"
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointment;
