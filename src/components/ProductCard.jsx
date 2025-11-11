import React, { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../hooks/useCart';

const ProductCard = ({ product, onViewDetails }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  return (
    <div className="card p-4 hover:shadow-xl transition-all duration-300">
      {/* Image Container */}
      <div className="relative mb-4 bg-light rounded-lg overflow-hidden h-40 flex items-center justify-center">
        <img
          src={product.image || '/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform"
        />
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-light transition"
        >
          <Heart
            className={`w-5 h-5 ${isWishlisted ? 'fill-danger text-danger' : 'text-gray-400'}`}
          />
        </button>
        {product.discount && (
          <div className="absolute top-2 left-2 bg-danger text-white px-2 py-1 rounded text-xs font-bold">
            {product.discount}% OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mb-3">
        <h3 className="font-semibold text-dark mb-1 line-clamp-2 text-sm">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{product.category}</p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-warning text-warning'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({product.reviews || 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 btn-outline text-sm py-2"
        >
          Details
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Stock Status */}
      {product.stock !== undefined && (
        <div className="mt-2 text-xs">
          {product.stock > 0 ? (
            <span className="text-success font-medium">In Stock</span>
          ) : (
            <span className="text-danger font-medium">Out of Stock</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
