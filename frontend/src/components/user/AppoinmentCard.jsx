import React from "react";
import { CalendarDays, CheckCircle, Clock, Stethoscope } from "lucide-react";

const AppointmentCard = ({ appointment }) => {
  // The doctor object comes from the backend directly
  const doctor = appointment.doctor;

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-all">
      
      {/* Doctor Info */}
      <div className="flex items-center gap-3 mb-3">
        <Stethoscope className="text-sky-600" size={20} />
        <div>
          <h3 className="text-lg font-semibold text-sky-700">
            {doctor?.name || "Unknown Doctor"}
          </h3>
          <p className="text-gray-600 text-sm">
            {doctor?.specialist || "General"}
          </p>
        </div>
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 mt-2 text-gray-700 text-sm">
        <CalendarDays size={16} />
        <span>{appointment.date}</span>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 mt-1 text-gray-700 text-sm">
        <Clock size={16} />
        <span>{appointment.time}</span>
      </div>

      {/* Status */}
      <div className="mt-4 flex items-center gap-2">
        <CheckCircle
          size={16}
          className={
            appointment.status?.toLowerCase() === "confirmed"
              ? "text-green-600"
              : "text-yellow-500"
          }
        />
        <span
          className={`text-sm font-medium ${
            appointment.status?.toLowerCase() === "confirmed"
              ? "text-green-700"
              : "text-yellow-600"
          }`}
        >
          {appointment.status
            ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
            : "Pending"}
        </span>
      </div>
    </div>
  );
};

export default AppointmentCard;
