import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleApplyPromo = () => {
    // Mock promo code validation
    if (promoCode === 'SAVE20') {
      setDiscount(cartTotal * 0.2);
    } else if (promoCode === 'SAVE10') {
      setDiscount(cartTotal * 0.1);
    } else {
      setDiscount(0);
    }
  };

  const finalTotal = cartTotal - discount;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="text-center py-12">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-dark mb-2">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">
              Add some medicines to get started with your order
            </p>
            <Link to="/medicines" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="card">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border-b last:border-b-0 hover:bg-light transition"
                >
                  {/* Image */}
                  <div className="w-20 h-20 bg-light rounded-lg flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-dark mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">₹{item.price}</p>
                    
                    {/* Quantity Control */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 border border-gray-300 rounded hover:bg-light transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 border border-gray-300 rounded hover:bg-light transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="text-right">
                    <p className="font-bold text-dark mb-4">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-danger hover:text-red-700 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <Link to="/medicines" className="text-primary hover:underline mt-4 inline-block">
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-dark mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="input-field flex-1 text-sm"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="btn-primary px-4 text-sm"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Try: SAVE20 or SAVE10
                </p>
              </div>

              {/* Summary Details */}
              <div className="space-y-3 border-t border-b py-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium text-success">FREE</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-success">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg text-primary">₹{finalTotal.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="btn-primary w-full py-3 font-semibold mb-3"
              >
                Proceed to Checkout
              </button>

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="btn-outline w-full py-2 text-sm"
              >
                Clear Cart
              </button>

              {/* Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
                <p className="font-medium mb-2">✓ Free Delivery</p>
                <p className="text-xs">On orders above ₹500</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
