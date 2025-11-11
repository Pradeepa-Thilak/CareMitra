import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadSpinner';
// import { medicineAPI } from '../utils/api';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);

  const categories = ['All', 'Pain Relief', 'Vitamins', 'Cough & Cold', 'Digestive', 'Topical', 'Antibiotics'];

  // Mock medicines data
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
    {
      id: 7,
      name: 'Paracetamol 650mg',
      category: 'Pain Relief',
      price: 35,
      originalPrice: 50,
      discount: 30,
      rating: 4.6,
      reviews: 445,
      image: 'https://via.placeholder.com/200x200?text=Paracetamol',
      description: 'Fast acting pain reliever',
      stock: 80,
    },
    {
      id: 8,
      name: 'Vitamin C 500mg',
      category: 'Vitamins',
      price: 149,
      originalPrice: 200,
      discount: 25,
      rating: 4.5,
      reviews: 389,
      image: 'https://via.placeholder.com/200x200?text=VitaminC',
      description: 'Boost immunity naturally',
      stock: 150,
    },
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMedicines(mockMedicines);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let filtered = medicines;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter((m) => m.price >= priceRange[0] && m.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    setFilteredMedicines(filtered);
  }, [medicines, selectedCategory, searchTerm, sortBy, priceRange]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Medicines</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block">
            <div className="card p-6 sticky top-20">
              <h3 className="text-lg font-bold mb-4">Filters</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-dark mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search medicines..."
                    className="input-field pl-9 text-sm"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold text-dark mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={selectedCategory === cat}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold text-dark mb-3">Price Range</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="input-field w-20 text-sm"
                      min="0"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="input-field w-20 text-sm"
                      max="10000"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h4 className="font-semibold text-dark mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6 flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="input-field flex-1"
              />
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-4">
                  <h4 className="font-semibold text-dark mb-2">Category</h4>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={selectedCategory === cat}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h4 className="font-semibold text-dark mb-2">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field text-sm w-full"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            )}

            {/* Results */}
            <div className="mb-4">
              <p className="text-gray-600">
                Showing {filteredMedicines.length} results
              </p>
            </div>

            {/* Products Grid */}
            {filteredMedicines.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredMedicines.map((medicine) => (
                  <ProductCard
                    key={medicine.id}
                    product={medicine}
                    onViewDetails={() => window.location.href = `/medicine/${medicine.id}`}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No medicines found matching your criteria</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setPriceRange([0, 5000]);
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Medicines;
