// src/contexts/ProductContext.jsx
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { categoryAPI, productAPI, searchAPI } from '../utils/api';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  console.log('[ProductProvider] mounted');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Raw data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]); // optional later

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState('popular'); // popular | rating | price-low | price-high

  // Load all categories + products at startup (A1)
  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryAPI.getAll(),         // GET /categories/
          productAPI.getAll({ limit: 10000 }) // GET /products/?limit=10000 (adjust if backend supports)
        ]);

        // axios responses wrap the payload inside `response.data`.
        // Our backend returns an object like { success, count, data: [...] }
        // so prefer `response.data.data` where available.
        const catData = catRes?.data?.data ?? catRes?.data ?? catRes;
        const prodData = prodRes?.data?.data ?? prodRes?.data ?? prodRes;
        console.log(catData , prodData);
        
        if (!mounted) return;
        setCategories(Array.isArray(catData) ? catData : []);
        setProducts(Array.isArray(prodData) ? prodData : []);
      } catch (err) {
        console.error('ProductContext load failed', err);
        if (mounted) setError(err?.message || 'Failed to load product data');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAll();
    return () => { mounted = false; };
  }, []);

  // Derived filtered products (local filtering + sort)
  const filteredProducts = useMemo(() => {
    let list = Array.from(products || []);

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter(p => {
        const key = p.category?.key ?? p.category;
        return key === selectedCategory || p.category === selectedCategory;
      });
    }

    // Brand filter
    if (selectedBrand && selectedBrand !== 'All') {
      list = list.filter(p => {
        const brandKey = p.brand?.key ?? p.brand;
        return brandKey === selectedBrand || p.brand === selectedBrand;
      });
    }

    // Search filter (name + description)
    if (searchTerm && searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.brand?.name || '').toLowerCase().includes(q)
      );
    }

    // Price range
    list = list.filter(p => {
      const price = Number(p.price ?? p.discountedPrice ?? 0);
      return price >= (priceRange[0] ?? 0) && price <= (priceRange[1] ?? 1000000);
    });

    // Sort
    switch (sortBy) {
      case 'price-low':
        list.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        list.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
      default:
        list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
    }

    return list;
  }, [products, selectedCategory, selectedBrand, searchTerm, priceRange, sortBy]);

  // helper: get product by id from cache
  const getProductById = (id) => {
    return products.find(p => String(p._id ?? p.id) === String(id));
  };

  // helper: remote search (optional fallback to server search)
  const remoteSearch = async (q) => {
    try {
      const res = await searchAPI.basic(q); // GET /search/?q=...
      return res?.data ?? res;
    } catch (err) {
      console.warn('remoteSearch failed', err);
      return [];
    }
  };

  // public API
  const value = {
    // data
    loading,
    error,
    products,
    categories,
    brands,

    // UI state
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,

    // derived
    filteredProducts,
    getProductById,
    remoteSearch,

    // setters
    setProducts,
    setCategories,
    setBrands,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
