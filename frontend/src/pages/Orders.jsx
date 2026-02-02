import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import LoadSpinner from "../components/LoadSpinner";
import { X, Printer, ArrowRightCircle, Repeat, Package, Clock, CheckCircle, Truck } from "lucide-react";

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  // Get current user ID
  const getUserId = () => {
    return (
      localStorage.getItem("userId") ||
      localStorage.getItem("patientId") ||
      localStorage.getItem("user_id") ||
      null
    );
  };
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = getUserId();

      if (!userId) {
        setError("Please login to view your orders");
        navigate("/login");
        return;
      }

      // Call the corrected API endpoint
      const res = await api.get(`/orders/patient/${userId}`);

      console.log("📦 Fetched orders:", res.data);

      // Ensure array
      const fetchedOrders = res.data?.data || res.data?.orders || [];
      setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);

    } catch (err) {
      console.error("Fetch orders error:", err);
      
      if (err.response?.status === 401) {
        setError("Please login to view orders");
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to load orders");
      }
      
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchOrdersByStatus = async (status) => {
    try {
      setLoading(true);
      setError("");

      const userId = getUserId();

      if (!userId) {
        setError("Please login to view your orders");
        navigate("/login");
        return;
      }

      const res = await api.get(`/orders/patient/${userId}?status=${status}`);
      
      const fetchedOrders = res.data?.data || res.data?.orders || [];
      setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);

    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter === "all") {
      fetchOrders();
    } else {
      fetchOrdersByStatus(filter);
    }
  }, [filter]);

  const printReceipt = (o) => {
    const w = window.open("", "_blank", "width=700,height=900");
    const html = `
      <html>
        <head>
          <title>Receipt - ${o.orderId || o.id}</title>
          <style>
            body{font-family:Arial;padding:20px}
            table{width:100%;border-collapse:collapse;margin-top:12px}
            th,td{border:1px solid #ddd;padding:8px}
          </style>
        </head>
        <body>
          <h2>Payment Receipt</h2>
          <p><b>Order:</b> ${o.orderId || o.id}</p>
          <p><b>Date:</b> ${new Date(o.orderDate || o.createdAt).toLocaleString()}</p>
          <p><b>Total:</b> ₹${(o.totalAmount ?? 0).toFixed(2)}</p>
          <table>
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
            <tbody>
              ${(o.items || []).map(i =>
                `<tr><td>${i.name}</td><td>${i.quantity ?? 1}</td><td>₹${((i.price||0)*(i.quantity||1)).toFixed(2)}</td></tr>`
              ).join("")}
            </tbody>
          </table>
          <script>window.print()</script>
        </body>
      </html>
    `;
    w.document.write(html);
    w.document.close();
  };

  const getStatusConfig = (status) => {
    const statusLower = (status || "").toLowerCase();
    switch (statusLower) {
      case "pending":
        return { icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200", label: "Pending" };
      case "confirmed":
        return { icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200", label: "Confirmed" };
      case "processing":
        return { icon: Package, color: "text-blue-600 bg-blue-50 border-blue-200", label: "Processing" };
      case "shipped":
        return { icon: Truck, color: "text-purple-600 bg-purple-50 border-purple-200", label: "Shipped" };
      case "delivered":
        return { icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200", label: "Delivered" };
      case "cancelled":
        return { icon: X, color: "text-red-600 bg-red-50 border-red-200", label: "Cancelled" };
      default:
        return { icon: Package, color: "text-gray-600 bg-gray-50 border-gray-200", label: status || "Unknown" };
    }
  };

  const filtered = orders.filter(o => {
    if (filter === "all") return true;
    return (o.orderStatus || "").toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen py-8 bg-linear-to-br from-gray-50 to-gray-100">
      <div className="container-custom max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
              <p className="text-gray-500 mt-1">Track and manage your medical orders</p>
            </div>

            <div className="flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button 
                onClick={fetchOrders} 
                className="border border-gray-300 rounded-lg px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-700"
              >
                <Repeat className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 flex justify-center">
            <LoadSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">{error}</p>
            <button 
              onClick={() => navigate("/login")}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <button 
              onClick={() => navigate("/")} 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(o => {
              const statusConfig = getStatusConfig(o.orderStatus);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div 
                  key={o._id || o.orderId} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900 text-lg">
                          {o.orderId}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Total:</span>{" "}
                          <span className="text-gray-900 font-semibold">₹{(o.totalAmount ?? 0).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Items:</span>{" "}
                          <span className="text-gray-900">{(o.items || []).length}</span>
                        </div>
                        <div>
                          <span className="font-medium">Payment:</span>{" "}
                          <span className={`${o.paymentDetails?.paymentStatus === 'completed' ? 'text-green-600' : 'text-amber-600'} font-semibold`}>
                            {o.paymentDetails?.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                        {(o.orderDate || o.createdAt) && (
                          <div>
                            <span className="font-medium">Date:</span>{" "}
                            <span className="text-gray-900">{new Date(o.orderDate || o.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelected(o)} 
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                      >
                        <ArrowRightCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Details</span>
                      </button>
                      <button 
                        onClick={() => printReceipt(o)} 
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Print</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Details
                  </h2>
                  <p className="text-gray-500 mt-1">{selected.orderId}</p>
                </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex gap-3">
                  {(() => {
                    const statusConfig = getStatusConfig(selected.orderStatus);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig.label}
                      </span>
                    );
                  })()}
                  
                  {/* Payment Status */}
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
                    selected.paymentDetails?.paymentStatus === 'completed' 
                      ? 'text-green-600 bg-green-50 border-green-200'
                      : 'text-amber-600 bg-amber-50 border-amber-200'
                  }`}>
                    {selected.paymentDetails?.paymentStatus === 'completed' ? '💳 Paid' : '⏳ Payment Pending'}
                  </span>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-semibold text-gray-900">
                      {(selected.orderDate || selected.createdAt) ? new Date(selected.orderDate || selected.createdAt).toLocaleString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-semibold text-gray-900">{(selected.items || []).length}</span>
                  </div>
                  {selected.paymentDetails?.razorpayPaymentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-mono text-sm text-gray-900">{selected.paymentDetails.razorpayPaymentId}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg pt-3 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-blue-600">₹{(selected.totalAmount ?? 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                {selected.shippingAddress && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm">
                      <p className="font-medium text-gray-900">{selected.shippingAddress.fullName}</p>
                      <p className="text-gray-600 mt-1">{selected.shippingAddress.addressLine1}</p>
                      {selected.shippingAddress.addressLine2 && (
                        <p className="text-gray-600">{selected.shippingAddress.addressLine2}</p>
                      )}
                      <p className="text-gray-600">
                        {selected.shippingAddress.city}, {selected.shippingAddress.state} - {selected.shippingAddress.pincode}
                      </p>
                      <p className="text-gray-600 mt-1">Phone: {selected.shippingAddress.phone}</p>
                    </div>
                  </div>
                )}

                {/* Items List */}
                {selected.items && selected.items.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                    <div className="space-y-2">
                      {selected.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name || "Item"}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity ?? 1} × ₹{(item.price || 0).toFixed(2)}</p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => printReceipt(selected)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}