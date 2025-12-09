// src/pages/Medicines.jsx
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import ProductList from '../components/product/ProductList';
import ProductSearchBar from '../components/product/ProductSearchBar';
import { useProduct } from '../hooks/useProduct';
import LoadingSpinner from '../components/LoadSpinner';

const Medicines = () => {
  const {
    categories,            // available categories
    loading,
    searchTerm,
    setSearchTerm,
    setSelectedBrand,
    selectedCategory,
    setSelectedBrand,
    setSelectedCategory,
    setPriceRange,
    setSortBy,
    filteredProducts,
  } = useProduct();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

 useEffect(() => {
    const initialCategory = searchParams.get('category');
    const initialBrand = searchParams.get('brand');
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialBrand) setSelectedBrand(initialBrand);
  }, [searchParams, setSelectedCategory, setSelectedBrand]);
  
  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-6">Medicines</h1>

        {/* Search + Filters */}
        <div className="mb-6">
          <ProductSearchBar placeholder="Search medicines or brands..." />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block">
            <div className="card p-6 sticky top-20">
              <h3 className="text-lg font-bold mb-4">Filters</h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold text-dark mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" value="All" checked={selectedCategory === 'All'} onChange={() => setSelectedCategory('All')} />
                    <span className="text-sm">All</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat.key ?? cat.name}
                        checked={selectedCategory === (cat.key ?? cat.name)}
                        onChange={() => setSelectedCategory(cat.key ?? cat.name)}
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold text-dark mb-3">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input type="number" onChange={(e) => setPriceRange([Number(e.target.value), undefined])} placeholder="min" className="input-field w-24 text-sm" />
                  <span>-</span>
                  <input type="number" onChange={(e) => setPriceRange([undefined, Number(e.target.value)])} placeholder="max" className="input-field w-24 text-sm" />
                </div>
              </div>

              {/* Sort */}
              <div>
                <h4 className="font-semibold text-dark mb-3">Sort By</h4>
                <select value={''} onChange={(e) => setSortBy(e.target.value)} className="input-field text-sm w-full">
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <p className="text-gray-600">Showing {filteredProducts.length} results</p>
            </div>

            <ProductList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Medicines;
