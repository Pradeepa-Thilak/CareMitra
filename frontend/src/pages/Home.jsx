// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Pill, 
  Stethoscope, 
  FlaskConical, 
  Shield, 
  Truck, 
  Clock, 
  Star,
  Search,
  TrendingUp,
  Heart,
  Package,
  Zap,
  CheckCircle
} from "lucide-react";
import CategorySection from "../components/product/CategorySection";
import BrandSection from "../components/product/BrandSection";
import ProductCard from "../components/product/ProductCard";
import { useProduct } from "../hooks/useProduct";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const Home = () => {
  const navigate = useNavigate();
  const { filteredProducts, loading } = useProduct();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    // Get top 8 products for featured section
    if (filteredProducts.length > 0) {
      setFeaturedProducts(filteredProducts.slice(0, 8));
    }
  }, [filteredProducts]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative container-custom max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">India's Trusted Health Partner</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Your Health,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  Our Priority
                </span>
              </h1>

              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl">
                Order medicines, book lab tests, and consult doctors online. 
                Fast delivery, verified products, and expert care at your fingertips.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/medicines')}
                  className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <Pill className="w-5 h-5" />
                  Order Medicines
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/labtests')}
                  className="bg-blue-800/50 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-800/70 transition-all flex items-center justify-center gap-2"
                >
                  <FlaskConical className="w-5 h-5" />
                  Book Lab Test
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">10M+</div>
                  <div className="text-sm text-blue-200">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">15K+</div>
                  <div className="text-sm text-blue-200">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">24/7</div>
                  <div className="text-sm text-blue-200">Support</div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Feature Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {/* Card 1 */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-300" />
                </div>
                <h3 className="font-bold text-lg mb-2">100% Authentic</h3>
                <p className="text-sm text-blue-200">All medicines are verified and genuine</p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mt-8"
              >
                <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-yellow-300" />
                </div>
                <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
                <p className="text-sm text-blue-200">Get medicines at your doorstep</p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center mb-4">
                  <Stethoscope className="w-6 h-6 text-purple-300" />
                </div>
                <h3 className="font-bold text-lg mb-2">Expert Doctors</h3>
                <p className="text-sm text-blue-200">Consult certified professionals</p>
              </motion.div>

              {/* Card 4 */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mt-8"
              >
                <div className="w-12 h-12 bg-pink-400/20 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-pink-300" />
                </div>
                <h3 className="font-bold text-lg mb-2">24/7 Available</h3>
                <p className="text-sm text-blue-200">Order anytime, anywhere</p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-16 fill-current text-white">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom max-w-7xl mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Service 1 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -10 }}
              onClick={() => navigate('/medicines')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-gray-100 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Order Medicines</h3>
              <p className="text-gray-600 mb-4">
                Browse 15,000+ medicines with prescription upload facility and expert guidance
              </p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:gap-3 transition-all">
                Shop Now <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </motion.div>

            {/* Service 2 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -10 }}
              onClick={() => navigate('/labtests')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-gray-100 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FlaskConical className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Book Lab Tests</h3>
              <p className="text-gray-600 mb-4">
                Book lab tests at home with certified labs and get reports online
              </p>
              <div className="flex items-center text-green-600 font-semibold group-hover:gap-3 transition-all">
                Book Now <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </motion.div>

            {/* Service 3 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -10 }}
              onClick={() => navigate('/doctors')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-gray-100 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Consult Doctors</h3>
              <p className="text-gray-600 mb-4">
                Connect with certified doctors online for instant consultation
              </p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 transition-all">
                Consult Now <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose CareMitra?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to making healthcare accessible, affordable, and convenient for everyone
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "100% Authentic", desc: "Verified medicines from trusted sources", color: "green" },
              { icon: Truck, title: "Fast Delivery", desc: "Same-day delivery in select areas", color: "blue" },
              { icon: Star, title: "Best Prices", desc: "Competitive pricing with regular discounts", color: "yellow" },
              { icon: CheckCircle, title: "Easy Returns", desc: "Hassle-free return and refund policy", color: "purple" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className={`w-16 h-16 bg-${item.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container-custom max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600">Find exactly what you need from our wide range of categories</p>
          </motion.div>
          <CategorySection />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Trending and most popular medicines</p>
            </div>
            <button
              onClick={() => navigate('/medicines')}
              className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, idx) => (
                <motion.div
                  key={product._id || product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <button
              onClick={() => navigate('/medicines')}
              className="btn-primary px-8 py-3"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Trusted Brands */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted Brands</h2>
            <p className="text-xl text-gray-600">We partner with the world's leading healthcare brands</p>
          </motion.div>
          <BrandSection />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container-custom max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Take Care of Your Health?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join millions of satisfied customers who trust CareMitra for their healthcare needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/medicines')}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl"
              >
                Start Shopping
              </button>
              <button
                onClick={() => navigate('/doctors')}
                className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all border-2 border-white/30"
              >
                Consult a Doctor
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Add custom animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Home;