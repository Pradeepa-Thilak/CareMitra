// src/contexts/CartContext.jsx
import React, { createContext, useState, useCallback, useEffect, useContext } from "react";
import { cartAPI } from "../utils/api";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { role, token } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check if user is a patient
  const isPatient = role === "patient";

  const persistLocal = (items) => {
    // Only persist cart for patients
    if (!isPatient) return;
    
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (e) {
      console.warn("Could not persist cart to localStorage", e);
    }
  };

  // Load cart from localStorage on mount (only for patients)
  useEffect(() => {
    if (!isPatient) {
      // Clear cart for non-patients
      setCartItems([]);
      localStorage.removeItem("cart");
      return;
    }

    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.warn("Invalid cart in localStorage", e);
      }
    }
  }, [isPatient]);

  // Calculate cart total
  useEffect(() => {
    if (!isPatient) {
      setCartTotal(0);
      return;
    }

    const total = cartItems.reduce((sum, item) => {
      const price =
        (item.productId && (item.productId.discountedPrice || item.productId.price)) ||
        item.price ||
        0;
      return sum + price * item.quantity;
    }, 0);

    setCartTotal(total);
    persistLocal(cartItems);
  }, [cartItems, isPatient]);

  // Fetch cart from server
  const fetchCart = useCallback(async () => {
    // Only fetch cart for patients
    if (!isPatient || !token) {
      setCartItems([]);
      return;
    }

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
  }, [isPatient, token]);

  // Add to cart
  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      // Prevent non-patients from adding to cart
      if (!isPatient) {
        toast.error("Only patients can add items to cart");
        return false;
      }

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
    [isPatient]
  );

  // Update quantity
  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (!isPatient) {
        toast.error("Only patients can modify cart");
        return;
      }

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
    [isPatient]
  );

  // Remove item
  const removeFromCart = useCallback(
    async (productId) => {
      if (!isPatient) {
        toast.error("Only patients can modify cart");
        return;
      }

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
    [isPatient]
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!isPatient) {
      toast.error("Only patients can clear cart");
      return;
    }

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
  }, [isPatient]);

  const getCartItemCount = useCallback(() => {
    if (!isPatient) return 0;
    return cartItems.reduce((count, item) => count + (item.quantity || 0), 0);
  }, [cartItems, isPatient]);

  // Fetch cart when user logs in as patient
  useEffect(() => {
    if (isPatient && token) {
      fetchCart();
    } else {
      // Clear cart if user is not a patient
      setCartItems([]);
      setCartTotal(0);
    }
  }, [isPatient, token, fetchCart]);

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
    isPatient, // Expose this so components can check
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};