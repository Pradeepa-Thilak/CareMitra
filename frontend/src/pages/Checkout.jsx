import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await api.get("/cart");

      let total = 0;
      res.data.cart?.items.forEach((item) => {
        total += item.productId.price * item.quantity;
      });

      setAmount(total);
    } catch (err) {
      console.error("Failed to load cart summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = (src) =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    try {
      const res = await api.post("/cart/create-order");
      const { order } = res.data;

      const razorpayLoaded = await loadRazorpay(
        "https://checkout.razorpay.com/v1/checkout.js"
      );

      if (!razorpayLoaded) {
        alert("Failed to load Razorpay");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "CareMitra",
        description: "Order Payment",
        order_id: order.id,

        handler: async function (response) {
          try {
            const verifyRes = await api.post("/cart/verify-payment", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              alert("Payment Successful!");
              navigate("/success");
            }
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment verification failed");
          }
        },

        theme: { color: "#0d6efd" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Loading Summary...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="card p-8 w-[450px] shadow-md bg-white rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>

        <p className="text-lg font-semibold mb-4">
          Total Amount: <span className="text-blue-600">₹{amount}</span>
        </p>

        <button
          className="btn-primary w-full py-3 bg-blue-600 text-white rounded-lg"
          onClick={handlePayment}
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default Checkout;
