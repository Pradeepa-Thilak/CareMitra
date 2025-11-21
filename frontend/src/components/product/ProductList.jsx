// src/components/product/ProductList.jsx
import React from 'react';
import { useProduct } from '../../hooks/useProduct';
import ProductCard from '../user/ProductCard';
import LoadSpinner from '../LoadSpinner';

const ProductList = ({ onViewDetails }) => {
  const { filteredProducts, loading } = useProduct();

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
          onViewDetails={() => (onViewDetails ? onViewDetails(p) : window.location.href = `/medicine/${p._id ?? p.id}`)}
        />
      ))}
    </div>
  );
};

export default ProductList;
