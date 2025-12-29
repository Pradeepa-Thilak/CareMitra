// src/pages/Appointment.jsx
import React, { useState, useEffect } from "react";
import BookAppointmentModal from "../components/modals/BookAppointmentModal";
import { useAppointments } from "../contexts/AppointmentContext";
import { doctorAPI } from "../utils/api";
import { useAuth } from "../hooks/useAuth";

const Appointment = () => {
  const { bookAppointment } = useAppointments();
  const { user } = useAuth();
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call your backend API to get all doctors
        const response = await doctorAPI.getAllDoctors();
        
        if (response.data.success) {
          setDoctors(response.data.data || []);
        } else {
          setError(response.data.message || "Failed to load doctors");
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(err.response?.data?.message || "Failed to load doctors. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleOpen = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleClose = () => {
    setSelectedDoctor(null);
    setShowModal(false);
  };

  const handleConfirm = async (form) => {
    try {
      // Call your backend API to book appointment
      const response = await doctorAPI.bookAppointment({
        doctorId: selectedDoctor._id,
        date: form.date,
        time: form.time,
        reason: form.reason,
        consultationType: form.consultationType || "video" // Default to video if not specified
      });

      if (response.data.success) {
        setMessage(`Appointment booked with ${selectedDoctor.name} on ${form.date} at ${form.time}`);
        
        // Update local context if using
        if (bookAppointment) {
          bookAppointment({
            doctor: selectedDoctor,
            date: form.date,
            time: form.time,
            reason: form.reason,
            status: "confirmed",
            appointmentId: response.data.data?.appointmentId
          });
        }
      } else {
        setMessage(response.data.message || "Failed to book appointment");
      }
    } catch (err) {
      console.error("Error booking appointment:", err);
      setMessage(err.response?.data?.message || "Failed to book appointment. Please try again.");
    }
    
    setShowModal(false);

    // auto-clear message after 5 seconds
    setTimeout(() => setMessage(""), 5000);
  };

  // Calculate available slots based on doctor's schedule
  const getAvailableSlots = (doctor) => {
    // You can implement logic based on doctor's schedule
    // For now, return default slots
    return ["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"];
  };

  // Format doctor experience
  const formatExperience = (experience) => {
    if (!experience) return "Experience not specified";
    return `${experience} years experience`;
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-semibold mb-4">Book an Appointment</h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes("Failed") ? "bg-red-50 border border-red-200 text-red-800" : "bg-green-50 border border-green-200 text-green-800"}`}>
          {message}
        </div>
      )}

      <p className="text-sm text-gray-600 mb-6">
        {user ? `Welcome, ${user.name}! Choose a doctor and pick a suitable date & time.` : "Choose a doctor and pick a suitable date & time."}
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-4">
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-2 text-sky-600 hover:text-sky-800"
          >
            Retry
          </button>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
          No doctors available at the moment. Please check back later.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-300">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{doctor.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{doctor.specialization || doctor.specialist || "General Physician"}</p>
                  </div>
                  {doctor.isActive && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Available
                    </span>
                  )}
                </div>

                {/* Doctor details */}
                <div className="space-y-2 text-sm text-gray-600">
                  {doctor.hospital && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm3 1h6v4H7V5zm8 8v2h-2v-2h2zm-4 0v2h-2v-2h2z" clipRule="evenodd" />
                      </svg>
                      <span>{doctor.hospital}</span>
                    </div>
                  )}
                  
                  {doctor.experience && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>{formatExperience(doctor.experience)}</span>
                    </div>
                  )}
                  
                  {doctor.ratings && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{doctor.ratings} ★</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Available slots:</p>
                <div className="flex flex-wrap gap-2">
                  {getAvailableSlots(doctor).map((slot, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleOpen(doctor)}
                  className="flex-1 px-4 py-2 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                  Book Appointment
                </button>

                <button
                  onClick={() => {
                    // Navigate to doctor details page or show more info
                    setMessage(`Viewing details for ${doctor.name}`);
                  }}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedDoctor && (
        <BookAppointmentModal
          doctor={selectedDoctor}
          onClose={handleClose}
          onConfirm={handleConfirm}
          availableSlots={getAvailableSlots(selectedDoctor)}
        />
      )}

      {/* Statistics */}
      {doctors.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctor Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow-sm">
              <p className="text-sm text-gray-600">Total Doctors</p>
              <p className="text-2xl font-bold text-sky-600">{doctors.length}</p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm">
              <p className="text-sm text-gray-600">Available Now</p>
              <p className="text-2xl font-bold text-green-600">
                {doctors.filter(d => d.isActive).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm">
              <p className="text-sm text-gray-600">Specialties</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(doctors.map(d => d.specialization || d.specialist)).size}
              </p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm">
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <p className="text-2xl font-bold text-yellow-600">
                {doctors.filter(d => d.ratings).length > 0 
                  ? (doctors.reduce((sum, d) => sum + (d.ratings || 0), 0) / doctors.filter(d => d.ratings).length).toFixed(1)
                  : "N/A"
                } ★
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointment;