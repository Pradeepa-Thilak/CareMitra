import React, { useState } from "react";
import { X } from "lucide-react";

const BookAppointmentModal = ({ doctor, onClose, onConfirm }) => {
  const [form, setForm] = useState({
    date: "",
    time: "",
    reason: "",
  });

  if (!doctor) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 transition-all duration-300">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative transform transition-all duration-300 scale-100 hover:scale-[1.01]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        {/* Doctor Info */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Book Appointment with {doctor.name}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm({ doctor, ...form });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Appointment Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-sky-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Time Slot
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-sky-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Reason / Symptoms
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows="3"
              placeholder="Describe your issue"
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-sky-500 outline-none resize-none"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 text-white py-2 rounded-md font-medium text-sm hover:bg-sky-700 transition"
          >
            Confirm Appointment
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
