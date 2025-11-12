import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; // ✅ corrected import
import { toast } from "react-hot-toast";
import LoginForm from "../components/forms/LoginForm";

const Login = ({ closeModal, setMethod }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState(1);
  const [invalid, setInvalid] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Step 1: Send OTP (mock)
  const handleSendOtp = async (e) => {
      e.preventDefault();
      setInvalid(false);
      setMessage("");
  
      if (!email.includes("@")) {
        setInvalid(true);
        setMessage("Please enter a valid email");
        return;
      }
  
      // 🧠 Generate a random 6-digit OTP for mock mode
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
  
      // 🧾 Log OTP to console (for developer visibility)
      console.log(`✅ Mock OTP for ${email}: ${mockOtp}`);
  
      // Save the OTP so verification can compare it later
      setOtp(mockOtp);
  
      // 🎉 Show toast message
      toast.success("Mock OTP sent! (Check console for OTP)");
  
      // Move to OTP verification stage
      setStage(2);
    };
  // Step 2: Verify OTP (mock)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setInvalid(true);
      setMessage("Please enter a 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      // 🧠 Mock login (frontend only)
      const mockRole =
        email.includes("doc") || email.includes("dr") ? "doctor" : "patient";

      const userData = {
        email,
        name: email.split("@")[0],
        role: mockRole,
      };

      // ✅ Save in AuthContext
      login(userData, "mock-token-123");

      toast.success("Login successful!");

      // ✅ Redirect based on role
      if (mockRole === "patient") navigate("/patient/dashboard");
      else if (mockRole === "doctor") navigate("/doctor/dashboard");
      else navigate("/");

      closeModal?.();
    } catch (err) {
      console.error(err);
      toast.error("Login failed, try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginForm
        email={email}
        otp={otp}
        setEmail={setEmail}
        setOtp={setOtp}
        invalid={invalid}
        message={message}
        stage={stage}
        handleSendOtp={handleSendOtp}
        handleVerifyOtp={handleVerifyOtp}
        loading={loading}
      />

      <div className="text-center mt-3 text-xs text-gray-700">
        New to CareMitra?{" "}
        <span
          onClick={() => setMethod(false)}
          className="text-red-600 font-medium cursor-pointer hover:underline"
        >
          Sign Up
        </span>
      </div>
    </>
  );
};

export default Login;
