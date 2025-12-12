import React, { useEffect, useRef } from "react";

const SignupForm = ({
  email,
  otp,
  formData,
  setEmail,
  setOtp,
  setFormData,
  stage,
  setStage,
  invalid,
  message,
  handleSendOtp,
  handleVerifyOtp,
  handleCompleteSignup,
  loading,
}) => {
  const otpRefs = useRef([]);

  useEffect(() => {
    if (stage === 2) otpRefs.current[0]?.focus();
  }, [stage]);

  // SPA-friendly "Edit" handler used in stage 2
  const handleEditEmail = () => {
    setStage(1);
    setOtp("");
  };

  return (
    <div className="bg-white w-full max-w-md rounded-xl shadow-md border border-gray-200 p-6">
      {/* Stage 1 — Email Input */}
      {stage === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Create account</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your email to receive a verification code
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-100 outline-none"
              required
            />
            {invalid && (
              <p className="text-xs text-red-600 mt-2 text-center">{message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 text-sm text-white rounded-md font-semibold ${
              loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* Stage 2 — OTP Verification */}
      {stage === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Verify OTP</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter the code sent to{" "}
              <span className="font-medium text-gray-700">{email}</span>{" "}
              <button
                type="button"
                onClick={handleEditEmail}
                className="text-indigo-600 font-medium ml-2 hover:underline"
              >
                Edit
              </button>
            </p>
          </div>

          <div className="flex gap-3 justify-center">
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
                className="w-12 h-12 text-center border border-gray-300 rounded-md text-lg focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            ))}
          </div>

          {invalid && (
            <p className="text-xs text-red-600 text-center mt-1">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 text-sm text-white rounded-md font-semibold ${
              loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {/* Stage 3 — User Details*/}
      {stage === 3 && (
        <form onSubmit={handleCompleteSignup} className="space-y-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Complete profile</h1>
            <p className="text-sm text-gray-500 mt-1">Fill in your details to finish signing up</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-100 outline-none"
              required
            />
          </div>

          {/* Phone number */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              maxLength="10"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g,"") })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-100 outline-none"
              required
            />
          </div>

          {formData.phone?.length > 10 && formData.phone?.length < 10 && (
            <p className="text-xs text-red-500 mt-1">
              Phone number must be 10 digits
            </p>
          ) }

          {invalid && (
            <p className="text-xs text-red-600 text-center mt-1">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 text-sm text-white rounded-md font-semibold ${
              loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Creating..." : "Complete signup"}
          </button>
        </form>
      )}
    </div>
  );
};

export default SignupForm;
