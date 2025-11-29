import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { toast } from "react-hot-toast";

const AllAppointments = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Axios instance
  const api = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const response = await api.get("/doctor/appointments");
      
      if (response.data.success) {
        setAppointments(response.data.data || []);
      } else {
        toast.error("Failed to load appointments");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  // Update appointment status
  const handleStatusChange = async (patientId, newStatus) => {
    try {
      const response = await api.patch(`/doctor/appointment/${patientId}/status`, { 
        status: newStatus 
      });
      
      if (response.data.success) {
        toast.success(`Marked as ${newStatus}`);
        
        // Update UI instantly
        setAppointments(prev =>
          prev.map(appt =>
            appt.patient._id === patientId ? { ...appt, status: newStatus } : appt
          )
        );
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading all appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-10 px-6 md:px-12 lg:px-20">
      {/* Header */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/doctor/dashboard")}
            className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-sky-700">
              All Appointments
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage all your appointments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <span className="text-gray-600">
            Total: {appointments.length} appointments
          </span>
          <button
            onClick={fetchAppointments}
            className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition flex items-center gap-2"
          >
            <CalendarDays size={18} /> Refresh
          </button>
        </div>
      </div>

      {/* All Appointments Table */}
      <section>
        {appointments.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <CalendarDays className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No appointments found.</p>
            <p className="text-gray-500 text-sm mt-2">
              You don't have any appointments scheduled.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appt, index) => (
                    <tr key={appt.appointmentId || appt.patient?._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appt.patient?.name || "Unknown Patient"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appt.patient?.email || "No email"}
                            </div>
                            <div className="text-sm text-gray-400">
                              {appt.patient?.phone || "No phone"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appt.date || "No date"}</div>
                        <div className="text-sm text-gray-500">{appt.time || "No time"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appt.reason || "No reason provided"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            appt.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appt.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : appt.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {appt.status || "unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {appt.status === "pending" && (
                            <button
                              onClick={() => handleStatusChange(appt.patient._id, "confirmed")}
                              className="bg-sky-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-sky-700 transition"
                            >
                              Confirm
                            </button>
                          )}
                          {appt.status === "confirmed" && (
                            <button
                              onClick={() => handleStatusChange(appt.patient._id, "completed")}
                              className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-green-700 transition"
                            >
                              Complete
                            </button>
                          )}
                          {(appt.status === "pending" || appt.status === "confirmed") && (
                            <button
                              onClick={() => handleStatusChange(appt.patient._id, "cancelled")}
                              className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-red-700 transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AllAppointments;