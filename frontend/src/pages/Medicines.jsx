import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProduct } from "../hooks/useProduct";
import ProductList from "../components/product/ProductList";
import LoadingSpinner from "../components/LoadSpinner";

const Medicines = () => {
  const {
    categories,
    loading,
    selectedCategory,
    setSelectedBrand,
    setSelectedCategory,
    setPriceRange,
    setSortBy,
    filteredProducts,
    setSearchTerm,
    searchTerm,
  } = useProduct();

  const [searchParams] = useSearchParams();

  // Handle initial category and brand from URL
  useEffect(() => {
    const initialCategory = searchParams.get("category");
    const initialBrand = searchParams.get("brand");
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialBrand) setSelectedBrand(initialBrand);
  }, [searchParams, setSelectedCategory, setSelectedBrand]);

  // Handle search query from URL
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search");
    if (q) {
      setSearchTerm(q);
    } else {
      // Clear search if no query in URL
      setSearchTerm("");
    }
  }, [searchParams, setSearchTerm]);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        {/* Header with Search Info */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Medicines</h1>
          {searchTerm && (
            <p className="text-gray-600">
              Showing results for: <span className="font-semibold text-gray-900">"{searchTerm}"</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block">
            <div className="card p-6 sticky top-20 rounded-2xl shadow-sm border bg-white">
              <h3 className="text-lg font-bold mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-dark mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      value="All" 
                      checked={selectedCategory === "All"} 
                      onChange={() => setSelectedCategory("All")} 
                    />
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

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-dark mb-3">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} 
                    placeholder="Min" 
                    className="input-field w-24 text-sm" 
                  />
                  <span>-</span>
                  <input 
                    type="number" 
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} 
                    placeholder="Max" 
                    className="input-field w-24 text-sm" 
                  />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h4 className="font-semibold text-dark mb-3">Sort By</h4>
                <select 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className="input-field text-sm w-full"
                  defaultValue="popular"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                    setSelectedBrand("All");
                    setPriceRange([0, 100000]);
                  }}
                  className="mt-6 w-full btn-outline text-sm py-2"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? `No results for "${searchTerm}". Try different keywords.`
                    : "Try adjusting your filters to see more products."}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                    setSelectedBrand("All");
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <ProductList />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Medicines;
