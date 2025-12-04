import React from "react";
import { motion } from "framer-motion";
import CategorySection from "../components/product/CategorySection";
import ProductSearchBar from "../components/product/ProductSearchBar";
import BrandSection from "../components/product/BrandSection";
import ProductCard from "../components/product/ProductCard";

// Decorative Home page inspired by the clean, friendly look of Tata 1mg
// - keeps the same component structure and places (CategorySection, BrandSection)
// - adds a more vibrant hero, search placement, cards, and subtle motion
// - requires Tailwind CSS and framer-motion (framer-motion is optional — remove imports/usage if you don't want it)

const QuickStat = ({ label, value }) => (
  <div className="flex flex-col items-center p-3 bg-white/60 backdrop-blur rounded-2xl shadow-sm min-w-[110px]">
    <div className="text-sky-700 font-semibold text-lg">{value}</div>
    <div className="text-xs text-gray-600">{label}</div>
  </div>
);

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-12">
      <div className="container-custom px-4">

        {/* Hero */}
        <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-10">
          {/* Left: Text + Search + Quick stats */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <div className="rounded-2xl p-6 lg:p-10 bg-gradient-to-r from-sky-50 to-white shadow-lg">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-sky-800 leading-tight mb-2">
                CareMitra — your neighbourhood health companion
              </h1>
              <p className="text-gray-600 max-w-xl mb-4">
                Find medicines, lab tests and healthcare products quickly. Trusted sellers, verified medical information and fast delivery.
              </p>

              {/* Search bar (keeps core functionality) */}
              {/* <div className="mt-3">
                <ProductSearchBar className="shadow-md" />
              </div> */}

              {/* Quick stats */}
              <div className="mt-6 flex gap-3">
                <QuickStat label="Brands" value="250+" />
                <QuickStat label="Medicines" value="12k+" />
                <QuickStat label="Orders" value="1M+" />
              </div>
            </div>

            {/* Small feature cards */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[220px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-sky-700">Consultation Support</h3>
                <p className="text-sm text-gray-600 mt-1">Get help picking the right medicine or lab test.</p>
              </div>

              <div className="flex-1 min-w-[220px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-sky-700">Verified Sellers</h3>
                <p className="text-sm text-gray-600 mt-1">All pharmacies are verified for quality and safety.</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Decorative card with hero illustration (keeps layout) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100">
              {/* Replace the placeholder below with an image or illustration asset if you have one */}
              <div className="h-56 bg-[url('/assets/hero-health.svg')] bg-center bg-cover sm:h-64 lg:h-72" />

              <div className="p-6">
                <h4 className="text-sky-800 font-bold text-lg">Daily Health Essentials</h4>
                <p className="text-sm text-gray-600 mt-2">Curated list of medicines and wellness products recommended by pharmacists.</p>

                <div className="mt-4 flex gap-3">
                  <button className="px-4 py-2 rounded-full border border-sky-200 text-sky-700 text-sm">Shop Medicines</button>
                  <button className="px-4 py-2 rounded-full bg-sky-700 text-white text-sm">Book Lab Test</button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Category Section (keeps existing component & placement) */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Browse by Category</h2>
          <CategorySection />
        </section>

        {/* Featured/Popular products strip (decorative, optional) */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Popular right now</h2>

          {/* Horizontal carousel: simple, dependency-free, touch-friendly */}
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="min-w-[200px] flex-shrink-0">
                  {/* Swap this inline product object with real product data when available */}
                  <ProductCard product={{ id: i, name: `Sample Product ${i + 1}`, price: '₹99', image: null }} />
                </div>
              ))}
            </div>

            {/* Left / Right chevrons for desktop (optional; purely visual) */}
            <div className="hidden md:flex absolute inset-y-0 left-0 items-center pl-2">
              <button className="bg-white/70 backdrop-blur rounded-full p-2 shadow-sm">◀</button>
            </div>
            <div className="hidden md:flex absolute inset-y-0 right-0 items-center pr-2">
              <button className="bg-white/70 backdrop-blur rounded-full p-2 shadow-sm">▶</button>
            </div>
          </div>
        </section>

        {/* Brand Section (keeps existing component & placement) */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Trusted Brands</h2>
          <BrandSection />
        </section>

      </div>
    </div>
  );
};

export default Home;
