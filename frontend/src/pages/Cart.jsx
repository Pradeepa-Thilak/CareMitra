// src/pages/Cart.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

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

  const finalTotal = cartTotal - discount;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      // Navigate to Payment page (NOT the /checkout page).
      // Pass cart snapshot so Payment page can present items/amount and ask address/payment method.
      navigate("/payment", {
        state: {
          items: cartItems,
          amount: cartTotal,
        },
      });
    }
  };

  if (cartItems.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-24 h-24 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
          <Link to="/medicines" className="btn-primary mt-4 inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <Link to="/medicines" className="text-primary hover:underline mt-4 inline-block">← Continue Shopping</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="card">
              {cartItems.map((item) => {
                const product = item.productId;
                return (
                  <div key={product._id} className="flex gap-4 p-4 border-b last:border-b-0 hover:bg-light transition">
                    <div className="w-20 h-20 bg-light rounded-lg flex-shrink-0 flex items-center justify-center">
                      <img src={product.image || "/placeholder.png"} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-dark mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">₹{product.price}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))} className="p-1 border border-gray-300 rounded hover:bg-light transition"><Minus className="w-4 h-4" /></button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(product._id, item.quantity + 1)} className="p-1 border border-gray-300 rounded hover:bg-light transition"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-dark mb-4">₹{(product.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(product._id)} className="text-danger hover:text-red-700 transition"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-dark mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="Enter code" className="input-field flex-1 text-sm" />
                  <button onClick={handleApplyPromo} className="btn-primary px-4 text-sm">Apply</button>
                </div>
              </div>
              <div className="space-y-3 border-t border-b py-4 mb-4">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-sm"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
              </div>
              <div className="flex justify-between mb-6"><span className="font-bold text-lg">Total</span><span className="font-bold text-lg text-primary">₹{finalTotal.toFixed(2)}</span></div>
              <button onClick={handleCheckout} className="btn-primary w-full py-3 font-semibold mb-3">Proceed to Checkout</button>
              <button onClick={clearCart} className="btn-outline w-full py-2 text-sm">Clear Cart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
