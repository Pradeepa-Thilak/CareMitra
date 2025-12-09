import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CategorySection from "../components/product/CategorySection";
import ProductSearchBar from "../components/product/ProductSearchBar";
import BrandSection from "../components/product/BrandSection";
import ProductCard from "../components/product/ProductCard";
// Optional API helper - use your existing api instance if present
import api from "../utils/api";

const QuickStat = ({ label, value }) => (
  <div className="flex flex-col items-center p-3 bg-white/60 backdrop-blur rounded-2xl shadow-sm min-w-[110px]">
    <div className="text-sky-700 font-semibold text-lg">{value}</div>
    <div className="text-xs text-gray-600">{label}</div>
  </div>
);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback sample products (used if API is not available)
  const sampleProducts = Array.from({ length: 8 }).map((_, i) => ({
    id: `sample-${i}`,
    _id: `sample-${i}`,
    name: `Sample Medicine ${i + 1}`,
    price: 199 + i * 25,
    discountedPrice: i % 2 === 0 ? 149 + i * 20 : undefined,
    brand: { name: i % 2 ? "HealthCo" : "MediPlus" },
    category: { name: "General" },
    rating: 4.2 - (i % 3) * 0.3,
    reviews: 10 + i * 3,
    images: [],
    stock: i % 4 === 0 ? 0 : 20,
  }));

  useEffect(() => {
    let mounted = true;
    // Try to fetch products from backend; fallback to sampleProducts on error
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // If you don't have an API, this will throw and use the fallback.
        const res = await api.get("/products?limit=24"); // adapt endpoint as needed
        if (!mounted) return;
        const data = res.data?.products || res.data || [];
        setProducts(Array.isArray(data) ? data : sampleProducts);
      } catch (err) {
        // fallback
        setProducts(sampleProducts);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

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

              <div className="mt-3">
                <ProductSearchBar className="shadow-md" />
              </div>

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

          {/* Right: Decorative card with hero illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100">
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

        {/* Category Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Browse by Category</h2>
          <CategorySection />
        </section>

        {/* Popular products grid */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Popular right now</h2>
            <div className="text-sm text-gray-500">{loading ? "Loading..." : `${products.length} items`}</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Brand Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Trusted Brands</h2>
          <BrandSection />
        </section>

      </div>
    </div>
  );
};

export default Home;
