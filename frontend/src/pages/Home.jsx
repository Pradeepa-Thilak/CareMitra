// src/pages/Home.jsx
import React from "react";
import CategorySection from "../components/product/CategorySection";
import ProductSearchBar from "../components/product/ProductSearchBar";
import BrandSection from "../components/product/BrandSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">

        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-3xl font-bold text-sky-700 mb-4">
            Welcome to CareMitra
          </h1>
          <p className="text-gray-600 max-w-xl">
            Find medicines, lab tests, and health products — quick and trusted.
          </p>

        </div>

        {/* Category Section */}
        <CategorySection />

        {/* Brand Section */}
        <BrandSection />

        {/* Later: BrandSection, Featured products, etc. */}
      </div>
    </div>
  );
};

export default Home;
