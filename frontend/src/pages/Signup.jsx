import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import SignupForm from "../components/forms/SignupForm";
import { authAPI } from "../utils/api";

const Signup = ({ closeModal, setMethod }) => {
  const [stage, setStage] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({ name: "", role: "" });
  const [invalid, setInvalid] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Stage 1 - Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authAPI.sendSignupOtp(email);
      toast.success("OTP sent to email!");
      setStage(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
      setInvalid(true);
      setMessage(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Stage 2 - Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authAPI.verifyOtp(email, otp);
      toast.success("OTP verified!");
      setStage(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
      setInvalid(true);
      setMessage(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Stage 3 - Complete Signup
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
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
      setInvalid(true);
      setMessage(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
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
        stage={stage}
        setStage={setStage}
        invalid={invalid}
        message={message}
        loading={loading}
        handleSendOtp={handleSendOtp}
        handleVerifyOtp={handleVerifyOtp}
        handleCompleteSignup={handleCompleteSignup}
      />

      <p className="text-center text-sm text-gray-600 mt-3">
        Already have an account?{" "}
        <button
          onClick={() => setMethod(true)}
          className="text-indigo-600 font-medium hover:underline"
        >
          Login
        </button>
      </p>
    </>
  );
};

export default Signup;
