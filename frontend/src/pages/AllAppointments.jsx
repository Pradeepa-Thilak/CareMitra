// src/pages/AllAppointments.jsx
import React from "react";
import AppointmentCard from "../components/user/AppoinmentCard"; // note: your file name is AppoinmentCard.jsx
import { useAppointments } from "../contexts/AppointmentContext";

const AllAppointments = () => {
  const { appointments, loading, cancelAppointment } = useAppointments();

  if (loading) {
    return (
      <div className="container-custom py-8">
        <p>Loading appointments…</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-semibold mb-4">My Appointments</h1>

      {appointments.length === 0 ? (
        <div className="p-6 bg-white rounded shadow-sm">
          <p className="text-gray-600">No appointments yet. Book your first appointment from the <strong>Book Appointment</strong> page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="space-y-2">
              <AppointmentCard appointment={appt} />
              <div className="flex items-center gap-2">
                {appt.status !== "cancelled" && appt.status !== "completed" && (
                  <button
                    onClick={() => cancelAppointment(appt.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Cancel
                  </button>
                )}
                <span className="text-xs text-gray-400">Created: {new Date(appt.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllAppointments;
