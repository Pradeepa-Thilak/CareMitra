import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // your axios instance
import LoadSpinner from "../components/LoadSpinner";
import { CreditCard, X, Printer, ArrowRightCircle, Repeat } from "lucide-react";

// Orders page
// - Fetches /orders (expects an array of order objects)
// - Shows list with basic meta + status
// - Allows opening a detail drawer/modal and printing receipt
// - Minimal, easy to adapt to your backend shape

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null); // selected order to show details
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/orders");
      // Expect res.data to be array of orders. Adapt if API returns { data: [...] }
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setError("Unable to load orders. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (o) => {
    const w = window.open("", "_blank", "width=700,height=900");
    const html = `
      <html>
        <head>
          <title>Receipt - ${o.orderId || o.id}</title>
          <style>
            body{font-family: Arial, sans-serif;padding:20px;color:#111}
            h1{color:#0ea5e9}
            table{width:100%;border-collapse:collapse;margin-top:12px}
            th,td{border:1px solid #ddd;padding:8px;text-align:left}
            .total{font-weight:700}
          </style>
        </head>
        <body>
          <h1>Payment Receipt</h1>
          <div><strong>Order:</strong> ${o.orderId || o.id}</div>
          <div><strong>Payment:</strong> ${o.paymentId || "—"}</div>
          <div><strong>Date:</strong> ${new Date(o.createdAt || Date.now()).toLocaleString()}</div>
          <div><strong>Amount:</strong> ₹${(o.totalAmount ?? o.amount ?? 0).toFixed(2)}</div>
          <table>
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
            <tbody>
              ${(o.items || []).map(i => `<tr><td>${i.name}</td><td>${i.quantity ?? 1}</td><td>₹${((i.price||0) * (i.quantity||1)).toFixed(2)}</td></tr>`).join("")}
            </tbody>
          </table>
          <p style="margin-top:20px">Thank you for shopping with us.</p>
          <script>window.print()</script>
        </body>
      </html>
    `;
    w.document.write(html);
    w.document.close();
  };

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    return (o.status || "unknown").toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Orders</h1>
          <div className="flex items-center gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button onClick={fetchOrders} className="btn-outline px-3 py-2"><Repeat className="w-4 h-4" /></button>
          </div>
        </div>

        {loading ? (
          <div className="card p-6 flex items-center justify-center"><LoadSpinner /></div>
        ) : error ? (
          <div className="card p-6 text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="card p-6 text-center">
            <div className="text-lg font-medium">No orders found</div>
            <div className="text-sm text-gray-500 mt-2">Looks like you haven't placed any orders yet.</div>
            <div className="mt-4">
              <button onClick={() => navigate('/')} className="btn-primary px-4 py-2">Continue Shopping</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((o) => (
              <div key={o.id || o.orderId} className="card p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">{new Date(o.createdAt || Date.now()).toLocaleDateString()}</div>
                    <div className="font-medium">{o.orderId || o.id}</div>
                    <div className={`ml-3 px-2 py-1 rounded text-xs ${((o.status||'') === 'paid' || (o.status||'') === 'delivered') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                      {o.status || 'unknown'}
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-600">Items: {(o.items || []).length} • Amount: ₹{(o.totalAmount ?? o.amount ?? 0).toFixed(2)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(o)} className="btn-outline px-3 py-2 text-sm flex items-center gap-2"><ArrowRightCircle className="w-4 h-4"/> Details</button>
                  <button onClick={() => printReceipt(o)} className="btn-primary px-3 py-2 text-sm flex items-center gap-2"><Printer className="w-4 h-4"/> Receipt</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail drawer/modal */}
        {selected && (
          <div className="fixed inset-0 z-60 flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
            <div className="relative bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-gray-500">{new Date(selected.createdAt || Date.now()).toLocaleString()}</div>
                  <h2 className="text-lg font-semibold mt-1">Order {selected.orderId || selected.id}</h2>
                  <div className="text-sm text-gray-600 mt-2">Status: <span className="font-medium">{selected.status || '—'}</span></div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded hover:bg-gray-100"><X /></button>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Items</h4>
                  <div className="space-y-2">
                    {(selected.items || []).map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b last:border-b-0 pb-2">
                        <div>
                          <div className="font-medium">{it.name}</div>
                          <div className="text-xs text-gray-500">Qty: {it.quantity ?? 1}</div>
                        </div>
                        <div className="font-medium">₹{((it.price||0) * (it.quantity||1)).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Summary</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div><strong>Payment ID:</strong> {selected.paymentId || '—'}</div>
                    <div><strong>Amount:</strong> ₹{(selected.totalAmount ?? selected.amount ?? 0).toFixed(2)}</div>
                    <div><strong>Address:</strong>
                      <div className="text-xs text-gray-600 mt-1">
                        {selected.address ? (
                          <>
                            <div>{selected.address.name || selected.address.fullName}</div>
                            <div>{selected.address.house || selected.address.line1}</div>
                            <div>{selected.address.city}, {selected.address.state} - {selected.address.pincode || selected.address.postalCode}</div>
                            {selected.address.phone && <div>Phone: {selected.address.phone}</div>}
                          </>
                        ) : <div className="text-gray-400">No address</div>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => printReceipt(selected)} className="btn-outline flex-1 py-2 flex items-center justify-center gap-2"><Printer className="w-4 h-4"/> Print</button>
                    <button onClick={() => { setSelected(null); navigate('/'); }} className="btn-primary flex-1 py-2">Continue Shopping</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
