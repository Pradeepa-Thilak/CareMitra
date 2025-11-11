import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const otpSignupAPI = {
  sendOtp: (mobile) => apiClient.post('/auth/signup/send-otp', { mobile }),
  verifyOtp: (mobile, otp) => apiClient.post('/auth/signup/verify-mobile', { mobile, otp }),
  completeSignup: (data) => apiClient.post('/auth/signup/complete', data),
};

export const otpLoginAPI = {
  sendOtp: (emailOrMobile) =>
    apiClient.post('/auth/login/send-otp', { emailOrMobile }),

  verifyOtp: (emailOrMobile, otp) =>
    apiClient.post('/auth/login/verify', { emailOrMobile, otp }),
};


export const medicineAPI = {
  getMedicines: (params) => apiClient.get('/medicines', { params }),
  getMedicineById: (id) => apiClient.get(`/medicines/${id}`),
  searchMedicines: (query) => apiClient.get('/medicines/search', { params: { q: query } }),
  getCategories: () => apiClient.get('/medicines/categories'),
  getFeatured: () => apiClient.get('/medicines/featured'),
};

export const cartAPI = {
  getCart: () => apiClient.get('/cart'),
  addToCart: (data) => apiClient.post('/cart/add', data),
  removeFromCart: (productId) => apiClient.delete(`/cart/remove/${productId}`),
  updateCartItem: (productId, data) => apiClient.put(`/cart/update/${productId}`, data),
  clearCart: () => apiClient.post('/cart/clear'),
};

export const orderAPI = {
  createOrder: (data) => apiClient.post('/orders', data),
  getOrders: (params) => apiClient.get('/orders', { params }),
  getOrderById: (id) => apiClient.get(`/orders/${id}`),
  trackOrder: (id) => apiClient.get(`/orders/${id}/track`),
  cancelOrder: (id) => apiClient.post(`/orders/${id}/cancel`),
};

export const prescriptionAPI = {
  uploadPrescription: (formData) => apiClient.post('/prescriptions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getPrescriptions: () => apiClient.get('/prescriptions'),
  getPrescriptionById: (id) => apiClient.get(`/prescriptions/${id}`),
  deletePrescription: (id) => apiClient.delete(`/prescriptions/${id}`),
};

export const doctorAPI = {
  getDoctors: (params) => apiClient.get('/doctors', { params }),
  getDoctorById: (id) => apiClient.get(`/doctors/${id}`),
  bookConsultation: (data) => apiClient.post('/consultations', data),
  getConsultations: () => apiClient.get('/consultations'),
  getConsultationById: (id) => apiClient.get(`/consultations/${id}`),
};

export const labAPI = {
  getTests: (params) => apiClient.get('/lab-tests', { params }),
  getTestById: (id) => apiClient.get(`/lab-tests/${id}`),
  bookTest: (data) => apiClient.post('/lab-bookings', data),
  getBookings: () => apiClient.get('/lab-bookings'),
  getResults: () => apiClient.get('/lab-results'),
};

export const familyVaultAPI = {
  getFamilyMembers: () => apiClient.get('/family-vault/members'),
  addFamilyMember: (data) => apiClient.post('/family-vault/members', data),
  updateFamilyMember: (id, data) => apiClient.put(`/family-vault/members/${id}`, data),
  removeFamilyMember: (id) => apiClient.delete(`/family-vault/members/${id}`),
  getFamilyRecords: (memberId) => apiClient.get(`/family-vault/records/${memberId}`),
};

export const chatbotAPI = {
  sendMessage: (data) => apiClient.post('/chatbot/message', data),
  getChatHistory: () => apiClient.get('/chatbot/history'),
};

export default apiClient;
