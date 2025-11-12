import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Login from "../../pages/Login";
import Signup from "../../pages/Signup";

const AuthModal = ({ isOpen, isLogin, setIsLogin, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 🔹 Modal Container */}
          <motion.div
            className="relative bg-white rounded-xl shadow-2xl w-[90%] max-w-sm p-6 border border-gray-200"
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
          >
            {/* 🔸 Close Button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl font-semibold"
              aria-label="Close"
            >
              ✕
            </button>

            {/* 🔸 Dynamic Content */}
            {isLogin ? (
              <Login setMethod={setIsLogin} closeModal={onClose} />
            ) : (
              <Signup
                setMethod={setIsLogin}
                closeModal={onClose}
                onSignupSuccess={() => setIsLogin(true)}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
