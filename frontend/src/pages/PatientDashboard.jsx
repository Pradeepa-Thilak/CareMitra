import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import AppointmentCard from "../components/user/AppoinmentCard";
import DoctorCard from "../components/user/DoctorCard";
import { CalendarDays, UserCircle2, Stethoscope } from "lucide-react";
import BookAppointmentModal from "../components/modals/BookAppointmentModal";
import { toast } from "react-hot-toast";

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🩺 Mock Appointments
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctor: "Dr. Priya Sharma",
      specialty: "Cardiologist",
      date: "2025-11-14",
      time: "10:30 AM",
      status: "Confirmed",
    },
    {
      id: 2,
      doctor: "Dr. Arun Kumar",
      specialty: "Dermatologist",
      date: "2025-11-20",
      time: "2:00 PM",
      status: "Pending",
    },
  ]);

  // 👩‍⚕️ Mock Doctors
  const [recommendedDoctors, setRecommendedDoctors] = useState([
    {
      id: 1,
      name: "Dr. Meena Raj",
      specialty: "Gynecologist",
      experience: "10 years",
    },
    {
      id: 2,
      name: "Dr. Rajesh Menon",
      specialty: "Orthopedic Surgeon",
      experience: "8 years",
    },
  ]);

  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 🩺 Open modal for specific doctor or general booking
const handleBookAppointment = (doctor = null) => {
  setSelectedDoctor(doctor);
};

// ✅ When user confirms appointment inside modal
const handleConfirmAppointment = (appointmentDetails) => {
  const newAppointment = {
    id: appointments.length + 1,
    doctor: appointmentDetails.doctor?.name || "General Consultation",
    specialty: appointmentDetails.doctor?.specialty || "General",
    date: appointmentDetails.date,
    time: appointmentDetails.time,
    status: "Pending",
  };

  setAppointments((prev) => [...prev, newAppointment]);
    toast.success(
        `Appointment booked with ${
        appointmentDetails.doctor?.name || "a Doctor"
        }`
    );
    setSelectedDoctor(null); // close modal
    };

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-10 px-6 md:px-12 lg:px-20">
      {/* 🩺 Welcome Section */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-sky-700">
            Welcome, {user?.name || "Patient"} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your appointments, connect with doctors, and stay healthy.
          </p>
        </div>

        <div className="flex space-x-3 mt-4 md:mt-0">
         <Link
            to = "/appointment"
            className="bg-sky-600 text-white px-5 py-2 rounded-lg hover:bg-sky-700 transition flex items-center gap-2"
            >
            <CalendarDays size={18} /> My Appointment
        </Link>

          <button
            onClick={() => navigate("/profile")}
            className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
          >
            <UserCircle2 size={18} /> View Profile
          </button>
        </div>
      </div>

      {/* 📅 Upcoming Appointments */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Upcoming Appointments
        </h2>

        {appointments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No upcoming appointments.</p>
        )}
      </section>

      {/* 👩‍⚕️ Recommended Doctors */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recommended Doctors
        </h2>

        {recommendedDoctors.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedDoctors.map((doc) => (
                <DoctorCard
                    key={doc.id}
                    doctor={doc}
                    onBook={() => handleBookAppointment(doc)} // ✅ Pass doctor to modal
                />
                ))}
            </div>
            ) : (
            <p className="text-gray-600 text-sm">No doctor suggestions available.</p>
        )}

      </section>
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
