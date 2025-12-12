import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useLocation, useNavigate } from "react-router-dom";

const Checkout = () => {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderType, setOrderType] = useState("cart");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if context is passed from payment page
    const context = location.state?.context || "cart";
    setOrderType(context);
    
    if (location.state?.amount) {
      // If amount is passed from payment page, use it
      setAmount(location.state.amount);
      setLoading(false);
    } else {
      // Otherwise load from cart
      loadSummary();
    }
  }, [location.state]);

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
      // Use different API endpoints based on order type
      const endpoint = orderType === "appointment" 
        ? "/appointments/create-payment-order" 
        : "/cart/create-order";
      
      const res = await api.post(endpoint);
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
        description: orderType === "appointment" ? "Consultation Payment" : "Order Payment",
        order_id: order.id,

        handler: async function (response) {
          try {
            const verifyEndpoint = orderType === "appointment"
              ? "/appointments/verify-payment"
              : "/cart/verify-payment";
              
            const verifyRes = await api.post(verifyEndpoint, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              // Pass additional data if needed
              address: location.state?.address,
              items: location.state?.items
            });

            if (verifyRes.data.success) {
              if (orderType === "appointment") {
                // For appointments, show modal and redirect to appointments
                navigate("/success", { 
                  state: { 
                    type: "appointment",
                    data: verifyRes.data 
                  } 
                });
              } else {
                // For orders, show modal and redirect to orders
                navigate("/success", { 
                  state: { 
                    type: "order",
                    data: verifyRes.data 
                  } 
                });
              }
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
        
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-700">
            {orderType === "appointment" 
              ? "Consultation Payment" 
              : "Product Order Payment"}
          </p>
        </div>

        <p className="text-lg font-semibold mb-4">
          Total Amount: <span className="text-blue-600">₹{amount}</span>
        </p>

        <button
          className="btn-primary w-full py-3 bg-blue-600 text-white rounded-lg"
          onClick={handlePayment}
        >
          {orderType === "appointment" ? "Pay for Consultation" : "Pay for Order"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;