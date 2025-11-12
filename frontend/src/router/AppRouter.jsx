import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
// import Login from "../pages/Login";
// import Signup from "../pages/Signup";
import PatientDashboard from "../pages/PatientDashboard";
import DoctorDashboard from "../pages/DoctorDashboard";
import Profile from "../pages/Profile";
import Appointment from "../pages/Appointment";
// import NotFound from "../pages/NotFound";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Navbar from "../components/common/Navbar";

const AppRouter = () => {
  return (
    <Router>
        <Navbar />
      <Routes>
        {/* <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> */}

        <Route
          path="/patient/dashboard"
          element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>}
        />
        <Route
          path="/doctor/dashboard"
          element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>}
        />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/appointment" element={<ProtectedRoute><Appointment /></ProtectedRoute>} />

        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRouter;
