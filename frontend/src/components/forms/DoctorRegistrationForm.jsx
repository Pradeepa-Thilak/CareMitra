// src/components/forms/DoctorRegistrationForm.jsx
import React, { useEffect, useRef, useState } from "react";
import { Mail, X, CheckCircle, RefreshCcw, User, Phone, Briefcase } from "lucide-react";

export default function DoctorRegistrationForm({ onSuccess }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    speciality: "",
    mobile: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [mockOtp, setMockOtp] = useState(null);
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputsRef = useRef([]);

  // ---------------- VALIDATION ---------------------
  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.speciality.trim()) e.speciality = "Speciality is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";

    if (form.mobile && !/^[6-9]\d{9}$/.test(form.mobile))
      e.mobile = "Enter a valid 10-digit mobile number";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  // ---------------- OTP SEND (Mock) ---------------------
  const sendOtp = async () => {
    if (!validate()) return;
    setIsSending(true);

    try {
      const generated = String(Math.floor(100000 + Math.random() * 900000));
      setMockOtp(generated);
      setShowOTPModal(true);
      setOtpInputs(["", "", "", "", "", ""]);
      setResendCooldown(30);

      console.log("MOCK OTP →", form.email, generated);

      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    } finally {
      setIsSending(false);
    }
  };

  // ---------------- OTP RESEND ---------------------
  const resendOtp = () => {
    const generated = String(Math.floor(100000 + Math.random() * 900000));
    setMockOtp(generated);
    setResendCooldown(30);
    setOtpInputs(["", "", "", "", "", ""]);
    console.log("RESENT MOCK OTP →", form.email, generated);
  };

  // resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // ---------------- OTP INPUT LOGIC ---------------------
  const handleOtpChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;

    const next = [...otpInputs];
    next[i] = v;
    setOtpInputs(next);

    if (v && i < 5) otpInputsRef.current[i + 1]?.focus();
    if (!v && i > 0) otpInputsRef.current[i - 1]?.focus();
  };

  // ---------------- VERIFY OTP ---------------------
  const verifyOtp = async () => {
    setIsVerifying(true);
    const entered = otpInputs.join("");

    if (entered === mockOtp) {
      setShowOTPModal(false);
      setShowSuccessModal(true);
      if (onSuccess) onSuccess(form);
    } else {
      alert("Incorrect OTP. Try again.");
    }

    setIsVerifying(false);
  };

  // ---------------- MASK EMAIL ---------------------
  const maskedEmail = (email) => {
    if (!email) return "";
    const [user, domain] = email.split("@");
    return `${user[0]}***${user[user.length - 1]}@${domain}`;
  };

  // ---------------- MAIN UI ---------------------
  return (
    <div className="min-h-screen w-full bg-gray-50 py-16 px-6">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Join CareMitra as a Doctor</h1>
        <p className="text-lg text-gray-600">
          Get verified and offer online consultations to patients across India.
        </p>
      </div>

      {/* FORM CONTAINER */}
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">Registration Form</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* First Name */}
          <div>
            <label className="block mb-1 font-medium">First Name *</label>
            <input
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-300"
              placeholder="John"
            />
            {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className="block mb-1 font-medium">Last Name *</label>
            <input
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-300"
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
          </div>

          {/* Speciality */}
          <div>
            <label className="block mb-1 font-medium">Speciality *</label>
            <input
              value={form.speciality}
              onChange={(e) => handleChange("speciality", e.target.value)}
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-300"
              placeholder="General Physician"
            />
            {errors.speciality && <p className="text-sm text-red-500 mt-1">{errors.speciality}</p>}
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

          {/* Mobile */}
          <div>
            <label className="block mb-1 font-medium">Mobile (optional)</label>
            <input
              value={form.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-300"
              placeholder="9876543210"
            />
            {errors.mobile && <p className="text-sm text-red-500 mt-1">{errors.mobile}</p>}
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
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

        </div>

        <div className="text-right mt-10">
          <button
            onClick={sendOtp}
            disabled={isSending}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl shadow hover:bg-indigo-700 transition"
          >
            {isSending ? "Sending OTP..." : "Continue to Verification"}
          </button>
        </div>
      </div>

      {/* ---------------- OTP MODAL ---------------- */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl relative">

            <button onClick={() => setShowOTPModal(false)} className="absolute top-5 right-5">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-semibold mb-2">Email Verification</h2>
            <p className="text-gray-600 mb-6">
              Enter the 6-digit OTP sent to <strong>{maskedEmail(form.email)}</strong>
            </p>

            <div className="flex justify-center gap-3 mb-6">
              {otpInputs.map((v, i) => (
                <input
                  key={i}
                  maxLength={1}
                  value={v}
                  ref={(el) => (otpInputsRef.current[i] = el)}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-14 h-14 text-xl text-center border rounded-xl focus:ring-2 focus:ring-indigo-400"
                />
              ))}
            </div>

            <div className="text-center text-sm text-gray-500 mb-4">
              {resendCooldown > 0 ? (
                <>Resend OTP in {resendCooldown}s</>
              ) : (
                <button className="text-indigo-600 underline" onClick={resendOtp}>
                  Resend OTP
                </button>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={verifyOtp}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUCCESS MODAL ---------------- */}
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
