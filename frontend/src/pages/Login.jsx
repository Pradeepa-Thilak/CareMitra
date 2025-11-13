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
    try {
      await authAPI.sendLoginOtp(email);
      toast.success("OTP sent!");
      setStage(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  // Step 2: Verify OTP (mock)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const res = await authAPI.verifyOtp(email, otp);

      const { user, token } = res.data;

      login(user, token);
      toast.success("Login successful!");

      if (user.role === "patient") navigate("/patient/dashboard");
      else navigate("/doctor/dashboard");

      closeModal?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
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
