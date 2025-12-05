// src/components/product/ProductList.jsx
import React from 'react';
import { useProduct } from '../../hooks/useProduct';
import ProductCard from '../product/ProductCard';
import LoadSpinner from '../LoadSpinner';
import { useNavigate } from 'react-router-dom';

const ProductList = ({ onViewDetails }) => {
  const { filteredProducts, loading } = useProduct();
  const navigate = useNavigate();
  
  if (loading) return <LoadSpinner fullPage={false} />;

  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((p) => (
        <ProductCard
          key={p._id ?? p.id}
          product={p}
          onViewDetails={() => (onViewDetails ? onViewDetails(p) : navigate(`/medicine/${p._id ?? p.id}`))}        />
      ))}
    </div>
  );
};

export default ProductList;
