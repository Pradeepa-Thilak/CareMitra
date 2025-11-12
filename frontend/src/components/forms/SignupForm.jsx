import React, { useEffect, useRef } from "react";

const SignupForm = ({
  email,
  otp,
  formData,
  setEmail,
  setOtp,
  setFormData,
  invalid,
  message,
  stage,
  handleSendOtp,
  handleVerifyOtp,
  handleCompleteSignup,
  loading,
}) => {
  const otpRefs = useRef([]);

  useEffect(() => {
    if (stage === 2) otpRefs.current[0]?.focus();
  }, [stage]);

  return (
    <div className="bg-white w-full max-w-sm rounded-xl shadow-md border border-gray-200 p-6">
      {/* 🔹 Stage 1 — Email Input */}
      {stage === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Sign Up</h1>
            <p className="text-xs text-gray-600 mt-1">
              Enter your email to receive a verification code
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
              required
            />
            {invalid && (
              <p className="text-xs text-red-600 mt-1 text-center">{message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-1.5 text-sm text-white rounded-md font-semibold ${
              loading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 transition"
            }`}
          >
            {loading ? "Sending..." : "SEND OTP"}
          </button>
        </form>
      )}

      {/* 🔹 Stage 2 — OTP Verification */}
      {stage === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Verify OTP</h1>
            <p className="text-xs text-gray-600 mt-1">
              Enter the code sent to{" "}
              <span className="font-semibold">{email}</span>{" "}
              <span
                onClick={() => window.location.reload()}
                className="text-red-600 font-semibold cursor-pointer hover:underline"
              >
                Edit
              </span>
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                type="text"
                maxLength="1"
                value={otp[i] || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/, "");
                  const newOtp = otp.split("");
                  newOtp[i] = val;
                  setOtp(newOtp.join(""));
                  if (val && i < 5) otpRefs.current[i + 1]?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[i] && i > 0) {
                    otpRefs.current[i - 1]?.focus();
                  }
                }}
                className="w-8 h-10 text-center border border-gray-300 rounded-md text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
              />
            ))}
          </div>

          {invalid && (
            <p className="text-xs text-red-600 text-center mt-1">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-1.5 text-sm text-white rounded-md font-semibold ${
              loading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 transition"
            }`}
          >
            {loading ? "Verifying..." : "VERIFY OTP"}
          </button>
        </form>
      )}

      {/* 🔹 Stage 3 — User Details + Role Selection */}
      {stage === 3 && (
        <form onSubmit={handleCompleteSignup} className="space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Complete Your Profile
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Fill in your details to finish signing up
            </p>
          </div>

          {/* 🔸 Name */}
          <div>
            <label className="block text-xs text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your full name"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
              required
            />
          </div>

          {/* 🔸 Role Selection */}
          <div>
            <label className="block text-xs text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
              required
            >
              <option value="">Select your role</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {invalid && (
            <p className="text-xs text-red-600 text-center mt-1">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-1.5 text-sm text-white rounded-md font-semibold ${
              loading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 transition"
            }`}
          >
            {loading ? "Creating..." : "COMPLETE SIGNUP"}
          </button>
        </form>
      )}
    </div>
  );
};

export default SignupForm;
