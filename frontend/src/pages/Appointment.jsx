// src/pages/Appointment.jsx
import React, { useState } from "react";
import BookAppointmentModal from "../components/modals/BookAppointmentModal";
import { useAppointments } from "../contexts/AppointmentContext";

// simple mock doctors list (replace with real doctor data when available)
const MOCK_DOCTORS = [
  { id: "d1", name: "Dr. Asha Kumar", specialist: "General Physician" },
  { id: "d2", name: "Dr. Ramesh Iyer", specialist: "Cardiologist" },
  { id: "d3", name: "Dr. Neha Singh", specialist: "Dermatologist" },
  { id: "d4", name: "Dr. Sanjay Rao", specialist: "Pediatrician" },
];

const Appointment = () => {
  const { bookAppointment } = useAppointments();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  const handleOpen = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleClose = () => {
    setSelectedDoctor(null);
    setShowModal(false);
  };

  const handleConfirm = (form) => {
    // form contains { doctor, date, time, reason } as we pass from modal
    const appt = bookAppointment({
      doctor: form.doctor,
      date: form.date,
      time: form.time,
      reason: form.reason,
      status: "confirmed", // for mock, mark as confirmed
    });

    setMessage(`Appointment booked with ${appt.doctor.name} on ${appt.date} at ${appt.time}`);
    setShowModal(false);

    // auto-clear message after a short time
    setTimeout(() => setMessage(""), 5000);
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-semibold mb-4">Book an Appointment</h1>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
          {message}
        </div>
      )}

      <p className="text-sm text-gray-600 mb-6">Choose a doctor and pick a suitable date & time.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_DOCTORS.map((doc) => (
          <div key={doc.id} className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-medium text-sky-700">{doc.name}</h3>
                <p className="text-sm text-gray-600">{doc.specialist}</p>
              </div>
              <div className="text-xs text-gray-400">ID: {doc.id}</div>
            </div>

            <p className="text-sm text-gray-500 mb-4">Available slots (mock): 10:00, 11:30, 15:00</p>

            <div className="flex gap-2">
              <button
                onClick={() => handleOpen(doc)}
                className="px-3 py-1 rounded-md bg-sky-600 text-white text-sm hover:bg-sky-700"
              >
                Book
              </button>

              <button
                onClick={() => setMessage(`Opening doctor profile for ${doc.name} (mock)`) }
                className="px-3 py-1 rounded-md border text-sm"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedDoctor && (
        <BookAppointmentModal
          doctor={selectedDoctor}
          onClose={handleClose}
          onConfirm={(payload) => {
            // modal sends {doctor, date, time, reason}
            handleConfirm(payload);
          }}
        />
      )}
    </div>
  );
};

export default Appointment;
