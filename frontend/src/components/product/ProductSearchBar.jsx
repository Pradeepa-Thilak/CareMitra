// src/components/product/ProductSearchBar.jsx
import React from 'react';
import { Search } from 'lucide-react';
import { useProduct } from '../../hooks/useProduct';

const ProductSearchBar = ({ placeholder = 'Search for medicines, brands, symptoms...' }) => {
  const { searchTerm, setSearchTerm } = useProduct();

  return (
  // inside ProductSearchBar.jsx -- icon wrapper + input
    <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-4 w-full"
    />
    </div>

  );
};

export default ProductSearchBar;
