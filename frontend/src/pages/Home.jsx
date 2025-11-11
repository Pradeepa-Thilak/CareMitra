import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Pill, Stethoscope, Beaker, Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadSpinner';
import Footer from '../components/Footer';
// import Login from './Login';
// import { medicineAPI } from '../utils/api';

const Home = () => {
  const [featuredMedicines, setFeaturedMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [medicinesRes, categoriesRes] = await Promise.all([
  //         medicineAPI.getFeatured(),
  //         medicineAPI.getCategories(),
  //       ]);
  //       setFeaturedMedicines(medicinesRes.data || []);
  //       setCategories(categoriesRes.data || []);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // Mock data for featured medicines
  const mockMedicines = [
    {
      id: 1,
      name: 'Aspirin 500mg',
      category: 'Pain Relief',
      price: 45,
      originalPrice: 60,
      discount: 25,
      rating: 4.5,
      reviews: 234,
      image: 'https://via.placeholder.com/200x200?text=Aspirin',
      description: 'Effective pain relief and fever reduction',
      stock: 50,
    },
    {
      id: 2,
      name: 'Vitamin D3 1000IU',
      category: 'Vitamins',
      price: 199,
      originalPrice: 250,
      discount: 20,
      rating: 4.8,
      reviews: 456,
      image: 'https://via.placeholder.com/200x200?text=VitaminD',
      description: 'Essential vitamin for bone health',
      stock: 100,
    },
    {
      id: 3,
      name: 'Cough Syrup 100ml',
      category: 'Cough & Cold',
      price: 89,
      originalPrice: 120,
      discount: 26,
      rating: 4.3,
      reviews: 178,
      image: 'https://via.placeholder.com/200x200?text=CoughSyrup',
      description: 'Fast relief from cough and cold',
      stock: 75,
    },
    {
      id: 4,
      name: 'Antacid Tablets',
      category: 'Digestive',
      price: 65,
      originalPrice: 85,
      discount: 24,
      rating: 4.6,
      reviews: 312,
      image: 'https://via.placeholder.com/200x200?text=Antacid',
      description: 'Relief from acidity and heartburn',
      stock: 60,
    },
    {
      id: 5,
      name: 'Multivitamin Tablets',
      category: 'Vitamins',
      price: 299,
      originalPrice: 399,
      discount: 25,
      rating: 4.7,
      reviews: 567,
      image: 'https://via.placeholder.com/200x200?text=Multivitamin',
      description: 'Complete nutritional support',
      stock: 120,
    },
    {
      id: 6,
      name: 'Antibiotic Cream 30g',
      category: 'Topical',
      price: 129,
      originalPrice: 165,
      discount: 22,
      rating: 4.4,
      reviews: 289,
      image: 'https://via.placeholder.com/200x200?text=Cream',
      description: 'Effective for minor cuts and wounds',
      stock: 45,
    },
  ];

  // Mock categories
  const mockCategories = [
    { id: 1, name: 'Medicines', icon: Pill, count: 5000 },
    { id: 2, name: 'Doctors', icon: Stethoscope, count: 500 },
    { id: 3, name: 'Lab Tests', icon: Beaker, count: 200 },
    { id: 4, name: 'Wellness', icon: Heart, count: 1000 },
  ];

  // if (loading) {
  //   return <LoadingSpinner fullPage />;
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}

      <section className="bg-gradient-to-r from-blue-600 to-blue-300 text-white py-12 md:py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Your Health, Our Priority
              </h1>
              <p className="text-lg mb-6 opacity-90">
                Get medicines delivered to your doorstep, consult doctors online, and book lab tests—all in one place.
              </p>
              <div className="flex gap-4">
                <Link to="/medicines" className="btn-primary  text-primary hover:bg-gray-100">
                  Shop Now
                </Link>
                <Link to="/doctors" className="btn-outline border-white text-white hover:bg-white hover:bg-opacity-10">
                  Consult Doctor
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-64 h-64 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Pill className="w-32 h-32 opacity-30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  to={`/search?category=${category.name.toLowerCase()}`}
                  className="card p-6 text-center hover:shadow-lg transition-all hover:scale-105"
                >
                  <Icon className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-dark mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} items</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Medicines Section */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Medicines</h2>
            <Link to="/medicines" className="flex items-center gap-2 text-primary hover:gap-3 transition-all">
              View All <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featuredMedicines.length > 0 ? featuredMedicines : mockMedicines).map((medicine) => (
              <ProductCard
                key={medicine.id}
                product={medicine}
                onViewDetails={() => window.location.href = `/medicine/${medicine.id}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Medicine Delivery */}
            <div className="card p-8 text-center">
              <Pill className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Medicine Delivery</h3>
              <p className="text-gray-600">
                Get authentic medicines delivered to your doorstep with fast and reliable service.
              </p>
            </div>

            {/* Doctor Consultation */}
            <div className="card p-8 text-center">
              <Stethoscope className="w-16 h-16 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Doctor Consultation</h3>
              <p className="text-gray-600">
                Consult certified doctors via chat or video call for professional medical advice.
              </p>
            </div>

            {/* Lab Tests */}
            <div className="card p-8 text-center">
              <Beaker className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Lab Tests</h3>
              <p className="text-gray-600">
                Book diagnostic tests and get digital reports delivered to your email instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="py-12 bg-light">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8">Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-600 to-primary text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">First Order Discount</h3>
              <p className="mb-4">Get 20% off on your first medicine order</p>
              <Link to="/medicines" className="btn-primary bg-white text-primary hover:bg-gray-100">
                Shop Now
              </Link>
            </div>
            <div className="bg-gradient-to-r from-orange-600 to-secondary text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">Lab Tests Offer</h3>
              <p className="mb-4">Book 2 tests and get 15% discount on total</p>
              <Link to="/lab-tests" className="btn-primary bg-white text-secondary hover:bg-gray-100">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-pink-400 to-blue-600 text-white p-12 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-4">Join CareMitra Today</h2>
            <p className="text-lg mb-6 opacity-90">
              Get access to medicines, doctors, and lab tests all in one place
            </p>
            <Link to="/register" className="btn-primary bg-white text-primary hover:bg-gray-100">
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
