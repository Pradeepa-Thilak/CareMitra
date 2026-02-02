// src/pages/Payment.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { paymentAPI } from "../utils/api";
import PaymentSuccessModalOrder from "../components/modals/PaymentSuccessModalOrder";
import AddressModal from "../components/modals/AddressModal";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (
      document.querySelector(
        "script[src='https://checkout.razorpay.com/v1/checkout.js']",
      )
    ) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const patientId = user?._id;
  const [items] = useState(state?.items ?? []);
  const [amount] = useState(state?.amount ?? 0);
  const [rzpOrder, setRzpOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState(
    state?.address ?? null,
  );
  const [isAddrOpen, setIsAddrOpen] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    const savedAddress = localStorage.getItem("shippingAddress");
    if (savedAddress) {
      try {
        const parsedAddress = JSON.parse(savedAddress);
        setSelectedAddress(parsedAddress);
      } catch (err) {
        console.error("Failed to parse saved address:", err);
        localStorage.removeItem("shippingAddress");
      }
    }
  }, []);

  // Create Razorpay order
  async function createRazorpayOrder() {
    if (!patientId || !items.length) {
      setError("Invalid order details. Please try again.");
      return null;
    }

    setCreatingOrder(true);
    setError(null);

    try {
      const orderPayload = {
        patientId,
        items,
        totalAmount: amount,
        shippingAddress: selectedAddress,
      };

      const response = await paymentAPI.createOrder(orderPayload);
      const data = response.data?.data;

      setRzpOrder(data.rzpOrder);
      setCreatingOrder(false);
      return data.rzpOrder;
    } catch (err) {
      console.error("Failed to create Razorpay order:", err);
      const msg =
        err?.response?.data?.message || err.message || "Failed to create order";
      setError(msg);
      toast.error(msg);
      setCreatingOrder(false);
      return null;
    }
  }

  // Handle COD Order
  async function handleCODOrder() {
    setLoading(true);
    setError(null);

    try {
      const codOrderPayload = {
        patientId,
        items,
        totalAmount: amount,
        shippingAddress: {
          fullName: selectedAddress.name || selectedAddress.fullName,
          phone: selectedAddress.phone,
          addressLine1:
            selectedAddress.addressLine1 ||
            selectedAddress.house ||
            selectedAddress.line1,
          addressLine2: selectedAddress.addressLine2 || "",
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode || selectedAddress.postalCode,
        },
      };

      const response = await paymentAPI.createCODOrder(codOrderPayload);
      const data = response.data?.data;

      setSuccessData({
        orderId: data.orderId,
        paymentId: "COD",
        amount: data.totalAmount,
        items: data.items,
        orderStatus: data.orderStatus,
        paymentMethod: "cod",
      });

      setSuccessOpen(true);
      toast.success("Order confirmed! You'll pay cash on delivery.");
    } catch (err) {
      console.error("COD order creation failed:", err);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to create COD order";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  // Start Razorpay payment
  async function startPayment() {
    setLoading(true);
    setError(null);

    try {
      await loadRazorpayScript();
    } catch (err) {
      setError("Could not load payment gateway. Try again later.");
      setLoading(false);
      return;
    }

    // Create order if not exists
    let orderToUse = rzpOrder;
    if (!orderToUse) {
      orderToUse = await createRazorpayOrder();
      if (!orderToUse) {
        setLoading(false);
        return;
      }
    }

    const options = {
      key: orderToUse.key,
      amount: orderToUse.amount,
      currency: orderToUse.currency || "INR",
      name: "CareMitra",
      description: "Order Payment",
      order_id: orderToUse.id,
      prefill: {
        name: selectedAddress?.fullName || selectedAddress?.name || "",
        contact: selectedAddress?.phone || "",
      },
      handler: async function (response) {
        try {
          const verifyPayload = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };

          const res = await paymentAPI.verifyPayment(verifyPayload);
          const data = res.data?.data;

          setSuccessData({
            orderId: data.orderId,
            paymentId: data.paymentId,
            amount: data.amount,
            items: data.items,
            orderStatus: data.orderStatus,
            paymentStatus: data.paymentStatus,
          });

          setSuccessOpen(true);
          toast.success("Payment verified and order confirmed!");
        } catch (err) {
          console.error("Payment verification failed", err);
          const msg =
            err?.response?.data?.message ||
            err.message ||
            "Verification failed";
          setError(msg);
          toast.error(msg);
        } finally {
          setLoading(false);
        }
      },
      modal: {
        ondismiss: function () {
          setError("Payment cancelled");
          setLoading(false);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay open error:", err);
      setError("Payment popup failed to open");
      setLoading(false);
    }
  }

  const handlePayClick = async () => {
    // Address validation (required for all methods)
    if (!selectedAddress) {
      setError("Please select or add a delivery address to continue.");
      setIsAddrOpen(true);
      return;
    }

    setError(null);

    // Handle different payment methods
    if (paymentMethod === "cod") {
      handleCODOrder();
      return;
    }

    if (paymentMethod === "upi") {
      navigate("/checkout", {
        state: {
          returnTo: "/orders",
          items,
          amount,
          address: selectedAddress,
        },
      });
      return;
    }

    if (paymentMethod === "card") {
      startPayment();
    }
  };

  const handleAddressConfirm = (addr) => {
    setSelectedAddress(addr);
    localStorage.setItem("shippingAddress", JSON.stringify(addr));
    setIsAddrOpen(false);
  };

  const onSuccessClose = () => {
    setSuccessOpen(false);
    setSuccessData(null);
    navigate("/orders");
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-sky-500 to-blue-600 px-6 py-5">
              <h2 className="text-2xl font-bold text-white">Confirm & Pay</h2>
              <p className="text-sky-100 text-sm mt-1">
                Review your order details and complete payment
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Delivery Address Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Delivery Address
                  </h3>
                  <button
                    onClick={() => setIsAddrOpen(true)}
                    className="text-sm font-medium text-sky-600 hover:text-sky-700 px-4 py-2 rounded-lg hover:bg-sky-50 transition-colors border border-sky-200"
                  >
                    {selectedAddress ? "Change Address" : "Add Address"}
                  </button>
                </div>
                {selectedAddress ? (
                  <div className="bg-linear-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">
                        {selectedAddress.name ??
                          selectedAddress.fullName ??
                          "Recipient"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedAddress.addressLine1 ??
                          selectedAddress.house ??
                          selectedAddress.line1}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedAddress.city}, {selectedAddress.state} -{" "}
                        {selectedAddress.pincode ?? selectedAddress.postalCode}
                      </div>
                      <div className="text-sm text-gray-600">
                        Phone: {selectedAddress.phone}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <span className="text-sm text-amber-800">
                      No address selected. Please add a delivery address to
                      continue.
                    </span>
                  </div>
                )}
              </div>

              {/* Order Summary Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Order Summary
                </h3>
                <div className="bg-linear-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{amount.toFixed(2)}
                    </span>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-gray-600">
                         Pay ₹{amount.toFixed(2)} in cash when your order is
                        delivered
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Payment Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`relative cursor-pointer transition-all duration-200 ${
                      paymentMethod === "card"
                        ? "ring-2 ring-sky-500 bg-sky-50"
                        : "border border-gray-300 hover:border-sky-300 bg-white"
                    } rounded-xl p-4`}
                  >
                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <svg
                        className={`w-8 h-8 ${paymentMethod === "card" ? "text-sky-600" : "text-gray-400"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span
                        className={`text-sm font-medium ${paymentMethod === "card" ? "text-sky-700" : "text-gray-700"}`}
                      >
                        Card
                      </span>
                    </div>
                  </label>

                  <label
                    className={`relative cursor-pointer transition-all duration-200 ${
                      paymentMethod === "upi"
                        ? "ring-2 ring-sky-500 bg-sky-50"
                        : "border border-gray-300 hover:border-sky-300 bg-white"
                    } rounded-xl p-4`}
                  >
                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <svg
                        className={`w-8 h-8 ${paymentMethod === "upi" ? "text-sky-600" : "text-gray-400"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <span
                        className={`text-sm font-medium ${paymentMethod === "upi" ? "text-sky-700" : "text-gray-700"}`}
                      >
                        UPI
                      </span>
                    </div>
                  </label>

                  <label
                    className={`relative cursor-pointer transition-all duration-200 ${
                      paymentMethod === "cod"
                        ? "ring-2 ring-sky-500 bg-sky-50"
                        : "border border-gray-300 hover:border-sky-300 bg-white"
                    } rounded-xl p-4`}
                  >
                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <svg
                        className={`w-8 h-8 ${paymentMethod === "cod" ? "text-sky-600" : "text-gray-400"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span
                        className={`text-sm font-medium ${paymentMethod === "cod" ? "text-sky-700" : "text-gray-700"}`}
                      >
                        COD
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3"
                >
                  <svg
                    className="w-5 h-5 text-red-600 mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-red-800">{error}</span>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  Edit Details
                </button>
                <button
                  onClick={handlePayClick}
                  disabled={loading || creatingOrder}
                  className="flex-1 bg-linear-to-r from-sky-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {loading || creatingOrder ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {creatingOrder ? "Creating order..." : "Processing..."}
                    </span>
                  ) : paymentMethod === "cod" ? (
                    "Confirm Order (COD)"
                  ) : paymentMethod === "upi" ? (
                    "Pay with UPI"
                  ) : (
                    "Pay Now"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <PaymentSuccessModalOrder
        open={successOpen}
        onClose={onSuccessClose}
        data={successData}
      />

      <AddressModal
        isOpen={isAddrOpen}
        onClose={() => setIsAddrOpen(false)}
        onConfirm={handleAddressConfirm}
        initialData={selectedAddress}
      />
    </>
  );
}
