// src/contexts/WishlistContext.jsx
import React, { createContext, useCallback, useEffect, useState } from "react";

export const WishlistContext = createContext();

const STORAGE_KEY = "caremitra_wishlist_v1";

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // initialize
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (err) {
      console.warn("Failed to load wishlist from localStorage", err);
    }
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("Failed to save wishlist to localStorage", err);
    }
  }, [items]);

  const addToWishlist = useCallback((product) => {
    const id = product.id ?? product._id ?? String(product._id ?? Math.random());
    setItems((prev) => {
      if (prev.find((p) => p.id === id)) return prev;
      const minimal = {
        id,
        name: product.name,
        price: Number(product.discountedPrice ?? product.price ?? 0),
        image: product.images?.[0] ?? product.image ?? null,
        raw: product, // optional: keep full product if you want
        addedAt: Date.now(),
      };
      return [...prev, minimal];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const toggleWishlist = useCallback((product) => {
    const id = product.id ?? product._id ?? String(product._id ?? Math.random());
    setItems((prev) => {
      if (prev.find((p) => p.id === id)) {
        return prev.filter((p) => p.id !== id);
      } else {
        const minimal = {
          id,
          name: product.name,
          price: Number(product.discountedPrice ?? product.price ?? 0),
          image: product.images?.[0] ?? product.image ?? null,
          raw: product,
          addedAt: Date.now(),
        };
        return [...prev, minimal];
      }
    });
  }, []);

  const isInWishlist = useCallback((productId) => {
    return items.some((p) => p.id === productId);
  }, [items]);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const value = {
    items,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
