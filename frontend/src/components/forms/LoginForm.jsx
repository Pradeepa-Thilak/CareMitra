import React, { useRef, useEffect } from "react";
import { Mail } from "lucide-react";

const LoginForm = ({
  email,
  otp,
  setEmail,
  setOtp,
  stage,
  invalid,
  message,
  loading,
  handleSendOtp,
  handleVerifyOtp,
}) => {
  const otpRefs = useRef([]);

  useEffect(() => {
    if (stage === 2) otpRefs.current[0]?.focus();
  }, [stage]);

  const handleOtpInput = (val, index) => {
    const digit = val.replace(/\D/g, "");
    const arr = otp.split("");
    arr[index] = digit;
    setOtp(arr.join(""));
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  return (
    <div className="w-full bg-white">
      <div className="rounded-lg border border-gray-100 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">
          {stage === 1 ? "Login" : "Verify OTP"}
        </h2>
        <p className="text-sm text-gray-500">
          {stage === 1
            ? "Enter your email to receive a secure OTP."
            : `We sent a 6-digit code to ${email}`}
        </p>

        {/* EMAIL FORM */}
        {stage === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Email</label>

              <div className="flex items-center gap-2 border border-gray-100 rounded-lg px-3 py-2">
                <Mail size={18} className="text-gray-400" />
                <input
                  type="email"
                  className="flex-1 outline-none text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {invalid && <p className="text-xs text-red-600 mt-2">{message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* OTP FORM */}
        {stage === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 mt-5">
            <div className="flex justify-center gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  maxLength="1"
                  className="w-12 h-12 text-center text-lg border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100"
                  value={otp[i] || ""}
                  onChange={(e) => handleOtpInput(e.target.value, i)}
                />
              ))}
            </div>

            {invalid && (
              <p className="text-xs text-red-600 text-center">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              {loading ? "Verifying..." : "Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
