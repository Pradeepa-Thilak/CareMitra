import React from "react";
import { CheckCircle } from "lucide-react";

const SuccessModal = ({ message, onClose }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg w-[300px] sm:w-[360px] p-6 text-center animate-fadeInSoft">
      {/* ✅ Green tick */}
      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />

      {/* ✅ Title */}
      <h2 className="text-lg font-semibold text-gray-800 mb-1">
        {message || "Signup Successful!"}
      </h2>

      {/* ✅ Description */}
      <p className="text-sm text-gray-600 mb-6">
        Your account has been created successfully.
      </p>

      {/* ✅ Continue button */}
      <button
        onClick={onClose}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-1.5 rounded-md text-sm font-medium transition duration-200"
      >
        Continue
      </button>
    </div>
  );
};

export default SuccessModal;
