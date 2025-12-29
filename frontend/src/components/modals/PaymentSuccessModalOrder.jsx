import React from "react";
import { CheckCircle } from "lucide-react";

const PaymentSuccessModalOrder = ({ open, onClose, data }) => {
  if (!open || !data) return null;

  const orderDate = new Date(data.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md text-center">
        
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

        <h2 className="text-2xl font-bold text-green-600 mb-2">
          Order Placed Successfully!
        </h2>

        <p className="text-gray-600 mb-4">
          Your order <span className="font-semibold">{data.orderId}</span> was
          placed on <span className="font-semibold">{orderDate}</span>.
        </p>

        <div className="bg-gray-100 rounded-lg p-4 mb-4 text-sm text-gray-700">
          <p>
            💳 <strong>Total Amount:</strong> ₹{data.totalAmount}
          </p>
          <p className="mt-1">
            🚚 <strong>Delivery:</strong> Your product will be delivered within{" "}
            <strong>5–7 working days</strong>.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          View My Orders
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessModalOrder;
  