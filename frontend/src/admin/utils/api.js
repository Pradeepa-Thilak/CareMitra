// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001", // Backend runs on port 5001
  withCredentials: true,
});


// attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// —————————————
// LAB-TESTS APIs
// —————————————

export const labTestAPI = {
  getLabTest: () => api.get(`/lab-tests/`), // Public route for getting all lab tests
  getOrders: () => api.get("/admin/lab-tests/lab-orders"), // Admin route for lab orders
  getLabTestSearch: (id) => api.get(`/lab-tests/${id}`),
  createLabTest: (data) => api.post('/admin/lab-tests/create-test', data),
  editLabTest: (id, data) => api.put(`/admin/lab-tests/edit-test/${id}`, data),
  activeStatus: (id, data) => api.patch(`/admin/lab-tests/changeActive/${id}`, data),
  deleteLabTest: (id, data) => api.delete(`/admin/lab-tests/delete-test/${id}`, data),
  updateSampleStatus: (id) => api.put(`/admin/lab-tests/order/${id}/sample-status`),
  updateProcessingStatus: (id) => api.put(`/admin/lab-tests/order/${id}/processing`),
  downloadPrescription: (razorpayOrderId) => api.get(`/admin/lab-tests/prescription/${razorpayOrderId}`, {
    responseType: "arraybuffer",
  }),
  uploadReport: (orderId, formData) => api.put(`/admin/lab-tests/order/${orderId}/upload-report`, formData)
};

export const doctorAPI = {
  getAllDoctors: () => api.get("api/admin/doctors"),
  getPendingDoctors: () => api.get("api/admin/doctors/pending"),
  verifyDoctor: (doctorId) => api.patch(`api/admin/doctors/${doctorId}/verify`),
  registerDoctor: (data) => api.post("api/admin/register/doctor", data),
}
export const labStaffAPI = {
      listLabStaff : () => api.get("/admin/staff/"),

      createLabStaff : (data) => api.post("/admin/staff/", data),

       updateLabStaff : (id, data) => api.put(`/admin/staff/${id}`, data),

       assignOrder : (staffId, orderData) =>
  api.post(`/admin/staff/${staffId}/assign-order`, orderData),

       updateOrderStatus : (staffId, orderId, statusData) =>
api.put(`/admin/staff/${staffId}/order/${orderId}`, statusData),

listOfOrders : () => api.get("/admin/staff/order")
}

export const getAllOrders = () => api.get("/admin/orders");
export const updateOrderStatus = (id, status) =>
  api.patch(`/admin/orders/${id}/status`, { status });

export const getAllConsultations = () =>
  api.get("/admin/consultations");

export const updateConsultationStatus = (id, status) =>
  api.patch(`/admin/consultations/${id}/status`, { status });

export const getDashboardStats = () =>
  api.get("/admin/dashboard");


export default api;