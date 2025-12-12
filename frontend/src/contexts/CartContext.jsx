// src/contexts/CartContext.jsx
import React, { createContext, useState, useCallback, useEffect } from "react";
import { cartAPI } from "../utils/api";
import toast from "react-hot-toast";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const persistLocal = (items) => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (e) {
      console.warn("Could not persist cart to localStorage", e);
    }
  };

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.warn("Invalid cart in localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      const price =
        (item.productId && (item.productId.discountedPrice || item.productId.price)) ||
        item.price ||
        0;
      return sum + price * item.quantity;
    }, 0);

    setCartTotal(total);
    persistLocal(cartItems);
  }, [cartItems]);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await cartAPI.getCart();
      if (data?.success) {
        setCartItems(data.cart?.items || []);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Fetch cart failed:", err);
        toast.error("Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Add to cart
  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      try {
        setLoading(true);
        const { data } = await cartAPI.addToCart(productId, quantity);
        if (data?.success) {
          setCartItems(data.cart.items || []);
          toast.success("Added to cart");
          return true;
        } else {
          toast.error(data?.message || "Could not add to cart");
          return false;
        }
      } catch (err) {
        console.error("Add to cart failed:", err);
        const errorMsg = err.response?.data?.message || "Could not add to cart";
        toast.error(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update quantity
  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity < 0) return;
      try {
        setLoading(true);
        const { data } = await cartAPI.updateQuantity(productId, quantity);
        if (data?.success) {
          setCartItems(data.cart.items || []);
          if (quantity === 0) toast.success("Item removed from cart");
        } else {
          toast.error(data?.message || "Could not update cart");
        }
      } catch (err) {
        console.error("Update quantity failed:", err);
        toast.error("Could not update quantity");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Remove item
  const removeFromCart = useCallback(
    async (productId) => {
      try {
        setLoading(true);
        const { data } = await cartAPI.removeFromCart(productId);
        if (data?.success) {
          setCartItems(data.cart.items || []);
          toast.success("Removed from cart");
        } else {
          toast.error(data?.message || "Could not remove item");
        }
      } catch (err) {
        console.error("Remove from cart failed:", err);
        toast.error("Could not remove item");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await cartAPI.clearCart();
      if (data?.success) {
        setCartItems([]);
        localStorage.removeItem("cart");
        toast.success("Cart cleared");
      } else {
        toast.error(data?.message || "Could not clear cart");
      }
    } catch (err) {
      console.error("Clear cart failed:", err);
      toast.error("Could not clear cart");
    } finally {
      setLoading(false);
    }
  }, []);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + (item.quantity || 0), 0);
  }, [cartItems]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value = {
    cartItems,
    cartTotal,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
