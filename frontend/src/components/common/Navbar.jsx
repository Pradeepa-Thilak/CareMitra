// src/components/common/Navbar.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import AuthModal from "../modals/AuthModal";
import {
  Heart,
  LogOut,
  UserCircle,
  Stethoscope,
  HomeIcon,
  ChevronDown,
  ShoppingCart,
  FileText,
  Bot,
  Menu,
  X,
  Search,
} from "lucide-react";
import ProductSearchBarNav from "./ProductSearchBarNav";
import { searchAPI } from "../../utils/api";

const Navbar = () => {
  const { user, role, logout, token } = useContext(AuthContext);
  const { cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();

  // UI states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Refs
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const cartCount = cartItems?.reduce((sum, it) => sum + (it.quantity || 0), 0) ?? 0;
  const wishlistCount = wishlistItems?.length ?? 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  const handleSearch = (query) => {
    if (!query || !query.trim()) return;
    navigate(`/medicines?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <nav className="w-full bg-sky-700 text-white shadow-md fixed top-0 left-0 z-50">
        <div className="w-full max-w-full flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5 lg:py-3">
          
          {/* Left Section: Mobile Menu + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Mobile Hamburger */}
            <button
              className="lg:hidden p-1.5 rounded-md hover:bg-sky-600/60 focus:outline-none transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" fill="currentColor" />
              <span className="text-base sm:text-lg lg:text-xl font-bold tracking-wide whitespace-nowrap">
                CareMitra
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
            <Link to="/" className="px-2.5 py-1.5 rounded-md hover:bg-sky-600/60 transition-colors text-sm whitespace-nowrap">
              Home
            </Link>
            <Link to="/medicines" className="px-2.5 py-1.5 rounded-md hover:bg-sky-600/60 transition-colors text-sm whitespace-nowrap">
              Medicines
            </Link>
            <Link to="/doctors" className="px-2.5 py-1.5 rounded-md hover:bg-sky-600/60 transition-colors text-sm whitespace-nowrap">
              Consultations
            </Link>
            <Link to="/labtests" className="px-2.5 py-1.5 rounded-md hover:bg-sky-600/60 transition-colors text-sm whitespace-nowrap">
              Lab Tests
            </Link>
            <Link to="/ai-chatbot" className="px-2.5 py-1.5 rounded-md hover:bg-sky-600/60 transition-colors text-sm whitespace-nowrap flex items-center gap-1.5">
              <Bot size={16} />
              <span>AI Assistant</span>
            </Link>
          </div>

          {/* Right Section: Search, Cart, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
            
            {/* Desktop Search - Hidden on smaller screens */}
            <div className="hidden xl:block w-64">
              <ProductSearchBarNav
                placeholder="Search medicines..."
                mode="auto"
                searchAPI={searchAPI.advanced}
                onSearch={handleSearch}
              />
            </div>

            {/* Search Icon for tablets */}
            <button
              aria-label="Search"
              className="hidden lg:flex xl:hidden p-2 rounded-md hover:bg-sky-600/60 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 bg-white text-sky-700 px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={18} className="flex-shrink-0" />
              <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Auth / Profile */}
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              {!token ? (
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setShowAuthModal(true);
                  }}
                  className="bg-white text-sky-700 px-2.5 sm:px-3 lg:px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  Login
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="p-1.5 sm:p-2 bg-white text-sky-700 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                    aria-haspopup="menu"
                    aria-expanded={isDropdownOpen}
                    aria-label="User menu"
                  >
                    <UserCircle size={20} className="sm:w-6 sm:h-6" />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-1 z-50"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.name || user?.email?.split("@")[0]}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <UserCircle size={18} />
                          <span>Profile</span>
                        </Link>

                        <Link
                          to="/wishlist"
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="flex items-center gap-3">
                            <Heart size={18} />
                            <span>Wishlist</span>
                          </span>
                          {wishlistCount > 0 && (
                            <span className="text-xs bg-sky-700 text-white px-2 py-0.5 rounded-full font-medium">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>

                        <Link
                          to="/orders"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FileText size={18} />
                          <span>Orders</span>
                        </Link>

                        <Link
                          to="/appointments"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FileText size={18} />
                          <span>Appointments</span>
                        </Link>

                        <Link
                          to="/ai-chatbot"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors lg:hidden"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Bot size={18} />
                          <span>AI Assistant</span>
                        </Link>

                        {role === "doctor" && (
                          <Link
                            to="/doctor/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Stethoscope size={18} />
                            <span>Dashboard</span>
                          </Link>
                        )}

                        {role === "patient" && (
                          <Link
                            to="/patient/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <UserCircle size={18} />
                            <span>Dashboard</span>
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-red-50 text-sm text-red-600 transition-colors"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Below Navbar */}
        <div className="lg:hidden xl:hidden border-t border-sky-600 px-3 py-2">
          <ProductSearchBarNav
            placeholder="Search medicines..."
            mode="auto"
            searchAPI={searchAPI.basic}
            onSearch={handleSearch}
          />
        </div>
      </nav>

      {/* MOBILE SIDE MENU */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Slide Menu */}
          <div
            ref={mobileMenuRef}
            className="lg:hidden fixed left-0 top-0 bottom-0 w-64 sm:w-72 bg-sky-700 text-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-sky-600">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-white" fill="currentColor" />
                <span className="text-lg font-bold">CareMitra</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-md hover:bg-sky-600/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-3 space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-sky-600/60 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HomeIcon size={20} />
                <span>Home</span>
              </Link>

              <Link
                to="/medicines"
                className="block px-3 py-2.5 rounded-md hover:bg-sky-600/60 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Medicines
              </Link>

              <Link
                to="/doctors"
                className="block px-3 py-2.5 rounded-md hover:bg-sky-600/60 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Consultations
              </Link>

              <Link
                to="/labtests"
                className="block px-3 py-2.5 rounded-md hover:bg-sky-600/60 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Lab Tests
              </Link>

              <Link
                to="/ai-chatbot"
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-sky-600/60 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Bot size={20} />
                <span>AI Assistant</span>
              </Link>
            </nav>

            {/* User Section */}
            {token && (
              <div className="mt-3 p-3 border-t border-sky-600">
                <h3 className="text-xs font-semibold text-sky-200 uppercase tracking-wider mb-2 px-3">
                  My Account
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-sky-600/60 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserCircle size={20} />
                    <span>Profile</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-sky-600/60 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <Heart size={20} />
                      <span>Wishlist</span>
                    </span>
                    {wishlistCount > 0 && (
                      <span className="text-xs bg-white text-sky-700 px-2 py-0.5 rounded-full font-medium">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/orders"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-sky-600/60 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FileText size={20} />
                    <span>Orders</span>
                  </Link>

                  <Link
                    to="/appointments"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-sky-600/60 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FileText size={20} />
                    <span>Appointments</span>
                  </Link>

                  {role === "doctor" && (
                    <Link
                      to="/doctor/dashboard"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-sky-600/60 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Stethoscope size={20} />
                      <span>Dashboard</span>
                    </Link>
                  )}

                  {role === "patient" && (
                    <Link
                      to="/patient/dashboard"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-sky-600/60 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserCircle size={20} />
                      <span>Dashboard</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-md hover:bg-red-600/20 transition-colors text-red-200 mt-2"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Login Button for non-authenticated users */}
            {!token && (
              <div className="p-3 border-t border-sky-600">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setShowAuthModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2.5 bg-white text-sky-700 rounded-md hover:bg-gray-100 transition-colors font-medium"
                >
                  Login / Signup
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Auth Modal */}
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