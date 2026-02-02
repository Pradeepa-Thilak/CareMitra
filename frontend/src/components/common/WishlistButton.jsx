import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "../../hooks/useWishlist";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

export default function WishlistButton({ product, className = "" }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const inWishlist = isInWishlist(product.id || product._id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);
      const added = await toggleWishlist(product);

      toast.success(
        added ? "Added to wishlist" : "Removed from wishlist"
      );
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      
      if (!isAuthenticated && err.response?.status === 401) {
        toast.error("Please login to save wishlist items");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`p-2 rounded-full transition-all duration-200 ${
        inWishlist
          ? "bg-red-100 text-red-600 hover:bg-red-200"
          : "bg-white/90 text-gray-600 hover:bg-white"
      } disabled:opacity-60 disabled:cursor-not-allowed shadow-md ${className}`}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          inWishlist ? "fill-current" : ""
        }`}
      />
    </button>
  );
}