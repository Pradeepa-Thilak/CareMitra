// src/pages/Cart.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, Tag, Shield, Truck, ArrowRight } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const qtyBtn = "p-1.5 border border-gray-300 rounded-md hover:bg-gray-100 hover:border-gray-400 transition-all";

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = () => {
    if (promoCode === "SAVE20") {
      setDiscount(cartTotal * 0.2);
      setPromoError("");
    } else if (promoCode === "SAVE10") {
      setDiscount(cartTotal * 0.1);
      setPromoError("");
    } else if (promoCode === "") {
      setPromoError("Please enter a promo code");
      setDiscount(0);
    } else {
      setPromoError("Invalid promo code");
      setDiscount(0);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShoppingCart className="w-16 h-16 text-gray-300" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">
            Browse our wide selection of medicines and add what you need to get started.
          </p>
          <Link 
            to="/medicines" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container-custom max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-500 mt-1">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
            </div>
            <Link 
              to="/medicines" 
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Cart Items Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <AnimatePresence>
                {cartItems.map((item, index) => {
                  const product = item.productId;
                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, height: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="flex gap-4 p-5 items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                        <img
                          src={product.image || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <p className="text-lg font-bold text-blue-600">₹{product.price}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-700' 
                              : product.stock > 0 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="inline-flex items-center border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            <button
                              onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))}
                              className={qtyBtn}
                              disabled={item.quantity <= 1}
                              aria-label={`Decrease quantity for ${product.name}`}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <div className="w-12 text-center font-semibold text-gray-900">{item.quantity}</div>
                            <button
                              onClick={() => updateQuantity(product._id, item.quantity + 1)}
                              className={qtyBtn}
                              disabled={item.quantity >= product.stock}
                              aria-label={`Increase quantity for ${product.name}`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(product._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            aria-label={`Remove ${product.name}`}
                            title="Remove from cart"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="hidden sm:block text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{(product.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ₹{product.price} × {item.quantity}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Cart Footer */}
              <div className="p-5 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button 
                  onClick={clearCart} 
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
                <div className="text-sm text-gray-600">
                  Total Items: <span className="font-semibold text-gray-900">{cartItems.length}</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900">Secure Payment</p>
                  <p className="text-xs text-gray-500">100% Protected</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900">Fast Delivery</p>
                  <p className="text-xs text-gray-500">2-3 Business Days</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900">Best Prices</p>
                  <p className="text-xs text-gray-500">Guaranteed Savings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-20">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
              </div>

              <div className="p-6 space-y-5">
                {/* Promo Code Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    Have a Promo Code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoError("");
                      }}
                      placeholder="e.g. SAVE20"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium uppercase"
                    />
                    <button 
                      onClick={handleApplyPromo} 
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <span>⚠</span> {promoError}
                    </p>
                  )}
                  {discount > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="font-medium">Code "{promoCode}" applied successfully!</span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 py-4 border-t border-b border-gray-100">
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span className="font-medium flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        Discount
                      </span>
                      <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Delivery Fee</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-2">
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Total Amount</div>
                    <div className="text-xs text-gray-500">Including all taxes</div>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    ₹{finalTotal.toFixed(2)}
                  </div>
                </div>

                {/* Savings Indicator */}
                {discount > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="text-sm font-semibold text-green-800">
                      🎉 You're saving ₹{discount.toFixed(2)} on this order!
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button 
                    onClick={handleCheckout} 
                    className="w-full bg-blue-600 text-white py-3.5 rounded-lg hover:bg-blue-700 transition-all font-semibold text-base shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <Link 
                    to="/medicines" 
                    className="block w-full text-center border-2 border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Available Promo Codes */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Available Offers:</p>
                  <div className="space-y-1.5 text-xs text-blue-800">
                    <div className="flex items-start gap-2">
                      <Tag className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span><strong>SAVE20:</strong> Get 20% off on your order</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Tag className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span><strong>SAVE10:</strong> Get 10% off on your order</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;