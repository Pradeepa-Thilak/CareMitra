import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Clock, TrendingUp, Loader2 } from "lucide-react";
import api from "../../utils/api";

const ProductSearchBarNav = ({
  placeholder = "Search medicines, brands, symptoms...",
  onSearch = null,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);
  const abortController = useRef(null);
  const cache = useRef({}); // Cache for search results

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(recent.slice(0, 5));
  }, []);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (abortController.current) abortController.current.abort();
    };
  }, []);

  // Real-time search with debounce and caching
  const searchProducts = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // Check cache first for instant results
    const cacheKey = searchQuery.toLowerCase().trim();
    if (cache.current[cacheKey]) {
      setSuggestions(cache.current[cacheKey]);
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();

    try {
      setLoading(true);
      
      // Use the search API endpoint with reduced limit for speed
      const response = await api.get(`/search/`, {
        params: { q: searchQuery, limit: 6 }, // Reduced from 8 to 6
        signal: abortController.current.signal
      });

      // Handle different response structures
      const products = response.data?.data || response.data?.products || response.data || [];
      const productList = Array.isArray(products) ? products : [];
      
      // Cache the results
      cache.current[cacheKey] = productList;
      
      setSuggestions(productList);
    } catch (error) {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error("Search error:", error);
        setSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);
    
    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim()) {
      setShowDropdown(true);
      setLoading(true);
      
      // Debounce API call by 150ms for faster response
      debounceTimer.current = setTimeout(() => {
        searchProducts(value);
      }, 150);
    } else {
      setSuggestions([]);
      setLoading(false);
      setShowDropdown(false);
    }
  };

  // Save search to recent searches
  const saveRecentSearch = (searchTerm) => {
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    const updated = [
      searchTerm,
      ...recent.filter(item => item.toLowerCase() !== searchTerm.toLowerCase())
    ].slice(0, 5);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    setRecentSearches(updated);
  };

  // Handle product click from suggestions
  const handleProductClick = (product) => {
    saveRecentSearch(product.name);
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    
    // Navigate to search results page with the product name
    // This will show the product in the filtered list on /medicines page
    navigate(`/medicines?q=${encodeURIComponent(product.name)}`);
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchTerm) => {
    setQuery(searchTerm);
    setShowDropdown(false);
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/medicines?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Handle search submission (Enter key or button click)
  const handleSearch = (e) => {
    e?.preventDefault();
    
    // If user has highlighted a suggestion, navigate to it
    if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      handleProductClick(suggestions[highlightedIndex]);
      return;
    }

    const searchTerm = query.trim();
    if (searchTerm) {
      saveRecentSearch(searchTerm);
      setShowDropdown(false);
      setHighlightedIndex(-1);
      
      if (onSearch) {
        onSearch(searchTerm);
      } else {
        navigate(`/medicines?q=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  // Clear search input
  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    const totalItems = suggestions.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case "Enter":
        e.preventDefault();
        handleSearch();
        break;
      
      case "Escape":
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
      
      default:
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0) {
      const element = document.getElementById(`suggestion-${highlightedIndex}`);
      if (element) {
        element.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [highlightedIndex]);

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 px-3"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() || recentSearches.length > 0) {
              setShowDropdown(true);
            }
          }}
        />

        {query && (
          <button 
            onClick={handleClear}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}

        {loading && (
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
        )}

        <button 
          onClick={handleSearch}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors ml-1"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Dropdown Suggestions */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 shadow-lg max-h-96 overflow-auto z-50"
        >
          {/* Recent Searches - Show when no query */}
          {!query && recentSearches.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Recent Searches
              </div>
              {recentSearches.map((term, index) => (
                <div
                  key={`recent-${index}`}
                  className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  onClick={() => handleRecentSearchClick(term)}
                >
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{term}</span>
                </div>
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && query && (
            <div className="px-4 py-8 text-center">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Searching...</p>
            </div>
          )}

          {/* Product Suggestions */}
          {!loading && query && suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                Products ({suggestions.length})
              </div>
              {suggestions.map((product, index) => (
                <div
                  key={product._id || product.id || index}
                  id={`suggestion-${index}`}
                  className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${
                    highlightedIndex === index 
                      ? "bg-blue-50 border-l-2 border-blue-500" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleProductClick(product)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {/* Product Image */}
                  {product.image && (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                  </div>

                  {/* Price */}
                  {product.price && (
                    <div className="text-sm font-semibold text-blue-600 flex-shrink-0">
                      ₹{product.price}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && query && suggestions.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">No products found</p>
              <p className="text-xs text-gray-400">
                Try searching with different keywords
              </p>
            </div>
          )}

          {/* Search All Results Footer */}
          {query && suggestions.length > 0 && (
            <div 
              className="border-t border-gray-100 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleSearch}
            >
              <p className="text-sm text-blue-600 font-medium text-center">
                View all results for "{query}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearchBarNav;
