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

  /* ------------------------- SEND OTP ------------------------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await authAPI.sendLoginOtp(email);

      toast.success("OTP sent!");
      setStage(2);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to send OTP. Try again."
      );
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

      // Call backend
      const res = await authAPI.verifyOtp(email, cleanedOtp);

      // NEW BACKEND RESPONSE FORMAT
      const { success, message, token, role } = res.data;

      if (!success) {
        toast.error(message || "Login failed");
        return;
      }

      // Save in context
      login({ email, role }, token);

      toast.success("Login successful!");

      // Role-based navigation
      if (role === "patient") {
        navigate("/patient/dashboard");
      } else {
        navigate("/doctor/dashboard");
      }

      closeModal?.();
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message || "Invalid or expired OTP";

      setInvalid(true);
      setMessage(serverMsg);
      toast.error(serverMsg);
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
