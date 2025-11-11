import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react"; // profile icon
import Login from "../pages/Login";
import Signup from "../pages/Signup";

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("caremitraUser") ? true : false
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = showLogin ? "hidden" : "auto";
  }, [showLogin]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("caremitraUser");
    setIsAuthenticated(false);
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-red-600">
              CareMitra
            </Link>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex space-x-4">
            <Link
              to="/medicines"
              className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Medicines
            </Link>
            <Link
              to="/lab-tests"
              className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Lab Tests
            </Link>
            <Link
              to="/consults"
              className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Consults
            </Link>
            <Link
              to="/cart"
              className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Cart
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center relative" ref={dropdownRef}>
            {!isAuthenticated ? (
              <button
                onClick={() => setShowLogin(true)}
                className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-red-700 transition duration-150"
              >
                Login / Sign Up
              </button>
            ) : (
              <div>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 border hover:bg-gray-200 transition"
                >
                  <User className="text-gray-700 w-5 h-5" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login/Signup Modal */}
      {showLogin && !isAuthenticated && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 sm:p-8 overflow-y-auto max-h-[85vh] flex flex-col justify-center">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-2xl leading-none"
            >
              ×
            </button>
            <div className="flex flex-col justify-center">
              {isLogin ? (
                <Login
                  setMethod={setIsLogin}
                  closeModal={() => {
                    setShowLogin(false);
                    setIsAuthenticated(true);
                    localStorage.setItem("caremitraUser", "true");
                  }}
                />
              ) : (
                <Signup
                  setMethod={setIsLogin}
                  closeModal={() => {
                    setShowLogin(false);
                    setIsAuthenticated(true);
                    localStorage.setItem("caremitraUser", "true");
                  }}
                  onSignupSuccess={() => setIsAuthenticated(true)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
