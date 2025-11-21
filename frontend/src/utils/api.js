import axios from "axios";

const api = axios.create({
  baseURL:'http://localhost:5000',
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


// —————————————
// CATEGORY APIs
// —————————————

export const categoryAPI = {
  getAll: () => api.get("/categories/"),
  getByKey: (key) => api.get(`/categories/${key}`),
};


// —————————————
// PRODUCT APIs
// —————————————

export const productAPI = {
  // GET /products
  getAll: (filters = {}) => api.get("/products/",{params: filters}),

  // GET /products/:id
  getById: (id) => api.get(`/products/${id}`),

  // GET /products/by-brand-category
  getByBrandCategory: (brand, category) => 
    api.get("/products/by-brand-category",{
      params: {brand,category},
    }),
};


// —————————————
// SEARCH APIs
// —————————————

export const searchAPI = {
  // GET /search?q=paracetamol
  basic: (query) => api.get(`/search/`, {params: {q: query}}),

  // POST /search/advanced
  advanced: (body) => api.post("/search/advanced", body),
};
export default api;
