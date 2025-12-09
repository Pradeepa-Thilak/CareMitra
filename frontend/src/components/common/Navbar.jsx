// src/components/common/Navbar.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useCart } from "../../hooks/useCart";
// import { useWishlist } from "../../hooks/useWishlist"; 
import AuthModal from "../modals/AuthModal";
import ProductSearchBar from "../../components/product/ProductSearchBar";
import {
  Heart,
  LogOut,
  UserCircle,
  Stethoscope,
  HomeIcon,
  ChevronDown,
  ShoppingCart,
  FileText,
} from "lucide-react";

const Navbar = () => {
  const { user, role, logout, token } = useContext(AuthContext);
  const { cartItems } = useCart();
  // const { items: wishlistItems } = useWishlist(); // <- added
  const navigate = useNavigate();

  const cartCount = cartItems?.reduce((sum, it) => sum + (it.quantity || 0), 0) ?? 0;
  // const wishlistCount = wishlistItems?.length ?? 0; // number to display

  const navRef = useRef(null);
  // keeps track of nav height variable for page layout
  useEffect(() => {
    const setNavOffset = () => {
      if (navRef.current) {
        const h = navRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty("--nav-offset", `${h}px`);
      }
    };

    setNavOffset();
    const ro = new ResizeObserver(setNavOffset);
    if (navRef.current) ro.observe(navRef.current);
    window.addEventListener("resize", setNavOffset);
    return () => {
      window.removeEventListener("resize", setNavOffset);
      if (ro && navRef.current) ro.unobserve(navRef.current);
    };
  }, []);

  // modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // desktop profile dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef();

  // close dropdown or mobile menu on outside click or Escape
  useEffect(() => {
    const handleOutside = (e) => {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isDropdownOpen, isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsDropdownOpen(false);
  };

  return (
    <>
      <nav
        ref={navRef}
        className="w-full bg-sky-700 text-white shadow-md fixed top-0 left-0 z-50"
      >
        <div className="container-custom flex items-center justify-between px-4 md:px-6 py-3">
          {/* Left: Logo + mobile hamburger */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-sky-600/60 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((s) => !s)}
            >
              {/* simple hamburger icon (three lines) */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-white" />
              <span className="text-2xl font-semibold tracking-wide">CareMitra</span>
            </Link>
          </div>

          {/* Center: Links (hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/" className="hover:text-gray-200 flex items-center gap-1">
              <HomeIcon size={18} /> <span>Home</span>
            </Link>
            <Link to="/medicines" className="hover:text-gray-200">Medicines</Link>
            <Link to="/doctors" className="hover:text-gray-200">Consultations</Link>
            <Link to="/labtests" className="hover:text-gray-200">Lab Tests</Link>
          </div>

          {/* Right area */}
          <div className="flex items-center gap-3">
            {/* Search - compact on small screens, full on md+ */}
            <div className="hidden md:flex items-center">
              <div className="w-[360px]">
                <ProductSearchBar placeholder="Search medicines, brands, symptoms..." />
              </div>
            </div>

            {/* Mobile: small search icon that opens a full width search when tapped */}
            <div className="md:hidden">
              <button
                aria-label="Open search"
                className="p-2 rounded-md hover:bg-sky-600/60 focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => {
                  // open mobile menu and focus search inside it for convenience
                  setIsMobileMenuOpen(true);
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {/* Cart - desktop shows label, mobile shows icon */}
            <div className="hidden md:block relative">
              <Link
                to="/cart"
                className="flex items-center space-x-2 bg-white text-sky-700 px-3 py-1.5 rounded-full hover:bg-gray-100 transition"
              >
                <ShoppingCart size={18} />
                <span className="text-sm font-medium">Cart</span>
              </Link>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </div>

            <div className="md:hidden relative">
              <Link
                to="/cart"
                className="relative inline-flex items-center justify-center p-2 bg-white text-sky-700 rounded-full hover:bg-gray-100 transition"
                aria-label="Cart"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white bg-red-600 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Auth / profile */}
            <div className="relative" ref={dropdownRef}>
              {!token ? (
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setShowAuthModal(true);
                  }}
                  className="bg-white text-sky-700 px-3 py-1 rounded-full hover:bg-gray-100 transition text-sm"
                >
                  Login / Signup
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center space-x-2 bg-white text-sky-700 px-3 py-1.5 rounded-full hover:bg-gray-100 transition"
                    aria-haspopup="menu"
                    aria-expanded={isDropdownOpen}
                  >
                    <UserCircle size={20} />
                    <span className="text-sm font-medium hidden sm:inline">
                      {user?.name || user?.email?.split("@")[0]}
                    </span>
                    <ChevronDown size={14} />
                  </button>

                  {isDropdownOpen && (
                    <div
                      role="menu"
                      aria-label="Profile menu"
                      className="absolute right-0 top-12 w-56 bg-white text-gray-800 rounded-md shadow-md border border-gray-200 py-2 z-50"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm gap-2"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <UserCircle size={16} /> Profile
                      </Link>

                      {/* Wishlist entry */}
                      <Link
                        to="/wishlist"
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm gap-2 justify-between"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <Heart size={16} /> Wishlist
                        </span>
                        {wishlistCount > 0 && (
                          <span className="text-xs bg-sky-700 text-white px-2 py-0.5 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>

                      {/* Orders entry */}
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm gap-2"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FileText size={16} /> Orders
                      </Link>

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
          </div>
        </div>

        {/* MOBILE SLIDE DOWN MENU */}
        <div
          ref={mobileMenuRef}
          className={`md:hidden bg-sky-700 text-white border-t border-sky-600 transition-all duration-200 overflow-hidden ${
            isMobileMenuOpen ? "max-h-[400px]" : "max-h-0"
          }`}
        >
          <div className="px-4 py-3">
            {/* bring search to top of mobile menu */}
            <div className="mb-3">
              <ProductSearchBar placeholder="Search medicines, brands, symptoms..." />
            </div>

            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                className="px-2 py-2 rounded-md hover:bg-sky-600/40"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/doctors"
                className="px-2 py-2 rounded-md hover:bg-sky-600/40"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Find Doctors
              </Link>
              <Link
                to="/medicines"
                className="px-2 py-2 rounded-md hover:bg-sky-600/40"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Medicines
              </Link>
              <Link
                to="/labtests"
                className="px-2 py-2 rounded-md hover:bg-sky-600/40"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Lab Tests
              </Link>

              <div className="mt-2 border-t border-sky-600 pt-3">
                {!token ? (
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      setShowAuthModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-2 rounded-md hover:bg-sky-600/40"
                  >
                    Login / Signup
                  </button>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="px-2 py-2 rounded-md hover:bg-sky-600/40"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>

                    {/* Wishlist (mobile) */}
                    <Link
                      to="/wishlist"
                      className="px-2 py-2 rounded-md hover:bg-sky-600/40 flex items-center justify-between"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="flex items-center gap-2"><Heart size={16}/> Wishlist</span>
                      {wishlistCount > 0 && <span className="text-xs bg-white text-sky-700 px-2 py-0.5 rounded-full">{wishlistCount}</span>}
                    </Link>

                    {/* Orders (mobile) */}
                    <Link
                      to="/orders"
                      className="px-2 py-2 rounded-md hover:bg-sky-600/40"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>

                    {role === "doctor" && (
                      <Link
                        to="/doctor/dashboard"
                        className="px-2 py-2 rounded-md hover:bg-sky-600/40"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}

                    {role === "patient" && (
                      <Link
                        to="/patient/dashboard"
                        className="px-2 py-2 rounded-md hover:bg-sky-600/40"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-2 rounded-md hover:bg-sky-600/40 text-red-200"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </nav>

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
