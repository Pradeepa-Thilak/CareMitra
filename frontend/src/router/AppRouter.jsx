import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import PatientDashboard from "../pages/PatientDashboard";
import DoctorDashboard from "../pages/DoctorDashboard";
import Profile from "../pages/Profile";
import Appointment from "../pages/Appointment";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Navbar from "../components/common/Navbar";
import Medicines from "../pages/Medicines";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";          
import Doctors from "../pages/Doctors";    
import LabTests from "../pages/LabTests"; 
import Footer from "../components/common/Footer";
import BookConsultation from "../pages/BookConsultation";
import Wishlist from "../pages/Wishlist";
import Payment from "../pages/Payment";
import LabStaff from "../pages/LabStaff";
import DoctorRegistrationForm from "../components/forms/DoctorRegistrationForm";
import Checkout from "../pages/Checkout";
import Success from "../pages/Success";
import Orders from "../pages/Orders";

const AppRouter = () => {
  return (
    <Router>
      <Navbar />

      <main style={{ paddingTop: "var(--nav-offset, 5rem)" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Patient Dashboard */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute role="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Doctor Dashboard */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* User Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Appointment */}
          <Route
            path="/appointment"
            element={
              <ProtectedRoute>
                <Appointment />
              </ProtectedRoute>
            }
          />

          {/* Public shop pages */}
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/medicine/:id" element={<ProductDetails />} />

          {/* Lab Tests */}
          <Route path="/lab-tests" element={<LabTests />} />
          <Route path="/labtests" element={<Navigate to="/lab-tests" replace />} />
          <Route path="/lab-tests/:key" element={<LabTests />} />

          {/* PROTECTED SHOPPING ROUTES */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/consultation"
            element={
              <ProtectedRoute>
                <BookConsultation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />

          {/* Checkout */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* Doctors Page (Public or protected based on your logic) */}
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/consultation" element={<BookConsultation />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/payments" element={<Payment />} />
          <Route path="/appointments" element={<ProtectedRoute><Appointment /></ProtectedRoute>} />
          <Route path="/labstaff" element={<ProtectedRoute><LabStaff /></ProtectedRoute>} />
          <Route path="/doctor-register" element={<DoctorRegistrationForm />} />
          <Route path="/success" element={<Success />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
};

export default AppRouter;
