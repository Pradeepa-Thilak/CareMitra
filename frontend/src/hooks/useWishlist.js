// hooks/useWishlist.js
import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

export function useWishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===============================
  // FETCH WISHLIST
  // ===============================
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/wishlist");

      // Axios → data is already parsed
      setItems(
        Array.isArray(response.data) ? response.data : response.data?.data || []
      );
    } catch (err) {
      console.error("Fetch wishlist error:", err);
      setError("Failed to fetch wishlist");
    } finally {
      setLoading(false);
    }
  }, []);

  // ===============================
  // ADD TO WISHLIST
  // ===============================
  const addToWishlist = useCallback(async (product) => {
    try {
      const payload = {
        productId: product.id || product._id,
        name: product.name,
        price: product.price,
        discountedPrice: product.discountedPrice || null,
        image: product.image || product.imageUrl || null,
        packSize: product.packSize || null,
        category: product.category || null,
      };

      // ✅ CORRECT ENDPOINT
      const response = await api.post("/wishlist", payload);

      // Backend returns saved wishlist item
      const newItem = response.data?.data || response.data;
      setItems((prev) => [...prev, newItem]);

      return response.data;
    } catch (err) {
      console.error("Add wishlist error:", err);
      throw err;
    }
  }, []);

  // ===============================
  // REMOVE FROM WISHLIST
  // ===============================
  const removeFromWishlist = useCallback(async (itemId) => {
    try {
      await api.delete(`/wishlist/${itemId}`);

      setItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err) {
      console.error("Remove wishlist error:", err);
      throw err;
    }
  }, []);

  // ===============================
  // CLEAR WISHLIST
  // ===============================
  const clearWishlist = useCallback(async () => {
    try {
      await api.delete("/wishlist");
      setItems([]);
    } catch (err) {
      console.error("Clear wishlist error:", err);
      throw err;
    }
  }, []);

  // ===============================
  // CHECK IF IN WISHLIST
  // ===============================
  const isInWishlist = useCallback(
    (productId) => {
      return items.some((item) => item.productId === productId);
    },
    [items]
  );

  // ===============================
  // TOGGLE WISHLIST
  // ===============================
  const toggleWishlist = useCallback(
    async (product) => {
      const productId = product.id || product._id;
      const existing = items.find((item) => item.productId === productId);

      if (existing) {
        await removeFromWishlist(existing._id);
        return false;
      } else {
        await addToWishlist(product);
        return true;
      }
    },
    [items, addToWishlist, removeFromWishlist]
  );

  // ===============================
  // LOAD ON MOUNT
  // ===============================
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    items,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    toggleWishlist,
    refetch: fetchWishlist,
    count: items.length,
  };
}
