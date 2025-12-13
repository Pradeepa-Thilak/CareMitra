// src/pages/Cart.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const qtyBtn = "p-1 border border-gray-300 rounded hover:bg-gray-100 transition";

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const handleApplyPromo = () => {
    if (promoCode === "SAVE20") setDiscount(cartTotal * 0.2);
    else if (promoCode === "SAVE10") setDiscount(cartTotal * 0.1);
    else setDiscount(0);
  };

  const finalTotal = Math.max(0, cartTotal - discount);

  const handleCheckout = () => {
    const token = localStorage.getItem("authToken");
    const isLogged = Boolean(token) || Boolean(isAuthenticated);
    if (!isLogged) {
      navigate("/login");
    } else {
      navigate("/payments", {
        state: {
          items: cartItems,
          amount: cartTotal,
          context: "order",
          source: "cart",
        },
      });
    }
  };

  if (!cartItems || cartItems.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
        <div className="text-center">
          <ShoppingCart className="w-24 h-24 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-semibold mb-2">Your Cart is Empty</h2>
          <p className="text-sm text-gray-500 mb-4">Browse medicines and add what you need.</p>
          <Link to="/medicines" className="btn-primary mt-4 inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Link to="/medicines" className="text-primary hover:underline">← Continue Shopping</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm divide-y border">
              <AnimatePresence>
                {cartItems.map((item) => {
                  const product = item.productId;
                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, margin: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex gap-4 p-4 items-center"
                    >
                      <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={product.image || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">₹{product.price}</p>

                        <div className="mt-3 flex items-center gap-3">
                          <div className="inline-flex items-center border rounded-md overflow-hidden">
                            <button
                              onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))}
                              className={qtyBtn}
                              aria-label={`Decrease quantity for ${product.name}`}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <div className="w-10 text-center font-medium">{item.quantity}</div>
                            <button
                              onClick={() => updateQuantity(product._id, item.quantity + 1)}
                              className={qtyBtn}
                              aria-label={`Increase quantity for ${product.name}`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(product._id)}
                            className="text-gray-400 hover:text-red-600 transition"
                            aria-label={`Remove ${product.name}`}
                            title="Remove"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <p className="font-bold">₹{(product.price * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">{product.stock > 0 ? "In stock" : "Out of stock"}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <div className="p-4 flex justify-between items-center">
                <button onClick={clearCart} className="btn-outline text-sm px-4 py-2">Clear Cart</button>
                <div className="text-sm text-gray-600">Items: <span className="font-medium">{cartItems.length}</span></div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-20">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE20"
                  className="input-field flex-1 text-sm"
                />
                <button onClick={handleApplyPromo} className="btn-primary px-4 text-sm">Apply</button>
              </div>

              <div className="space-y-3 border-t border-b py-4 mb-4 text-sm text-gray-700">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-rose-700"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
              </div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-2xl font-bold text-primary">₹{finalTotal.toFixed(2)}</div>
                </div>
              </div>

              <button onClick={handleCheckout} className="btn-primary w-full py-3 font-semibold mb-3">Proceed to Checkout</button>
              <Link to="/medicines" className="btn-outline w-full py-2 text-center text-sm">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
