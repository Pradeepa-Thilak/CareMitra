// src/utils/api.js
import axios from "axios";
import { labTestAPI } from "../../utils/api";

const api = axios.create({
  baseURL: "http://localhost:5000", // change if your backend host/port differs
  withCredentials: true,
});

// —————————————
// LAB-TESTS APIs
// —————————————

export const  labTestAPI = {

    getLabTest: () => api.get(`admin/lab-tests`),

    createLabTest: (data) => api.post('admin/lab-tests/create-test',data),

    editLabTest: (id,data) => api.post(`admin/lab-tests/edit-test/${id}`,data),

    activeStatus: (id,data) => api.patch(`admin/lab-tests/changeActive/${id}`,data),

    deleteLabTest: (id,data) => api.delete(`admin/lab-tests/delete-test/${id}`,data)
}