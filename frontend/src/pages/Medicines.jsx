import React, { useEffect, useState, useRef } from "react";
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
    priceRange,
    sortBy,
  } = useProduct();

  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination state - Get from URL or default to 1
  const [currentPage, setCurrentPage] = useState(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    return page;
  });
  const productsPerPage = 12;

  // Track if it's the first render to avoid resetting page
  const isFirstRender = useRef(true);
  const prevProductsLength = useRef(filteredProducts.length);

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });}, []);
  // Debug logging
  useEffect(() => {
    console.log("Current Page:", currentPage);
    console.log("Total Products:", filteredProducts.length);
    console.log("Products Per Page:", productsPerPage);
    console.log("Current Products:", currentProducts);
    console.log("Index Range:", indexOfFirstProduct, "-", indexOfLastProduct);
  }, [
    currentPage,
    filteredProducts,
    currentProducts,
    indexOfFirstProduct,
    indexOfLastProduct,
  ]);

  // Handle initial category and brand from URL
  useEffect(() => {
    const initialCategory = searchParams.get("category");
    const initialBrand = searchParams.get("brand");
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialBrand) setSelectedBrand(initialBrand);
  }, []); // Run only once on mount

  // Handle search query from URL
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search");
    if (q) {
      setSearchTerm(q);
    } else {
      setSearchTerm("");
    }
  }, []); // Run only once on mount

  // Reset to page 1 ONLY when the filtered products actually change (not just re-render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only reset if the number of products changed
    if (prevProductsLength.current !== filteredProducts.length) {
      prevProductsLength.current = filteredProducts.length;
      setCurrentPage(1);
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", "1");
      setSearchParams(newParams, { replace: true });
    }
  }, [filteredProducts.length]);

  // Scroll to top when page changes
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;

    setCurrentPage(pageNumber);

    // Update URL with new page number
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", pageNumber.toString());
    setSearchParams(newParams, { replace: true });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        {/* Header with Search Info */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Medicines</h1>
          {searchTerm && (
            <p className="text-gray-600">
              Showing results for:{" "}
              <span className="font-semibold text-gray-900">
                "{searchTerm}"
              </span>
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
                    <label
                      key={cat._id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.key ?? cat.name}
                        checked={selectedCategory === (cat.key ?? cat.name)}
                        onChange={() =>
                          setSelectedCategory(cat.key ?? cat.name)
                        }
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
                    value={priceRange?.[0] || ""}
                    onChange={(e) =>
                      setPriceRange([
                        Number(e.target.value) || 0,
                        priceRange?.[1] || 100000,
                      ])
                    }
                    placeholder="Min"
                    className="input-field w-24 text-sm"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={priceRange?.[1] || ""}
                    onChange={(e) =>
                      setPriceRange([
                        priceRange?.[0] || 0,
                        Number(e.target.value) || 100000,
                      ])
                    }
                    placeholder="Max"
                    className="input-field w-24 text-sm"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h4 className="font-semibold text-dark mb-3">Sort By</h4>
                <select
                  value={sortBy || "popular"}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field text-sm w-full"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || selectedCategory !== "All") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                    setSelectedBrand("All");
                    setPriceRange([0, 100000]);
                    setSortBy("popular");
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
                Showing{" "}
                {filteredProducts.length > 0 ? indexOfFirstProduct + 1 : 0}-
                {Math.min(indexOfLastProduct, filteredProducts.length)} of{" "}
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </p>
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
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
                    setPriceRange([0, 100000]);
                    setSortBy("popular");
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {currentProducts.length > 0 ? (
                  <ProductList
                    products={currentProducts}
                    loading={loading}
                    currentPage={currentPage}
                  />
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <p className="text-gray-600">Loading products...</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                      >
                        Previous
                      </button>

                      {/* Page Numbers */}
                      {getPageNumbers().map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-2 text-gray-500"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg border transition-colors ${
                              currentPage === page
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                      >
                        Next
                      </button>
                    </div>

                    {/* Page info */}
                    <p className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Medicines;
