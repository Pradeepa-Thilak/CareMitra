// src/components/user/AdminNavbar.jsx
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Heart, LogOut, User } from 'lucide-react';

const linkClass = ({ isActive }) =>
  `px-4 py-2 rounded-md text-sm font-medium transition
   ${
     isActive
       ? "bg-gray-700 text-white"
       : "text-gray-300 hover:bg-gray-700 hover:text-white"
   }`;

function AdminNavbar() {
  const navigate = useNavigate();
  
  // Get user data from localStorage
  const userString = localStorage.getItem('user');
  let userName = 'Admin';
  
  try {
    const user = JSON.parse(userString);
    userName = user?.name || user?.email?.split('@')[0] || 'Admin';
  } catch (e) {
    console.error('Error parsing user data:', e);
  }

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Redirect to login
    navigate('/admin/login');
  };

  return (
    <nav className="bg-gray-900 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/admin" className="flex items-center gap-2 text-white">
          <Heart className="w-6 h-6 text-white" />
          <span className="text-2xl font-semibold tracking-wide">CareMitra</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-3">
          <NavLink to="/admin" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/lab-tests" className={linkClass}>
            Lab Tests
          </NavLink>
          <NavLink to="/admin/doctors" className={linkClass}>
            Doctors
          </NavLink>
          <NavLink to="/admin/lab-staff" className={linkClass}>
            Lab Staff
          </NavLink>
          <NavLink to="/admin/patients" className={linkClass}>
            Patients
          </NavLink>
          <NavLink to="/admin/medicines" className={linkClass}>
            Medicines
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            Orders
          </NavLink>
          <NavLink to="/admin/consultations" className={linkClass}>
            Consultations
          </NavLink>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-300">
            <div className="p-2 bg-gray-700 rounded-full">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{userName}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;