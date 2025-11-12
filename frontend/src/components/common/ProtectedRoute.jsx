import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

/**
 * 🔒 ProtectedRoute
 * - Ensures only logged-in users can access certain routes.
 * - Optionally restricts routes based on role (patient/doctor/admin).
 * - Redirects unauthorized users to login or home.
 */

const ProtectedRoute = ({ children, role }) => {
  const { token, role: userRole } = useContext(AuthContext);
  const location = useLocation();

  // 🚫 If not logged in, redirect to login page
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🚫 If a specific role is required but doesn’t match
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  // ✅ Access granted
  return children;
};

export default ProtectedRoute;
