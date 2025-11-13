import axios from "axios";

const api = axios.create({
  baseURL:'http://localhost:5000/api',
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
  sendSignupOtp: (email) => api.post("/auth/send-otp/signup", { email }),
  sendLoginOtp: (email) => api.post("/auth/send-otp/login", { email }),

  verifyOtp: (email, otp) =>
    api.post("/auth/verify-otp", { email, otp }),

  completeSignup: (data) =>
    api.post("/auth/complete-signup", data),

  getMe: () => api.get("/auth/me"),
};

export default api;
