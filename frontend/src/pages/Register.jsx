import React, { useState, useRef, useEffect } from "react";
import SuccessModal from "../components/SuccessModal";
import { sendFirebaseOtp, verifyFirebaseOtp } from "../utils/firebase";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Signup = ({ setMethod, closeModal, onSignupSuccess }) => {
  const [stage, setStage] = useState(1);
  const [formData, setFormData] = useState({ mobile: "", otp: "", email: "" });
  const [invalid, setInvalid] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (stage === 2) otpRefs.current[0]?.focus();
  }, [stage]);

  // STEP 1: Send OTP via Firebase
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
      const confirmation = await sendFirebaseOtp(formData.mobile);
      setConfirmationResult(confirmation);
      toast.success("OTP sent successfully!");
      setStage(2);
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setInvalid(false);
    setMessage("");

    if (formData.otp.length !== 6) {
      setInvalid(true);
      setMessage("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      await verifyFirebaseOtp(confirmationResult, formData.otp);
      toast.success("OTP verified successfully!");
      setStage(3);
    } catch (error) {
      toast.error("Invalid or expired OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Complete Signup (Mock User Creation)
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    if (!formData.email.includes("@")) {
      setInvalid(true);
      setMessage("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      // Mock login after signup
      const mockUser = {
        mobile: formData.mobile,
        email: formData.email,
      };
      const mockToken = "firebase-demo-token";

      login(mockUser, mockToken);
      toast.success("Signup successful!");
      setShowSuccess(true);
      onSignupSuccess(true);

      setTimeout(() => {
        closeModal();
        navigate("/");
      }, 2000);
    } catch (error) {
      toast.error("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div id="recaptcha-container"></div>
      {!showSuccess ? (
        <div className="w-full flex justify-center items-center">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-md border border-gray-200 p-6">

            {/* Stage 1 — Send OTP */}
            {stage === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <h1 className="text-xl font-bold text-gray-800">Sign Up</h1>
                <p className="text-xs text-gray-600">Enter your mobile number to continue</p>
                <div className="flex w-64 mx-auto">
                  <span className="inline-flex items-center px-2 border border-r-0 border-gray-300 bg-gray-100 text-gray-700 rounded-l-md text-sm">
                    +91
                  </span>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    maxLength="10"
                    placeholder="10-digit number"
                    className="flex-1 px-2 py-1.5 text-sm border rounded-r-md border-gray-300 focus:ring-1 focus:ring-red-500 outline-none"
                  />
                </div>
                {invalid && <p className="text-xs text-red-600 text-center">{message}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-1.5 text-sm text-white rounded-md font-semibold ${
                    loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loading ? "Sending..." : "SEND OTP"}
                </button>

                <p className="text-center text-xs text-gray-600">
                  Already have an account?{" "}
                  <span onClick={() => setMethod(true)} className="text-red-600 font-medium hover:underline cursor-pointer">
                    Login
                  </span>
                </p>
              </form>
            )}

            {/* Stage 2 — Verify OTP */}
            {stage === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <h1 className="text-xl font-bold text-gray-800">Verify OTP</h1>
                <p className="text-xs text-gray-600">
                  OTP sent to <span className="font-semibold">{formData.mobile}</span>{" "}
                  <span onClick={() => setStage(1)} className="text-red-600 font-semibold cursor-pointer hover:underline">
                    Edit
                  </span>
                </p>

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
                        if (e.key === "Backspace" && !formData.otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
                      }}
                      className="w-8 h-10 text-center border border-gray-300 rounded-md text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-1.5 text-sm text-white rounded-md font-semibold ${
                    loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loading ? "Verifying..." : "VERIFY OTP"}
                </button>
              </form>
            )}

            {/* Stage 3 — Complete Signup */}
            {stage === 3 && (
              <form onSubmit={handleCompleteSignup} className="space-y-4">
                <h1 className="text-xl font-bold text-gray-800">Add Email</h1>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-1.5 text-sm text-white rounded-md font-semibold ${
                    loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loading ? "Creating..." : "CONTINUE"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <SuccessModal message="Signup Successful!" onClose={() => { setShowSuccess(false); closeModal(); navigate("/"); }} />
      )}
    </>
  );
};

export default Signup;
