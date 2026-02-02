import React, { useState } from "react";
import { useWishlist } from "../hooks/useWishlist";
import { useCart } from "../hooks/useCart";
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Wishlist() {
  const { items, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [loadingId, setLoadingId] = useState(null);

  const handleMoveToCart = async (item) => {
    const product = {
      id: item.productId,
      name: item.name,
      price: item.discountedPrice || item.price,
      image: item.image,
      quantity: 1,
      packSize: item.packSize,
    };

    try {
      setLoadingId(item._id);
      await addToCart(item.productId);
      toast.success("Added to cart");
    } catch (err) {
      console.error("Add to cart failed", err);
      toast.error("Could not add to cart");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromWishlist(itemId);
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Could not remove item");
    }
  };

  const handleClear = async () => {
    if (!items.length) return;
    
    if (window.confirm("Clear your wishlist? This action cannot be undone.")) {
      try {
        await clearWishlist();
        toast.success("Wishlist cleared");
      } catch (err) {
        toast.error("Could not clear wishlist");
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Empty state
  if (!items.length) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-16 h-16 text-gray-300" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Save medicines you like and move them to cart later.
          </p>
          <Link 
            to="/medicines" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Medicines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          My Wishlist{" "}
          <span className="text-sm text-gray-500">({items.length})</span>
        </h2>

        <button
          onClick={handleClear}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Clear wishlist"
        >
          <span className="hidden sm:inline">Clear Wishlist</span>
          <span className="sm:hidden">Clear</span>
        </button>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <article
            key={item._id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col"
          >
            {/* Image */}
            <div className="relative h-44 md:h-40 lg:h-44 bg-gray-100">
              <img
                src={item.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1lZGljaW5lPC90ZXh0Pjwvc3ZnPg=="}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => handleRemove(item._id)}
                  aria-label="Remove from wishlist"
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-md transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                {item.name}
              </h3>

              {item.packSize && (
                <div className="text-xs text-gray-500 mb-2">{item.packSize}</div>
              )}

              <div className="mt-auto">
                {/* Price */}
                <div className="mb-3">
                  {item.discountedPrice ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold">
                        ₹{item.discountedPrice}
                      </span>
                      <span className="text-sm line-through text-gray-400">
                        ₹{item.price}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-semibold">₹{item.price}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={loadingId === item.id}
                  >
                    {loadingId === item.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-sm">Move to Cart</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/medicine/${item.productId}`}
                    className="text-center text-xs underline text-gray-600 hover:text-gray-900"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}