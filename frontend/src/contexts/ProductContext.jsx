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
  const [brands, setBrands] = useState([]);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState('popular');

  // Load categories and products on mount
  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryAPI.getAll(),
          productAPI.getAll({ limit: 10000 })
        ]);

        const catData = catRes?.data?.data ?? catRes?.data ?? catRes;
        const prodData = prodRes?.data?.data ?? prodRes?.data ?? prodRes;
        
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

  // Filtered and sorted products
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

    // Search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.brand?.name || '').toLowerCase().includes(q) ||
        (p.category?.name || '').toLowerCase().includes(q)
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

  // Get product by ID
  const getProductById = (id) => {
    return products.find(p => String(p._id ?? p.id) === String(id));
  };

  // Remote search function
  const remoteSearch = async (q) => {
    try {
      const res = await searchAPI.basic(q);
      return res?.data?.data || res?.data?.products || res?.data || [];
    } catch (err) {
      console.warn('remoteSearch failed', err);
      return [];
    }
  };

  const value = {
    loading,
    error,
    products,
    categories,
    brands,
    searchTerm,
    setSearchTerm,
    setSearchQuery: setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    filteredProducts,
    getProductById,
    remoteSearch,
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
