// src/components/product/ProductCard.jsx
import React, { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const navigate = useNavigate();

  const price = product.discountedPrice ?? product.price;
  const original = product.price;
  const discount = product.discount || Math.round(((original - price) / original) * 100);

  const goToDetails = () => {
    navigate(`/medicine/${product._id || product.id}`);
  };

  return (
    <div className="card p-4 rounded-lg border hover:shadow-md transition cursor-pointer">
      {/* Image */}
      <div className="relative mb-3 h-40 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={
            product.images?.[0] ||
            product.image ||
            "https://via.placeholder.com/200x200?text=Medicine"
          }
          alt={product.name}
          className="w-full h-full object-cover"
          onClick={goToDetails}
        />

        {/* Wishlist */}
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
        >
          <Heart
            className={`w-5 h-5 ${
              wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
            }`}
          />
        </button>

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Product Details */}
      <h3
        className="font-semibold text-dark line-clamp-2 text-sm mb-1"
        onClick={goToDetails}
      >
        {product.name}
      </h3>

      <p className="text-xs text-gray-500 mb-2">
        {product.brand?.name || "Generic"} • {product.category?.name}
      </p>

      {/* Rating */}
      {product.rating && (
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < Math.floor(product.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-xs text-gray-600">({product.reviews || 0})</span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-bold text-primary">₹{price}</span>
        {original && (
          <span className="text-sm text-gray-400 line-through">₹{original}</span>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={goToDetails}
          className="flex-1 btn-outline text-sm py-2"
        >
          Details
        </button>
        <button
          className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Stock */}
      {product.stock !== undefined && (
        <p className="text-xs mt-2">
          {product.stock > 0 ? (
            <span className="text-green-600">In Stock</span>
          ) : (
            <span className="text-red-500">Out of Stock</span>
          )}
        </p>
      )}
    </div>
  );
};

export default ProductCard;
