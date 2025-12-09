// src/pages/Wishlist.jsx
import React from "react";
import { useWishlist } from "../hooks/useWishlist";
import { useCart } from "../hooks/useCart";
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";

const Wishlist = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

 const handleMoveToCart = (item) => {
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
    addToCart(normalized);
    // NOTE: do NOT remove from wishlist — keep it there after adding to cart
    toast?.success?.("Added to cart");
  } catch (err) {
    console.error("Add to cart failed", err);
    toast?.error?.("Could not add to cart");
  }
};

  if (!items.length) {
    return (
      <div className="container-custom py-12">
        <h2 className="text-xl font-semibold mb-4">Your wishlist is empty</h2>
        <p className="mb-6">Browse and add medicines to your wishlist.</p>
        <Link to="/medicines" className="btn-primary">
          Browse Medicines
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Wishlist ({items.length})</h2>
        <button className="btn-outline" onClick={() => { clearWishlist(); toast?.success?.("Wishlist cleared"); }}>
          Clear Wishlist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((it) => (
          <div key={it.id} className="bg-white p-4 rounded shadow flex flex-col">
            <img
              src={it.image || "https://via.placeholder.com/200x200?text=Medicine"}
              alt={it.name}
              className="w-full h-40 object-cover rounded mb-3"
            />

            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">{it.name}</h3>
              <p className="text-sm text-gray-600 mb-2">₹{it.price}</p>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                className="flex-1 btn-primary flex items-center justify-center gap-2"
                onClick={() => handleMoveToCart(it)}
              >
                <ShoppingCart className="w-4 h-4" />
                Move to Cart
              </button>

              <button
                className="btn-outline p-2"
                onClick={() => { removeFromWishlist(it.id); toast?.success?.("Removed from wishlist"); }}
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
