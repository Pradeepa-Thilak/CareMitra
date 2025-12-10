import React, { useState } from "react";
import { useWishlist } from "../hooks/useWishlist";
import { useCart } from "../hooks/useCart";
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart, Heart, X } from "lucide-react";
import { toast } from "react-hot-toast";

// NOTE: This component uses Tailwind CSS and lucide-react icons. It assumes
// your project already provides the hooks `useWishlist` and `useCart`.

export default function Wishlist() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [loadingId, setLoadingId] = useState(null);

  const handleMoveToCart = async (item) => {
    const product = item.raw ?? {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    };

    const normalized = {
      ...product,
      id: product.id ?? product._id ?? item.id,
      quantity: product.quantity ?? 1,
      price: Number(product.discountedPrice ?? product.price ?? item.price ?? 0),
    };

    try {
      setLoadingId(item.id);
      await addToCart(normalized);
      // keep in wishlist — many users expect this
      toast.success("Added to cart");
    } catch (err) {
      console.error("Add to cart failed", err);
      toast.error("Could not add to cart");
    } finally {
      setLoadingId(null);
    }
  };

  const handleClear = () => {
    if (!items.length) return;
    // small confirm — prevents accidental clearing
    if (confirm("Clear your wishlist? This action cannot be undone.")) {
      clearWishlist();
      toast.success("Wishlist cleared");
    }
  };

  if (!items.length) {
    return (
      <div className="container-custom py-16 flex flex-col items-center text-center">
        <div className="max-w-md">
          <img
            src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=800&q=60"
            alt="empty wishlist"
            className="rounded-xl mb-6 w-full h-48 object-cover shadow"
          />
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Save medicines you like and move them to cart later.</p>
          <Link to="/medicines" className="btn-primary px-6 py-2">
            Browse Medicines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Wishlist <span className="text-sm text-gray-500">({items.length})</span></h2>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClear}
            className="btn-outline px-4 py-2 hidden sm:inline-flex items-center gap-2"
            aria-label="Clear wishlist"
          >
            Clear Wishlist
          </button>
          <button
            onClick={handleClear}
            className="btn-outline px-3 py-2 sm:hidden"
            aria-label="Clear wishlist (mobile)"
            title="Clear wishlist"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((it) => (
          <article
            key={it.id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col"
            aria-labelledby={`wish-${it.id}-title`}
          >
            <div className="relative h-44 md:h-40 lg:h-44">
              <img
                src={it.image || "https://via.placeholder.com/320x240?text=Medicine"}
                alt={it.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-3 right-3 backdrop-blur-sm bg-white/40 rounded-full p-1">
                <button
                  onClick={() => { removeFromWishlist(it.id); toast.success("Removed from wishlist"); }}
                  aria-label="Remove from wishlist"
                  className="p-2 rounded-full hover:bg-white/60"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <h3 id={`wish-${it.id}-title`} className="font-semibold text-sm mb-1 line-clamp-2">
                {it.name}
              </h3>

              <div className="mt-auto flex items-center justify-between gap-3">
                <div>
                  {it.discountedPrice ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold">₹{it.discountedPrice}</span>
                      <span className="text-sm line-through text-gray-400">₹{it.price}</span>
                    </div>
                  ) : (
                    <span className="text-lg font-semibold">₹{it.price}</span>
                  )}
                  {it.packSize && <div className="text-xs text-gray-500">{it.packSize}</div>}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleMoveToCart(it)}
                    className="btn-primary flex items-center gap-2 px-3 py-2 rounded-md disabled:opacity-60"
                    disabled={loadingId === it.id}
                    aria-label={`Move ${it.name} to cart`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm">{loadingId === it.id ? 'Adding...' : 'Move to Cart'}</span>
                  </button>

                  <Link to={`/medicines/${it.id}`} className="text-xs underline text-gray-600">View details</Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
