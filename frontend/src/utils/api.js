import axios from "axios";

const api = axios.create({
  baseURL:'http://127.0.0.1:5000/auth',
  withCredentials: true,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// —————————————
// AUTH APIs
// —————————————

export const authAPI = {
  sendSignupOtp: (email) => api.post("/send-otp/signup", { email }),
  sendLoginOtp: (email) => api.post("/send-otp/login", { email }),

  verifyOtp: (email, otp) =>
    api.post("/verify-otp", { email, otp }),

  completeSignup: (data) =>
    api.post("/complete-signup", data),

  getMe: () => api.get("/me"),
};

export default api;
