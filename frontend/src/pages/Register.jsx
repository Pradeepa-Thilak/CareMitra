import React, { useState, useRef, useEffect } from "react";
import SuccessModal from "../components/SuccessModal";
import { otpSignupAPI } from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Signup = ({ setMethod, closeModal, onSignupSuccess }) => {
  const [stage, setStage] = useState(1);
  const [formData, setFormData] = useState({
    mobile: "",
    otp: "",
    email: "",
  });
  const [invalid, setInvalid] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Access AuthContext

  // Focus first OTP box automatically
  useEffect(() => {
    if (stage === 2) otpRefs.current[0]?.focus();
  }, [stage]);

  // ✅ STEP 1 — Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setInvalid(false);
    setMessage("");

    if (formData.mobile.length !== 10 || isNaN(Number(formData.mobile))) {
      setInvalid(true);
      setMessage("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      const res = await otpSignupAPI.sendOtp(formData.mobile);
      toast.success("OTP sent successfully!");
      console.log("Send OTP Response:", res.data);
      setStage(2);
    } catch (error) {
      console.error(error);
      setInvalid(true);
      setMessage(error.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ STEP 2 — Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setInvalid(false);
    setMessage("");

    if (formData.otp.length !== 6) {
      setInvalid(true);
      setMessage("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      const res = await otpSignupAPI.verifyOtp(formData.mobile, formData.otp);
      toast.success("OTP verified successfully!");
      console.log("Verify OTP Response:", res.data);
      setStage(3);
    } catch (error) {
      console.error(error);
      setInvalid(true);
      setMessage(error.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ STEP 3 — Complete Signup + Auto-login
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    setInvalid(false);
    setMessage("");

    if (!formData.email.includes("@")) {
      setInvalid(true);
      setMessage("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const res = await otpSignupAPI.completeSignup({
        mobile: formData.mobile,
        email: formData.email,
      });

      console.log("Signup Complete Response:", res.data);

      // ✅ If backend sends token + user, auto-login
      if (res.data.token && res.data.user) {
        login(res.data.user, res.data.token);
        toast.success("Signup successful! Logging you in...");
      }

      setShowSuccess(true);
      onSignupSuccess(true);

      // Delay redirect slightly for animation
      setTimeout(() => {
        closeModal();
        navigate("/"); // Redirect to Home
      }, 2000);
    } catch (error) {
      console.error(error);
      setInvalid(true);
      setMessage(error.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Success Modal
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // ✅ UI
  return (
    <>
      {!showSuccess ? (
        <div className="w-full flex justify-center items-center">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-md border border-gray-200 p-6">
            
            {/* 🔹 Stage 1 — Mobile Number */}
            {stage === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Sign Up</h1>
                  <p className="text-xs text-gray-600 mt-1">
                    Enter your mobile number to continue
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="flex w-64 mx-auto">
                    <span className="inline-flex items-center px-2 border border-r-0 border-gray-300 bg-gray-100 text-gray-700 rounded-l-md text-sm">
                      +91
                    </span>
                    <input
                      type="text"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                      maxLength="10"
                      placeholder="10-digit number"
                      className="flex-1 px-2 py-1.5 text-sm border rounded-r-md border-gray-300 focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  </div>
                  {invalid && (
                    <p className="text-xs text-red-600 mt-1 text-center">
                      {message}
                    </p>
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

                <p className="text-center text-xs text-gray-600">
                  Already have an account?{" "}
                  <span
                    onClick={() => setMethod(true)}
                    className="text-red-600 font-medium hover:underline cursor-pointer"
                  >
                    Login
                  </span>
                </p>
              </form>
            )}

            {/* 🔹 Stage 2 — Verify OTP */}
            {stage === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Verify OTP</h1>
                  <p className="text-xs text-gray-600 mt-1">
                    OTP sent to <span className="font-semibold">{formData.mobile}</span>{" "}
                    <span
                      onClick={() => setStage(1)}
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
                      value={formData.otp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/, "");
                        const newOtp = formData.otp.split("");
                        newOtp[i] = val;
                        setFormData({ ...formData, otp: newOtp.join("") });
                        if (val && i < 5) otpRefs.current[i + 1]?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !formData.otp[i] && i > 0) {
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

            {/* 🔹 Stage 3 — Complete Signup */}
            {stage === 3 && (
              <form onSubmit={handleCompleteSignup} className="space-y-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Add Email</h1>
                  <p className="text-xs text-gray-600 mt-1">
                    Add your email address to complete signup
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
                    placeholder="Enter your email"
                  />
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
                  {loading ? "Creating..." : "CONTINUE"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <SuccessModal
          message="Signup Successful!"
          onClose={() => {
            setShowSuccess(false);
            closeModal();
            navigate("/");
          }}
        />
      )}
    </>
  );
};

export default Signup;
