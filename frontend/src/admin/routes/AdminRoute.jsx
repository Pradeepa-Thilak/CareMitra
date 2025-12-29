// src/admin/routes/AdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const token = localStorage.getItem("authToken");
  const userString = localStorage.getItem("user");

  // If no token, redirect to admin login
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Parse user data
  let user;
  try {
    user = JSON.parse(userString);
  } catch (e) {
    console.error("Error parsing user data:", e);
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user exists and has admin role
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized
  return <Outlet />;
};

export default AdminRoute;