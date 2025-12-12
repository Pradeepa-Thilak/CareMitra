// src/hooks/useCart.js
import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/cart");
      if (data.success) {
        setCartItems(data.cart?.items || []);
      }
    } catch (err) {
      console.error("Fetch cart failed:", err);
      // Only show error if not a 404 (no cart exists yet)
      if (err.response?.status !== 404) {
        toast.error("Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate total whenever cartItems change
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      const price = item.productId?.discountedPrice || item.productId?.price || 0;
      return sum + price * item.quantity;
    }, 0);
    setCartTotal(total);
  }, [cartItems]);

  // Add to cart - FIXED to accept productId and quantity
  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const { data } = await api.post(`/cart/add/${productId}`);
      if (data.success) {
        setCartItems(data.cart.items);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Add to cart failed:", err);
      const errorMsg = err.response?.data?.message || "Could not add to cart";
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 0) return;
    
    try {
      setLoading(true);
      const { data } = await api.put(`/cart/update/${productId}`, { quantity });
      if (data.success) {
        setCartItems(data.cart.items);
        if (quantity === 0) {
          toast.success("Item removed from cart");
        }
      }
    } catch (err) {
      console.error("Update quantity failed:", err);
      toast.error("Could not update quantity");
    } finally {
      setLoading(false);
    }
  };

  // Remove item
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const { data } = await api.delete(`/cart/remove/${productId}`);
      if (data.success) {
        setCartItems(data.cart.items);
        toast.success("Removed from cart");
      }
    } catch (err) {
      console.error("Remove from cart failed:", err);
      toast.error("Could not remove item");
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true);
      const { data } = await api.delete("/cart/clear");
      if (data.success) {
        setCartItems([]);
        toast.success("Cart cleared");
      }
    } catch (err) {
      console.error("Clear cart failed:", err);
      toast.error("Could not clear cart");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cartItems,
    cartTotal,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
  };
};