import React from 'react'
import { CheckCircle, X , Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 


export default function PaymentSuccessModalOrder({ open, onClose, data }) {
    const navigate = useNavigate();

    if(!open) return null;

    const { orderId, paymentId, amount, orderDetails } = data || {};

    function handlePrint(){
        window.print();
    }

    function handleViewDetails(){
        navigate("/orders");
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        
              <div className="relative bg-white max-w-md w-full rounded-lg shadow-lg p-6 z-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-emerald-100">
                      <CheckCircle className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Payment successful</h3>
                      <p className="text-sm text-gray-500">
                        Your order is confirmed.
                      </p>
                    </div>
                  </div>
        
                  <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
                    <X size={16} />
                  </button>
                </div>
        
                <div className="mt-4 space-y-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Order ID</div>
                        <div className="font-medium">{orderId ?? "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Payment ID</div>
                        <div className="font-medium">{paymentId ?? "N/A"}</div>
                      </div>
                      {orderDetails?.items && (
                        <div>
                          <div className="text-xs text-gray-500">Items</div>
                          <div className="font-medium">{orderDetails.items.length} item(s)</div>
                        </div>
                      )}
                  <div>
                    <div className="text-xs text-gray-500">Amount</div>
                    <div className="font-medium">₹{amount ? (amount/100).toFixed(2) : "0.00"}</div>
                  </div>
                </div>
        
                <div className="mt-6 flex gap-2 justify-end">
                  <button onClick={handlePrint} className="border rounded px-4 py-2 flex items-center gap-2">
                    <Printer size={14} /> Print
                  </button>

                  <button onClick={handleViewDetails} className="bg-emerald-600 text-white px-4 py-2 rounded">
                    View
                  </button>
                </div>
              </div>
            </div>
    )
}