import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { token, role: userRole, loading } = useContext(AuthContext);
  const location = useLocation();

  // Wait until AuthContext finishes loading
  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  // After loading completes, then check token
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional role restriction
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
