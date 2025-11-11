import React, { useState, useRef } from "react";
import { sendFirebaseOtp, verifyFirebaseOtp } from "../utils/firebase";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Login = ({ setMethod, closeModal }) => {
  const [stage, setStage] = useState(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const { login } = useAuth();

  // STEP 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10 || isNaN(Number(mobile))) {
      setInvalid(true);
      setMessage("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      const confirmation = await sendFirebaseOtp(mobile);
      setConfirmationResult(confirmation);
      toast.success("OTP sent successfully!");
      setStage(2);
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP and Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setInvalid(true);
      setMessage("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      await verifyFirebaseOtp(confirmationResult, otp);

      // Mock login success
      const mockUser = { mobile };
      const mockToken = "firebase-demo-login-token";
      login(mockUser, mockToken);

      toast.success("Login successful!");
      closeModal();
      navigate("/");
    } catch (error) {
      toast.error("Invalid or expired OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div id="recaptcha-container"></div>
      <div className="w-full flex justify-center items-center">
        <div className="bg-white w-full max-w-sm rounded-xl shadow-md border border-gray-200 p-6">

          {/* Stage 1 — Send OTP */}
          {stage === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <h1 className="text-xl font-bold text-gray-800">Login</h1>
              <p className="text-xs text-gray-600 mt-1">
                Get access to your orders, lab tests & doctor consultations
              </p>
              <div className="flex w-64 mx-auto">
                <span className="inline-flex items-center px-2 border border-r-0 border-gray-300 bg-gray-100 text-gray-700 rounded-l-md text-sm">
                  +91
                </span>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  maxLength="10"
                  className="flex-1 px-2 py-1 text-sm border rounded-r-md outline-none focus:ring-1 focus:ring-red-500 border-gray-300"
                  placeholder="Enter number"
                />
              </div>
              {invalid && <p className="text-xs text-red-600 mt-1">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-1.5 text-sm text-white rounded-md font-semibold ${
                  loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading ? "Sending..." : "SEND OTP"}
              </button>

              <div className="text-center mt-3 text-xs text-gray-700">
                New on CareMitra?{" "}
                <span onClick={() => setMethod(false)} className="text-red-600 font-medium cursor-pointer hover:underline">
                  Sign Up
                </span>
              </div>
            </form>
          ) : (
            /* Stage 2 — Verify OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <h1 className="text-xl font-bold text-gray-800">Verify OTP</h1>
              <p className="text-xs text-gray-600 mt-1">
                OTP sent to <span className="font-semibold">{mobile}</span>{" "}
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
                    value={otp[i] || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/, "");
                      const newOtp = otp.split("");
                      newOtp[i] = value;
                      setOtp(newOtp.join(""));
                      if (value && i < 5) otpRefs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
                    }}
                    className="w-10 h-12 text-center border border-gray-300 rounded-md text-lg focus:border-red-500 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                ))}
              </div>
              {invalid && <p className="text-xs text-red-600 mt-2">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-1.5 text-sm text-white rounded-md font-semibold ${
                  loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading ? "Verifying..." : "DONE"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
