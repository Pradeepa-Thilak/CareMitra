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
          {/* Modal Container */}
          <motion.div
            className="relative bg-white rounded-xl shadow-xl w-[90%] max-w-lg p-6 border border-gray-200"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl"
            >
              ✕
            </button>

            {/* Login / Signup */}
            {isLogin ? (
              <Login closeModal={onClose} setMethod={setIsLogin} />
            ) : (
              <Signup
                closeModal={onClose}
                setMethod={setIsLogin}
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
