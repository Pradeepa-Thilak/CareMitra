import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { authAPI } from "../utils/api";
import { Mail, Lock, User, Phone, ArrowRight, Loader2, ShieldCheck, Heart } from "lucide-react";

const Signup = ({ closeModal, setMethod }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [stage, setStage] = useState(1);
  const [invalid, setInvalid] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  /* ------------------------- SEND OTP ------------------------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authAPI.sendSignupOtp(email);
      toast.success("OTP sent to your email!");
      setStage(2);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to send OTP. Try again.";
      toast.error(errorMsg);
      setInvalid(true);
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------- VERIFY OTP ------------------------- */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanedOtp = (otp || "").replace(/\D/g, "");
    if (cleanedOtp.length !== 6) {
      setInvalid(true);
      setMessage("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setInvalid(false);
      setMessage("");

      await authAPI.verifyOtp(email, cleanedOtp);
      toast.success("OTP verified!");
      setStage(3);
    } catch (err) {
      const serverMsg = err?.response?.data?.message || "Invalid or expired OTP";
      setInvalid(true);
      setMessage(serverMsg);
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------- COMPLETE SIGNUP ------------------------- */
  const handleCompleteSignup = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.completeSignup({
        email,
        name: formData.name,
        phone: formData.phone,
      });

      const { token, user } = res.data;
      login(user, token);
      toast.success("Welcome to CareMitra! 🎉");

      // Role-based navigation
      if (user.role === "doctor") {
        navigate("/doctor/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "labstaff") {
        navigate("/labstaff/dashboard");
      } else {
        navigate("/");
      }

      closeModal?.();
    } catch (err) {
      const serverMsg = err?.response?.data?.message || "Signup failed";
      toast.error(serverMsg);
      setInvalid(true);
      setMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <Heart className="w-8 h-8 text-white" fill="currentColor" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-gray-600">
            {stage === 1
              ? "Join CareMitra to get started"
              : stage === 2
              ? "Enter the OTP sent to your email"
              : "Complete your profile"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Progress Indicator */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-4">
            <div className="flex items-center justify-between text-white text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    stage >= 1 ? "bg-white text-sky-600" : "bg-sky-400 text-white"
                  }`}
                >
                  1
                </div>
                <span className="font-medium hidden sm:inline">Email</span>
              </div>
              <div className="flex-1 h-1 bg-sky-400 mx-2 sm:mx-3 rounded-full">
                <div
                  className={`h-full bg-white rounded-full transition-all duration-300 ${
                    stage >= 2 ? "w-1/2" : "w-0"
                  } ${stage >= 3 ? "w-full" : ""}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    stage >= 2 ? "bg-white text-sky-600" : "bg-sky-400 text-white"
                  }`}
                >
                  2
                </div>
                <span className="font-medium hidden sm:inline">Verify</span>
              </div>
              <div className="flex-1 h-1 bg-sky-400 mx-2 sm:mx-3 rounded-full">
                <div
                  className={`h-full bg-white rounded-full transition-all duration-300 ${
                    stage >= 3 ? "w-full" : "w-0"
                  }`}
                />
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    stage >= 3 ? "bg-white text-sky-600" : "bg-sky-400 text-white"
                  }`}
                >
                  3
                </div>
                <span className="font-medium hidden sm:inline">Profile</span>
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setInvalid(false);
                        setMessage("");
                      }}
                      required
                      placeholder="you@example.com"
                      className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  {invalid && message && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="font-medium">⚠</span> {message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
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
            ) : stage === 2 ? (
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
                        setOtp(e.target.value);
                        setInvalid(false);
                        setMessage("");
                      }}
                      required
                      placeholder="000000"
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
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
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
                  disabled={loading}
                  className="w-full text-sm text-sky-600 font-medium hover:text-sky-700 transition-colors disabled:opacity-50"
                >
                  Didn't receive OTP? Resend
                </button>
              </form>
            ) : (
              /* STAGE 3: PROFILE COMPLETION */
              <form onSubmit={handleCompleteSignup} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      placeholder="John Doe"
                      className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                      className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                {invalid && message && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="font-medium">⚠</span> {message}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStage(2);
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
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Complete Signup
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => setMethod(true)}
                className="text-sky-600 font-semibold hover:text-sky-700 hover:underline transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Secure Signup</span>
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

export default Signup;