import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { authAPI } from "../utils/api";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Heart,
} from "lucide-react";

const Login = ({ closeModal, setMethod }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState(1);
  const [invalid, setInvalid] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* ------------------------- SEND OTP ------------------------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email || !isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await authAPI.sendLoginOtp(email.trim());
      toast.success("OTP sent to your email!");
      setStage(2);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to send OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------- VERIFY OTP ------------------------- */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setInvalid(true);
      setMessage("OTP must be exactly 6 digits");
      return;
    }

    try {
      setLoading(true);
      setInvalid(false);
      setMessage("");

      const res = await authAPI.verifyOtp(email.trim(), otp);
      const { success, message, token, role, user } = res.data;

      if (!success) {
        throw new Error(message || "Invalid OTP");
      }

      login(user, token);
      toast.success("Welcome back! 🎉");

      navigate(
        role === "doctor"
          ? "/doctor/dashboard"
          : role === "admin"
          ? "/admin/dashboard"
          : role === "labstaff"
          ? "/labstaff/dashboard"
          : "/"
      );

      closeModal?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid or expired OTP";

      setInvalid(true);
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-sky-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-linear-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <Heart className="w-8 h-8 text-white" fill="currentColor" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">
            {stage === 1
              ? "Sign in to access your CareMitra account"
              : "Enter the OTP sent to your email"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Progress Indicator */}
          <div className="bg-linear-to-r from-sky-500 to-blue-600 p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    stage >= 1
                      ? "bg-white text-sky-600"
                      : "bg-sky-400 text-white"
                  }`}
                >
                  1
                </div>
                <span className="text-sm font-medium">Email</span>
              </div>
              <div className="flex-1 h-1 bg-sky-400 mx-3 rounded-full">
                <div
                  className={`h-full bg-white rounded-full transition-all duration-300 ${
                    stage >= 2 ? "w-full" : "w-0"
                  }`}
                />
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    stage >= 2
                      ? "bg-white text-sky-600"
                      : "bg-sky-400 text-white"
                  }`}
                >
                  2
                </div>
                <span className="text-sm font-medium">Verify</span>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {stage === 1 ? (
              /* STAGE 1: EMAIL INPUT */
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-sky-500 to-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STAGE 2: OTP INPUT */
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Enter OTP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setOtp(value);
                        setInvalid(false);
                        setMessage("");
                      }}
                      maxLength={6}
                      className={`block w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 transition-all text-gray-900 placeholder-gray-400 text-center text-xl tracking-[0.5em] font-mono ${
                        invalid
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-200 focus:ring-sky-500 focus:border-sky-500"
                      }`}
                    />
                  </div>
                  {invalid && message && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="font-medium">⚠</span> {message}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    OTP sent to{" "}
                    <span className="font-medium text-gray-700">{email}</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStage(1);
                      setOtp("");
                      setInvalid(false);
                      setMessage("");
                    }}
                    className="flex-1 py-3.5 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-sky-500 to-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify
                        <ShieldCheck className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || !isValidEmail(email)}
                  className="w-full text-sm text-sky-600 font-medium disabled:opacity-50"
                >
                  Didn't receive OTP? Resend
                </button>
              </form>
            )}
          </div>

          {/* Footer - UPDATED TO TOGGLE */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              New to CareMitra?{" "}
              <button
                onClick={() => setMethod(false)}
                className="text-sky-600 font-semibold hover:text-sky-700 hover:underline transition-colors"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Secure Login</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-sky-600" fill="currentColor" />
            <span>HIPAA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
