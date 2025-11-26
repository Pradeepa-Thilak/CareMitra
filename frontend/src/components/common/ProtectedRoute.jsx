import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { token, role: userRole, loading } = useContext(AuthContext);
  const location = useLocation();

  // ⏳ While checking token, DO NOT redirect
  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
