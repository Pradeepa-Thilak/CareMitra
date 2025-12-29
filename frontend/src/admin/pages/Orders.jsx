import React, { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../utils/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0 });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await getAllOrders();
    setOrders(res.data.orders);
    setSummary(res.data.summary);
  };

  const handleStatusChange = async (id, status) => {
    await updateOrderStatus(id, status);
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      {/* SUMMARY */}
      <div className="flex gap-4">
        <div className="bg-white p-4 rounded shadow text-sm">
          <p>Total Orders</p>
          <p className="text-xl font-bold">{summary.totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-sm">
          <p>Total Revenue</p>
          <p className="text-xl font-bold">₹{summary.totalRevenue}</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="p-3">{o._id}</td>

                <td className="p-3">
                  <p className="font-medium">{o.patientId?.name}</p>
                  <p className="text-xs text-gray-500">
                    {o.patientId?.phone}
                  </p>
                </td>

                <td className="p-3">
                  {o.items.map((i, idx) => (
                    <p key={idx} className="text-xs">
                      {i.name} × {i.quantity}
                    </p>
                  ))}
                </td>

                <td className="p-3 font-medium">₹{o.totalAmount}</td>

                <td className="p-3">
                  <select
                    value={o.orderStatus}
                    onChange={(e) =>
                      handleStatusChange(o._id, e.target.value)
                    }
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="text-center p-6 text-gray-500">No orders found</p>
        )}
      </div>
    </div>
  );
}
