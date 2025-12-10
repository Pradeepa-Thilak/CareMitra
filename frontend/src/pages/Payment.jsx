// src/pages/Payment.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { paymentAPI } from "../utils/api";
import PaymentSuccessModal from "../components/modals/PaymentSuccessModal";
import { toast } from "react-hot-toast";

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

  // modal state
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (!rzpOrder) setError("No payment info available. Please go back and try again.");
  }, [rzpOrder]);

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

    const options = {
      key: rzpOrder.key || window.__RAZORPAY_KEY__ || "",
      amount: rzpOrder.amount,
      currency: rzpOrder.currency || "INR",
      name: "CareMitra",
      description: `Consultation — ${doctor?.name ?? ""}`,
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
          toast?.success?.("Payment verified and appointment confirmed");
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

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Payment</h2>
          <div className="text-sm text-red-600 mb-4">{error}</div>
          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="border rounded px-4 py-2">Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Confirm & Pay</h2>

          <div className="mb-4">
            <div className="text-sm text-gray-600">Specialty</div>
            <div className="font-medium">{state?.specialty}</div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600">Doctor</div>
            <div className="font-medium">{doctor?.name ?? "Assigned by system"}</div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600">Amount</div>
            <div className="font-medium">₹{(amount / 100).toFixed(2)}</div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="border rounded px-4 py-2">Edit details</button>
            <button onClick={startPayment} disabled={loading} className="bg-sky-600 text-white px-4 py-2 rounded">
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </div>
      </div>

      <PaymentSuccessModal
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          // redirect to appointments after closing
          navigate("/appointments");
        }}
        data={successData}
      />
    </>
  );
}
