import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CalendarDays, CheckCircle, Clock, UserCircle2, Edit, X } from "lucide-react";
import { toast } from "react-hot-toast";

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
      console.log("Fetching appointments...");
      const response = await api.get("/doctor/appointments");
      console.log("Full API Response:", response.data);
      
      if (response.data.success) {
        const appointmentsData = response.data.data || [];
        console.log("Appointments data:", appointmentsData);
        
        // Log problematic appointments for debugging
        appointmentsData.forEach((appt, index) => {
          if (!appt.patient) {
            console.warn(`Appointment at index ${index} has no patient:`, appt);
          } else if (!appt.patient._id) {
            console.warn(`Appointment at index ${index} has patient but no _id:`, appt);
          }
        });
        
        setAppointments(appointmentsData);
      } else {
        toast.error("Failed to load appointments");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  // Safe appointment validation
  const isValidAppointment = (appt) => {
    return appt && appt.patient && appt.patient._id;
  };

  // Update appointment status
  const handleStatusChange = async (patientId, newStatus) => {
    // Add validation at the start
    if (!patientId) {
      toast.error("Invalid patient data");
      return;
    }
    
    try {
      console.log("Updating status for patient:", patientId, "to:", newStatus);
      const response = await api.patch(`/doctor/appointment/${patientId}/status`, { 
        status: newStatus 
      });
      
      console.log("Status update response:", response.data);
      
      if (response.data.success) {
        toast.success(`Appointment marked as ${newStatus}`);
        
        // Update UI instantly with safe access
        setAppointments(prev =>
          prev.map(appt =>
            (appt.patient?._id === patientId) ? { ...appt, status: newStatus } : appt
          )
        );
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      console.error("Error response:", error.response?.data);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  // Open reschedule modal
  const openRescheduleModal = (appt) => {
    if (!isValidAppointment(appt)) {
      toast.error("Invalid appointment data");
      return;
    }
    
    setRescheduleData({
      showModal: true,
      patientId: appt.patient._id,
      patientName: appt.patient?.name || "Unknown Patient",
      currentDate: appt.date || "",
      currentTime: appt.time || "",
      newDate: appt.date || "",
      newTime: appt.time || ""
    });
  };

  // Close reschedule modal
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

  // Handle reschedule form submit
  const handleReschedule = async (e) => {
    e.preventDefault();
    
    if (!rescheduleData.newDate || !rescheduleData.newTime) {
      toast.error("Please select both date and time");
      return;
    }

    try {
      console.log("Rescheduling appointment for patient:", rescheduleData.patientId);
      const response = await api.patch(`/doctor/appointment/${rescheduleData.patientId}/reschedule`, {
        date: rescheduleData.newDate,
        time: rescheduleData.newTime
      });
      
      console.log("Reschedule response:", response.data);
      
      if (response.data.success) {
        toast.success("Appointment rescheduled successfully");
        
        // Update UI instantly
        setAppointments(prev =>
          prev.map(appt =>
            appt.patient?._id === rescheduleData.patientId 
              ? { 
                  ...appt, 
                  date: rescheduleData.newDate, 
                  time: rescheduleData.newTime 
                } 
              : appt
          )
        );
        
        closeRescheduleModal();
      } else {
        toast.error(response.data.message || "Failed to reschedule appointment");
      }
    } catch (error) {
      console.error("Reschedule error:", error);
      console.error("Error response:", error.response?.data);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to reschedule appointment");
      }
    }
  };

  // Handle input changes for reschedule form
  const handleRescheduleInputChange = (field, value) => {
    setRescheduleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAppointments();
  }, []);

  // Filter & summary calculations with safe access
  const today = new Date().toISOString().split("T")[0];
  console.log("Today's date:", today);
  
  const todayAppointments = appointments.filter(a => a.date === today);
  const pendingCount = appointments.filter(a => a.status === "pending").length;
  const completedCount = appointments.filter(a => a.status === "completed").length;

  console.log("All appointments:", appointments);
  console.log("Today's appointments:", todayAppointments);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-10 px-6 md:px-12 lg:px-20">
      {/* Header */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-sky-700">
            Welcome, Dr. {user?.name || "Doctor"} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your appointments and connect with patients effectively.
          </p>
        </div>

        <button
          onClick={() => navigate("/all-appointments")}  
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
            <p className="text-sm text-gray-500">Today's Appointments</p>
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

      {/* Today's Appointments Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Today's Appointments ({todayAppointments.length})
          </h2>
          <button 
            onClick={fetchAppointments}
            className="bg-gray-600 text-white text-xs px-3 py-1.5 rounded hover:bg-gray-700 transition"
          >
            Refresh
          </button>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <CalendarDays className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No appointments scheduled for today.</p>
            <p className="text-gray-500 text-sm mt-2">
              You have {appointments.length} total appointments.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todayAppointments.map((appt, index) => {
              // Skip invalid appointments
              if (!isValidAppointment(appt)) {
                console.warn('Skipping invalid appointment:', appt);
                return null;
              }

              return (
                <div
                  key={appt.appointmentId || appt.patient._id || index}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <UserCircle2 size={18} /> 
                        {appt.patient?.name || "Unknown Patient"}
                      </h3>
                      <p className="text-gray-500 text-sm">{appt.reason || "No reason provided"}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {appt.patient?.email || "No email"}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Phone: {appt.patient?.phone || "Not provided"}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        appt.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : appt.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : appt.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {appt.status || "unknown"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <p className="font-medium">{appt.time || "No time"}</p>
                    <p className="font-medium">{appt.date || "No date"}</p>
                  </div>

                  <div className="flex justify-end gap-2">
                    {/* Reschedule Button */}
                    <button
                      onClick={() => openRescheduleModal(appt)}
                      className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-purple-700 transition flex items-center gap-1"
                    >
                      <Edit size={14} /> Reschedule
                    </button>

                    {/* Status Change Buttons with safe access */}
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Reschedule Modal */}
      {rescheduleData.showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Reschedule Appointment
              </h3>
              <button
                onClick={closeRescheduleModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Patient:</strong> {rescheduleData.patientName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Current Date:</strong> {rescheduleData.currentDate}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Current Time:</strong> {rescheduleData.currentTime}
              </p>
            </div>

            <form onSubmit={handleReschedule}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleData.newDate}
                    onChange={(e) => handleRescheduleInputChange('newDate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Time
                  </label>
                  <input
                    type="time"
                    value={rescheduleData.newTime}
                    onChange={(e) => handleRescheduleInputChange('newTime', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeRescheduleModal}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 transition"
                >
                  Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;