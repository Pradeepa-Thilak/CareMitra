// src/components/forms/DoctorRegistrationForm.jsx
import React, { useState } from "react";
import { doctorAPI } from "../../utils/api";
import { CheckCircle } from "lucide-react";

export default function DoctorRegistrationForm() {
  const [form, setForm] = useState({
    name: "",
    gender: "",
    specialization: "",
    phone: "",
    email: "",
    medicalLicenseNumber: "",
    yearOfRegistration: "",
  });

  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ---------------- VALIDATION ---------------------
  const validate = () => {
    const e = {};

    if (!form.name.trim()) e.name = "Name is required";

    if (!form.specialization.trim()) e.specialization = "specialization is required";

    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email";

    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
      e.phone = "Enter a valid 10-digit phone number";

    // license format
    if (!form.medicalLicenseNumber.trim())
      e.medicalLicenseNumber = "Medical License Number is required";
    else if (!/^[A-Za-z]{2,5}[0-9]{4,10}$/.test(form.medicalLicenseNumber))
      e.medicalLicenseNumber = "Enter a valid Medical License Number";

    // year
    if (!form.yearOfRegistration.trim())
      e.yearOfRegistration = "Year Of Completion is required";
    else if (!/^\d{4}$/.test(form.yearOfRegistration))
      e.yearOfRegistration = "Enter a valid year (e.g., 2005)";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // ---------------- SUBMIT ---------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await doctorAPI.register(form);

      if (res.data.success) {
        setShowSuccessModal(true);
        setForm({
          name: "",
          gender: "",
          specialization: "",
          phone: "",
          email: "",
          medicalLicenseNumber: "",
          yearOfRegistration: "",
      })
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ---------------- MAIN UI ---------------------
  return (
    <div className="min-h-screen w-full bg-gray-50 py-16 px-6">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Join CareMitra as a Doctor
        </h1>
        <p className="text-lg text-gray-600">
          Get verified and offer online consultations to patients across India.
        </p>
      </div>

      {/* FORM */}
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">
          Registration Form
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* NAME */}
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Full Name *</label>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-300"
                placeholder="Dr. John Michael"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* specialization */}
            <div>
              <label className="block mb-1 font-medium">Specialization *</label>
              <input
                value={form.specialization}
                onChange={(e) => handleChange("specialization", e.target.value)}
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-300"
                placeholder="Cardiologist"
              />
              {errors.specialization && (
                <p className="text-sm text-red-500 mt-1">{errors.specialization}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-1 font-medium">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            {/* phone */}
            <div>
              <label className="block mb-1 font-medium">Phone (optional)</label>
              <input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-300"
                placeholder="9876543210"
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 font-medium">Email *</label>
              <input
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-300"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* License */}
            <div>
              <label className="block mb-1 font-medium">Medical License Number *</label>
              <input
                value={form.medicalLicenseNumber}
                onChange={(e) => handleChange("medicalLicenseNumber", e.target.value)}
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-300"
                placeholder="TNMC12345"
              />
              {errors.medicalLicenseNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.medicalLicenseNumber}</p>
              )}
            </div>

            {/* yearOfRegistration */}
            <div>
              <label className="block mb-1 font-medium">Year Of Completion *</label>
              <input
                value={form.yearOfRegistration}
                onChange={(e) => handleChange("yearOfRegistration", e.target.value)}
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-300"
                placeholder="2001"
              />
              {errors.yearOfRegistration && (
                <p className="text-sm text-red-500 mt-1">{errors.yearOfRegistration}</p>
              )}
            </div>
          </div>

          <div className="text-right mt-10">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl shadow hover:bg-indigo-700"
            >
              Submit Registration
            </button>
          </div>
        </form>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">

            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={50} className="text-green-600" />
            </div>

            <h2 className="text-3xl font-semibold mb-2">Registration Complete</h2>
            <p className="text-gray-600 mb-6">
              We will review your details and contact you within 48 hours.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-green-600 text-white px-8 py-3 rounded-xl shadow hover:bg-green-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
