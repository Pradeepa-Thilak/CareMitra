import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; // ✅ corrected import path
import { toast } from "react-hot-toast";
import SignupForm from "../components/forms/SignupForm";

const Signup = ({ closeModal, setMethod }) => {
  const [stage, setStage] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({ name: "", role: "" }); // ✅ added role
  const [invalid, setInvalid] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // 🔹 Stage 1 - Send OTP (mock)
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

  // 🔹 Stage 2 - Verify OTP (mock)
  const handleVerifyOtp = (e) => {
    e.preventDefault();

    // Compare typed OTP with stored one
    if (otp.trim().length !== 6) {
      setInvalid(true);
      setMessage("Please enter the 6-digit OTP.");
      return;
    }

    toast.success("OTP verified successfully!");
    setStage(3);
  };

  // 🔹 Stage 3 - Complete Signup
  const handleCompleteSignup = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.role) {
      setInvalid(true);
      setMessage("All fields are required");
      return;
    }

    // 🧠 Mock successful signup
    const userData = {
      name: formData.name,
      email,
      role: formData.role,
    };

    login(userData, "mock-token-123");

    toast.success("Signup successful!");
    closeModal?.();

    // ✅ Redirect by role
    if (formData.role === "patient") navigate("/patient/dashboard");
    else if (formData.role === "doctor") navigate("/doctor/dashboard");
    else navigate("/");
  };

  return (
    <>
      <SignupForm
        email={email}
        otp={otp}
        formData={formData}
        setEmail={setEmail}
        setOtp={setOtp}
        setFormData={setFormData}
        invalid={invalid}
        message={message}
        stage={stage}
        handleSendOtp={handleSendOtp}
        handleVerifyOtp={handleVerifyOtp}
        handleCompleteSignup={handleCompleteSignup}
        loading={loading}
      />

      <p className="text-center text-xs text-gray-600 mt-2">
        Already have an account?{" "}
        <span
          onClick={() => setMethod(true)}
          className="text-red-600 font-medium hover:underline cursor-pointer"
        >
          Login
        </span>
      </p>
    </>
  );
};

export default Signup;
