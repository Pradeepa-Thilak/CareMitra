import React, { useState } from "react";
import AuthModal from "../components/modals/AuthModal";

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-sky-700 mb-6">
        Welcome to CareMitra
      </h1>

      {/* Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => {
            setIsLogin(true);
            setShowModal(true);
          }}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Login
        </button>
        <button
          onClick={() => {
            setIsLogin(false);
            setShowModal(true);
          }}
          className="border border-red-600 text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-50 transition"
        >
          Sign Up
        </button>
      </div>

      {/* Modal */}
      <AuthModal
        isOpen={showModal}
        isLogin={isLogin}
        onClose={() => setShowModal(false)}
        setIsLogin={setIsLogin}
      />
    </div>
  );
};

export default Home;
