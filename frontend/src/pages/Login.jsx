import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import LoginForm from "../components/forms/LoginForm";
import { authAPI } from "../utils/api";

const Login = ({ closeModal, setMethod }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState(1);
  const [invalid, setInvalid] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authAPI.sendLoginOtp(email);
      toast.success("OTP sent!");
      setStage(2);
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authAPI.verifyOtp(email, otp);
      const { user, token } = res.data.data;
      login(user, token);
      toast.success("Login successful!");

      navigate(user.role === "patient" ? "/patient/dashboard" : "/doctor/dashboard");
      closeModal?.();
    } catch (err) {
      toast.error("Invalid OTP");
      setInvalid(true);
      setMessage("Incorrect OTP, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <LoginForm
        email={email}
        otp={otp}
        setEmail={setEmail}
        setOtp={setOtp}
        stage={stage}
        invalid={invalid}
        message={message}
        loading={loading}
        handleSendOtp={handleSendOtp}
        handleVerifyOtp={handleVerifyOtp}
      />

      <p className="text-center text-sm mt-3 text-gray-600">
        New to CareMitra?{" "}
        <span
          onClick={() => setMethod(false)}
          className="text-indigo-600 font-medium cursor-pointer hover:underline"
        >
          Create an account
        </span>
      </p>
    </div>
  );
};

export default Login;
