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
    if (document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']")) {
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

  const [rzpOrder, setRzpOrder] = useState(state?.rzpOrder ?? null);
  const [appointmentId] = useState(state?.appointmentId ?? null);
  const [memberId] = useState(state?.memberId ?? null);
  const [doctor] = useState(state?.doctor ?? null);
  const [amount] = useState(state?.amount ?? (state?.rzpOrder?.amount ?? 0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedAddress, setSelectedAddress] = useState(state?.address ?? null);
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

    if (!rzpOrder) {
      setError("Payment order not found. Please go back and try again.");
      setLoading(false);
      return;
    }

    const options = {
      key: rzpOrder.key || window.__RAZORPAY_KEY__ || "",
      amount: rzpOrder.amount,
      currency: rzpOrder.currency || "INR",
      name: "CareMitra",
      description: `Order — ${doctor?.name ?? ""}`,
      order_id: rzpOrder.id,
      prefill: {
        name: state?.patientName || "",
        contact: state?.phone || "",
      },
      handler: async function (response) {
        try {
          const verifyPayload = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            appointmentId,
            memberId,
          };

          const res = await paymentAPI.verifyPayment(verifyPayload);
          const data = res.data ?? {};

          setSuccessData({
            appointmentId: data.appointmentId ?? appointmentId,
            paymentId: data.paymentId ?? response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            amount: data.amount ?? amount,
            doctor: data.doctor ?? doctor,
            specialty: data.specialty ?? state?.specialty,
          });
          setSuccessOpen(true);
          toast?.success?.("Payment verified and order confirmed");
        } catch (err) {
          console.error("Payment verification failed", err);
          const msg = err?.response?.data?.message || err.message || "Verification failed";
          setError(msg);
          toast?.error?.(msg);
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

  const handlePayClick = () => {
    if (!selectedAddress && paymentMethod !== "cod") {
      setError("Please select or add a delivery address (or choose Cash on Delivery).");
      return;
    }

    setError(null);

    if (paymentMethod === "upi") {
      navigate("/checkout", { 
        state: { 
          returnTo: "/orders",
          context: state?.context || "order",
          items: state?.items,
          amount: state?.amount,
          address: selectedAddress
        } 
      });
      return;
    }

    if (!selectedAddress && paymentMethod !== "cod") {
      setError("Please add a delivery address to continue.");
      setIsAddrOpen(true); // 🔥 open modal
      return;
    }


    if (paymentMethod === "card") {
      if (!rzpOrder) {
        navigate("/checkout", { state: { returnTo: "/orders" } });
        return;
      }
      startPayment();
    }
  };

  const handleAddressConfirm = (addr) => {
    setSelectedAddress(addr);
    setIsAddrOpen(false);
  };

  const onSuccessClose = () => {
    setSuccessOpen(false);
    setSuccessData(null);
    navigate("/orders");
  };

  return (
    <>
      <div className="max-w-3xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">Confirm & Pay</h2>

          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Delivery address</div>
            {selectedAddress ? (
              <div className="font-medium bg-gray-50 p-3 rounded">
                <div>{selectedAddress.name ?? selectedAddress.fullName ?? "Recipient"}</div>
                <div className="text-sm text-gray-700">{selectedAddress.addressLine1 ?? selectedAddress.house ?? selectedAddress.line1}</div>
                <div className="text-sm text-gray-700">{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode ?? selectedAddress.postalCode}</div>
                <div className="text-sm text-gray-700">Phone: {selectedAddress.phone}</div>
                <div className="mt-3">
                  <button onClick={() => setIsAddrOpen(true)} className="btn-outline text-sm px-3 py-1">Change</button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                No address selected. <button onClick={() => setIsAddrOpen(true)} className="btn-outline text-sm px-3 py-1">Add address</button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600">Order summary</div>
            <div className="font-medium text-lg">{(amount ? (amount / 100).toFixed(2) : (state?.amount ?? 0)) ? `₹${(amount ? (amount / 100).toFixed(2) : (state?.amount ?? 0))}` : "₹0.00"}</div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Payment method</div>
            <div className="grid grid-cols-3 gap-3">
              <label className={`p-3 border rounded cursor-pointer ${paymentMethod === "card" ? "border-sky-400 bg-sky-50" : "border-gray-200"}`}>
                <input type="radio" name="pm" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} /> <span className="ml-2">Card</span>
              </label>
              <label className={`p-3 border rounded cursor-pointer ${paymentMethod === "upi" ? "border-sky-400 bg-sky-50" : "border-gray-200"}`}>
                <input type="radio" name="pm" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} /> <span className="ml-2">UPI</span>
              </label>
              <label className={`p-3 border rounded cursor-pointer ${paymentMethod === "cod" ? "border-sky-400 bg-sky-50" : "border-gray-200"}`}>
                <input type="radio" name="pm" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} /> <span className="ml-2">COD</span>
              </label>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

          <div className="flex gap-2 mt-4">
            <button onClick={() => navigate(-1)} className="btn-outline px-4 py-2">Edit details</button>
            <button onClick={handlePayClick} disabled={loading} className="btn-primary px-4 py-2">
              {loading ? "Processing..." : paymentMethod === "cod" ? "Confirm (COD)" : paymentMethod === "upi" ? "Pay with UPI" : "Pay Now"}
            </button>
          </div>
        </motion.div>
      </div>

      <PaymentSuccessModalOrder open={successOpen} onClose={onSuccessClose} data={successData} />

      <AddressModal
        isOpen={isAddrOpen}
        onClose={() => setIsAddrOpen(false)}
        onConfirm={handleAddressConfirm}
      />
    </>
  );
}
