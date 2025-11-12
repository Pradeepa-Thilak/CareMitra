import React from "react";
import { CalendarDays, CheckCircle, Clock } from "lucide-react";

const AppointmentCard = ({ appointment }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-sky-700">
        {appointment.doctor}
      </h3>
      <p className="text-gray-600 text-sm">{appointment.specialty}</p>

      <div className="flex items-center gap-2 mt-2 text-gray-700 text-sm">
        <CalendarDays size={16} /> {appointment.date}
      </div>
      <div className="flex items-center gap-2 mt-1 text-gray-700 text-sm">
        <Clock size={16} /> {appointment.time}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <CheckCircle
          size={16}
          className={
            appointment.status === "Confirmed"
              ? "text-green-600"
              : "text-yellow-500"
          }
        />
        <span
          className={`text-sm font-medium ${
            appointment.status === "Confirmed"
              ? "text-green-700"
              : "text-yellow-600"
          }`}
        >
          {appointment.status}
        </span>
      </div>
    </div>
  );
};

export default AppointmentCard;
