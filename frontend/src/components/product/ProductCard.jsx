import React, { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../../hooks/useCart";
import { toast } from "react-hot-toast";

const cardVariant = {
  hidden: { opacity: 0, y: 8, scale: 0.995 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
  hover: { scale: 1.02, transition: { duration: 0.18 } },
};

const ProductCard = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Normalize ID & prices
  const normalizedId = product._id || product.id || String(product._id ?? Math.random());
  const price = Number(product.discountedPrice ?? product.price ?? 0);
  const original = Number(product.price ?? price);
  const discount =
    Number.isFinite(product.discount) && product.discount > 0
      ? product.discount
      : original > 0
      ? Math.round(((original - price) / original) * 100)
      : 0;

  const goToDetails = (e) => {
    e?.stopPropagation();
    navigate(`/medicine/${normalizedId}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await addToCart(normalizedId, 1);
      toast.success("Added to cart");
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error("Could not add to cart");
    }
  };

  return (
    <motion.div
      layout
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-4 cursor-default overflow-hidden"
      role="article"
      aria-label={product.name}
    >
      <div className="relative mb-3 rounded-lg overflow-hidden">
        <motion.img
          src={
            product.images?.[0] ||
            product.image ||
            "https://via.placeholder.com/400x400?text=Medicine"
          }
          alt={product.name}
          className="w-full h-44 object-cover rounded-lg"
          onClick={goToDetails}
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.25 }}
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            setWishlisted((s) => !s);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow border"
          aria-pressed={wishlisted}
          aria-label="Toggle wishlist"
        >
          <Heart className={`w-5 h-5 ${wishlisted ? "text-rose-500" : "text-gray-400"}`} />
        </button>

        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs px-2 py-1 rounded">
            {discount}% OFF
          </span>
        )}
      </div>

      <h3
        onClick={goToDetails}
        className="font-semibold text-sm mb-1 line-clamp-2 hover:text-primary cursor-pointer"
      >
        {product.name}
      </h3>

      <p className="text-xs text-gray-500 mb-3">
        {product.brand?.name || "Generic"} • {product.category?.name || "General"}
      </p>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        {product.rating ? (
          <>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({product.reviews ?? 0})</span>
          </>
        ) : (
          <span className="text-xs text-gray-400">No rating</span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-bold text-primary">₹{price}</span>
            {original && original > price && (
              <span className="text-sm text-gray-400 line-through">₹{original}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Pack: {product.packSize ?? "N/A"}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            className="btn-primary text-sm py-2 px-3 rounded-md flex items-center gap-2 shadow-sm"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {product.stock !== undefined && (
        <p className="text-xs mt-1">
          {product.stock > 0 ? (
            <span className="text-green-600 font-medium">In Stock</span>
          ) : (
            <span className="text-red-500 font-medium">Out of Stock</span>
          )}
        </p>
      )}
    </motion.div>
  );
};

export default ProductCard;
