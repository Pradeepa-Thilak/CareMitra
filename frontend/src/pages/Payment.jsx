// src/pages/Payment.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { paymentAPI } from "../utils/api";
import PaymentSuccessModal from "../components/modals/PaymentSuccessModal";
import AddressModal from "../components/modals/AddressModal"; // if present in your project
import { toast } from "react-hot-toast";

/* unchanged Razorpay loader and startPayment handler are preserved below (startPayment reused) */
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

  // Preserve previous payment-related state (if anything is passed via location.state)
  const [rzpOrder, setRzpOrder] = useState(state?.rzpOrder ?? null);
  const [appointmentId] = useState(state?.appointmentId ?? null);
  const [memberId] = useState(state?.memberId ?? null);
  const [doctor] = useState(state?.doctor ?? null);
  // amount might come in paise (from server/order) or as rupees depending on where it came from.
  // We keep it as-is and display using the same conversion you used earlier where appropriate.
  const [amount] = useState(state?.amount ?? (state?.rzpOrder?.amount ?? 0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // address + modal
  const [selectedAddress, setSelectedAddress] = useState(state?.address ?? null);
  const [isAddrOpen, setIsAddrOpen] = useState(false);

  // payment method: "card" | "upi" | "cod"
  const [paymentMethod, setPaymentMethod] = useState("card");

  // modal state
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    // Only set error if we are expected to have an rzpOrder (i.e., the page was reached with expectation to pay via Razorpay)
    // NOTE: if user will choose UPI then they will be redirected to /checkout which will create the rzp order itself,
    // so lack of rzpOrder here is not fatal unless user expects direct Razorpay flow from this page.
    if (!rzpOrder && paymentMethod !== "upi") {
      // not fatal immediately; we only warn if user tries to pay directly with Razorpay without an order
      // keep it as a soft message in UI rather than blocking here
    }
  }, [rzpOrder, paymentMethod]);

  // Reuse your original startPayment function (kept intact) to open Razorpay from this page
  // BUT we will only call this if: paymentMethod === "card" AND rzpOrder exists.
  // Your requirement: "if user clicks upi mode means only the checkout page should open the razorpay otherwise the success modal should order confirmed"
  // So for UPI we redirect to /checkout (do not call startPayment here).
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
        // response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        try {
          const verifyPayload = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            appointmentId,
            memberId,
          };

          // VERIFY on backend (if backend ready)
          const res = await paymentAPI.verifyPayment(verifyPayload);
          // expected res.data = { ok: true, appointmentId, paymentId, amount, doctor, specialty }
          const data = res.data ?? {};

          // show success modal using server-provided values or fallback
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
    // validation: address required except for COD? (you said page should ask for address)
    if (!selectedAddress && paymentMethod !== "cod") {
      setError("Please select or add a delivery address (or choose Cash on Delivery).");
      return;
    }

    setError(null);

    if (paymentMethod === "upi") {
      // REQUIREMENT: only the checkout page should open the razorpay
      // So redirect to /checkout. We pass a small state object so checkout can access amount/items if needed.
      // (We did not change checkout's functions; checkout will still call its /cart/create-order and open Razorpay.)
      navigate("/checkout", { state: { returnTo: "/orders" } });
      return;
    }

    if (paymentMethod === "cod") {
      // Simulate success (no Razorpay)
      const orderId = `COD_${Date.now()}`;
      const result = {
        orderId,
        paymentId: orderId,
        amount,
        items: state?.items ?? [],
        address: selectedAddress,
        cod: true,
      };
      setSuccessData(result);
      setSuccessOpen(true);
      return;
    }

    // For card: we will attempt to open Razorpay here IF rzpOrder is provided (preserves original startPayment).
    // If rzpOrder is not present, show error asking user to create order (or go to checkout to create one).
    if (paymentMethod === "card") {
      if (!rzpOrder) {
        // To keep your checkout logic untouched, we instruct user to use checkout to create an order if needed.
        // But we try to be helpful: redirect to checkout so it can create order + open Razorpay
        // (If you prefer to create order via API from here, we can implement that instead — say so.)
        navigate("/checkout", { state: { returnTo: "/orders" } });
        return;
      }
      // rzpOrder exists — open Razorpay (existing verified flow)
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
    // After confirmation closes, go to orders page (per your requirement)
    navigate("/orders");
  };

  return (
    <>
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Confirm & Pay</h2>

          <div className="mb-4">
            <div className="text-sm text-gray-600">Delivery address</div>
            {selectedAddress ? (
              <div className="font-medium">
                <div>{selectedAddress.name ?? selectedAddress.fullName ?? "Recipient"}</div>
                <div>{selectedAddress.house ?? selectedAddress.line1}</div>
                {selectedAddress.street && <div>{selectedAddress.street}</div>}
                <div>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode ?? selectedAddress.postalCode}</div>
                {selectedAddress.phone && <div>Phone: {selectedAddress.phone}</div>}
                <div className="mt-2">
                  <button onClick={() => setIsAddrOpen(true)} className="text-sm btn-outline px-3 py-1">Change</button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                No address selected. <button onClick={() => setIsAddrOpen(true)} className="text-sm btn-outline px-3 py-1">Add address</button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600">Order summary</div>
            <div className="font-medium">{(amount ? (amount / 100).toFixed(2) : (state?.amount ?? 0)) ? `₹${(amount ? (amount / 100).toFixed(2) : (state?.amount ?? 0))}` : "₹0.00"}</div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600">Payment method</div>
            <div className="mt-2 flex gap-3">
              <label className={`p-2 border rounded cursor-pointer ${paymentMethod === "card" ? "border-sky-400 bg-sky-50" : "border-gray-200"}`}>
                <input type="radio" name="pm" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} /> Card
              </label>
              <label className={`p-2 border rounded cursor-pointer ${paymentMethod === "upi" ? "border-sky-400 bg-sky-50" : "border-gray-200"}`}>
                <input type="radio" name="pm" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} /> UPI
              </label>
              <label className={`p-2 border rounded cursor-pointer ${paymentMethod === "cod" ? "border-sky-400 bg-sky-50" : "border-gray-200"}`}>
                <input type="radio" name="pm" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} /> COD
              </label>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="border rounded px-4 py-2">Edit details</button>
            <button onClick={handlePayClick} disabled={loading} className="bg-sky-600 text-white px-4 py-2 rounded">
              {loading ? "Processing..." : paymentMethod === "cod" ? "Confirm Order (COD)" : paymentMethod === "upi" ? "Pay with UPI (opens checkout)" : "Pay Now"}
            </button>
          </div>
        </div>
      </div>

      <PaymentSuccessModal
        open={successOpen}
        onClose={onSuccessClose}
        data={successData}
      />

      {/* AddressModal should exist in your project — if not, the Add address button will still open nothing;
          replace with your own address selector/modal implementation */}
      {typeof AddressModal !== "undefined" && (
        <AddressModal isOpen={isAddrOpen} onClose={() => setIsAddrOpen(false)} onConfirm={handleAddressConfirm} />
      )}
    </>
  );
}
