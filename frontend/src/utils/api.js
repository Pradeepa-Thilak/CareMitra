// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // change if your backend host/port differs
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

  verifyOtp: (email, otp) => api.post("/auth/verify-otp", { email, otp }),

  completeSignup: (data) => api.post("/auth/complete-signup", data),

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
  getAll: (filters = {}) => api.get("/products/", { params: filters }),

  // GET /products/:id
  getById: (id) => api.get(`/products/${id}`),

  // GET /products/by-brand-category
  getByBrandCategory: (brand, category) =>
    api.get("/products/by-brand-category", {
      params: { brand, category },
    }),
};

// —————————————
// SEARCH APIs
// —————————————
export const searchAPI = {
  // GET /search?q=paracetamol
  basic: (query) => api.get(`/search/`, { params: { q: query } }),

  // POST /search/advanced
  advanced: (body) => api.post("/search/advanced", body),
};

// —————————————
// LAB-TEST APIs
// —————————————
export const labTestAPI = {
  getAll: () => api.get("/lab-tests"),
  getByKey: (key) => api.get(`/lab-tests/${encodeURIComponent(key)}`),
  createOrder: (formData) => api.post("/lab-tests/create-order", formData),
  verifyPayment: (payload) => api.post("/lab-tests/payment/verify", payload),
  uploadPrescription: (formData) => api.post("/lab-tests/upload-prescription", formData),
  getPrescription: (orderId) => api.get(`/lab-tests/prescription/${orderId}`, { responseType: "blob" }),
  getReport: (orderId) => api.get(`/lab-tests/report/${orderId}`, { responseType: "blob" }),
  uploadReport: (orderId, formData) => api.post(`/lab-tests/report/${orderId}`, formData),
  updateSampleStatus: (orderId) => api.patch(`/lab-tests/sample-status/${orderId}`),
  updateProcessingStatus: (orderId) => api.patch(`/lab-tests/processing-status/${orderId}`),
};

// ----------------------------
// MEMBER APIs
// ----------------------------
export const memberAPI = {
  
  addMode: (memberId,body) => api.put(`/dashboard/type/${memberId}`,body),

  // POST /addMember  (body: { name, age, gender, phone, ... })
  addMember: (body) => api.post("/dashboard/addMember", body),

  // GET /getMember  (returns list of members for logged-in user)
  getMembers: () => api.get("/dashboard/getMember"),

  // POST /delete/${memberId} 
 deleteMember: (memberId, body) => 
  api.delete(`/dashboard/delete/${memberId}`, { data: body }),
 
editMember: (memberId, body) => api.put(`/dashboard/edit/${memberId}`, body)

};

// ----------------------------
// CONSULTATION (symptoms / specialists) APIs
// ----------------------------
export const consultationAPI = {
  // POST /symptoms  (body: { userId?, memberId?, symptoms: [...] })
  addSymptoms: (body) => api.post("/dashboard/symptoms", body),

  // POST /specialists  (body: { userId?, memberId?, specialty, symptoms, ... })
  selectSpecialist: (body) => api.post("/dashboard/specialists", body),

  createOrder: (body) => api.post("dashboard/create-order", body),     // ✅ Add this
 
};


// ----------------------------
// PAYMENT APIs
// ----------------------------
export const paymentAPI = {
  // POST /payment  (verify payment payload or initiate backend-side verification)
  verifyPayment: (body) => api.post("dashboard/verify-payment", body),
};


// ----------------------------
// CART APIs
// ----------------------------
export const cartAPI = {
  // GET /cart
  getCart: () => api.get("/cart"),

  // POST /cart/add/:productId  (optional body: { quantity })
  addToCart: (productId, quantity = 1) =>
    api.post(`/cart/add/${productId}`, { quantity }),

  // PUT /cart/update/:productId  (body: { quantity })
  updateQuantity: (productId, quantity) =>
    api.put(`/cart/update/${productId}`, { quantity }),

  // DELETE /cart/remove/:productId
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),

  // DELETE /cart/clear
  clearCart: () => api.delete("/cart/clear"),
};

// ----------------------------
// LAB-STAFF APIs
// ----------------------------

export const labStaffAPI = {
   
  // GET /admin/staff/order/{id}
  test: (staffId) => api.get(`/admin/staff/order/${staffId}`),

  // PATCH /admin/staff/order/${id}`, { status: "done" }
  markComplete: () => api.patch(`/admin/staff/order/${id}`, { status: "done" }),
}

// ----------------------------
// DOCTOR APIs
// ----------------------------

export const doctorAPI = {
  register: (body) => api.post('/doctor/register/doctor', body),
}

export default api;
