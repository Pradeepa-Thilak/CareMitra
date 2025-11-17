import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; // ✅ corrected import path
import { toast } from "react-hot-toast";
import SignupForm from "../components/forms/SignupForm";
import {authAPI} from "../utils/api";

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

  // 🔹 Stage 1 - Send OTP 
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.sendSignupOtp(email);
      toast.success("OTP sent to email!");
      setStage(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };


  // 🔹 Stage 2 - Verify OTP 
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await authAPI.verifyOtp(email, otp);
      toast.success("OTP verified!");
      setStage(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };


  // 🔹 Stage 3 - Complete Signup
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.completeSignup({
        email,
        name: formData.name,
        role: formData.role,
      });

      const { token, user } = res.data;

      login(user, token);
      toast.success("Signup successful!");

      if (user.role === "patient") navigate("/patient/dashboard");
      else navigate("/doctor/dashboard");

      closeModal?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
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
