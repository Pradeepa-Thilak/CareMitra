import React from "react";
import { Stethoscope, Briefcase } from "lucide-react";

const DoctorCard = ({ doctor, onBook }) => (
  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
    <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
    <p className="text-sm text-gray-600">{doctor.specialty}</p>
    <p className="text-xs text-gray-500">{doctor.experience}</p>
    <button
      onClick={onBook}
      className="mt-3 bg-sky-600 text-white px-3 py-1 rounded-md text-sm hover:bg-sky-700 transition"
    >
      Book Appointment
    </button>
  </div>
);


export default DoctorCard;
 