// src/pages/ProductDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProduct } from '../hooks/useProduct';
import { productAPI } from '../utils/api';
import LoadSpinner from '../components/LoadSpinner';

const ProductDetails = () => {
  const { id } = useParams();
  const { getProductById } = useProduct();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const local = getProductById(id);
        if (local) {
          if (mounted) setProduct(local);
        } else {
          // fetch from server if not present locally
          const res = await productAPI.getById(id);
          const data = res?.data.data ?? res;
          if (mounted) setProduct(data);
        }
      } catch (err) {
        console.error('product details fetch failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, getProductById]);

  if (loading) return <LoadSpinner fullPage />;

  if (!product) {
    return <div className="container-custom py-12">Product not found.</div>;
  }

  return (
    <div className="container-custom py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-4 rounded shadow">
          <img src={(product.images && product.images[0]) || product.image} alt={product.name} className="w-full h-80 object-cover rounded" />
        </div>

        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-4">{product.brand?.name || ''} • {product.category?.name || ''}</p>

          <div className="mb-4">
            <span className="text-2xl font-bold text-primary">₹{product.discountedPrice ?? product.price}</span>
            {product.discount && <span className="text-sm text-gray-400 line-through ml-3">₹{product.price}</span>}
          </div>

          <p className="text-gray-700 mb-4">{product.description}</p>

          {/* action buttons */}
          <div className="flex gap-3">
            <button className="btn-primary">Buy Now</button>
            <button className="btn-outline">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
