import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import AuthModal from "../modals/AuthModal";
import {
  Heart,
  LogOut,
  UserCircle,
  Stethoscope,
  HomeIcon,
  ChevronDown,
} from "lucide-react";

const Navbar = () => {
  const { user, role, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Dropdown menu state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsDropdownOpen(false);
  };

  return (
    <>
      {/* 🔹 Navbar Layout */}
      <nav className="flex items-center justify-between px-6 py-3 bg-sky-700 text-white shadow-lg">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Heart className="text-white w-6 h-6" />
          <Link to="/" className="text-2xl font-semibold tracking-wide">
            CareMitra
          </Link>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex space-x-6 text-base font-medium">
          <Link to="/" className="hover:text-gray-200 flex items-center gap-1">
            <HomeIcon size={18} /> Home
          </Link>
          <Link to="/doctors" className="hover:text-gray-200">
            Find Doctors
          </Link>
          <Link to="/medicines" className="hover:text-gray-200">
            Medicines
          </Link>
          <Link to="/labtests" className="hover:text-gray-200">
            Lab Tests
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
          {!token ? (
            // 🔸 Show Profile Icon for Login / Signup
            <button
              onClick={() => {
                setIsLogin(true);
                setShowAuthModal(true);
              }}
              className="bg-white text-sky-700 p-2 rounded-full hover:bg-gray-100 transition"
              title="Login / Sign Up"
            >
              Login / Signup
            </button>
          ) : (
            <>
              {/* 🔹 Profile Avatar + Dropdown */}
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-1 bg-white text-sky-700 px-3 py-1.5 rounded-full hover:bg-gray-100 transition"
              >
                <UserCircle size={22} />
                <span className="text-sm font-medium">
                  {user?.name || user?.email?.split("@")[0]}
                </span>
                <ChevronDown size={16} />
              </button>

              {/* 🔽 Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white text-gray-800 rounded-md shadow-md border border-gray-200 py-2 z-50">
                  {/* Profile */}
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm gap-2"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <UserCircle size={16} /> Profile
                  </Link>

                  {/* Dashboard (Role-based) */}
                  {role === "doctor" && (
                    <Link
                      to="/doctor/dashboard"
                      className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm gap-2"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Stethoscope size={16} /> Dashboard
                    </Link>
                  )}
                  {role === "patient" && (
                    <Link
                      to="/patient/dashboard"
                      className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm gap-2"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <UserCircle size={16} /> Dashboard
                    </Link>
                  )}

                  <hr className="my-1 border-gray-200" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 text-sm gap-2 text-red-600"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </nav>

      {/* 🔹 Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        isLogin={isLogin}
        onClose={() => setShowAuthModal(false)}
        setIsLogin={setIsLogin}
      />
    </>
  );
};

export default Navbar;
