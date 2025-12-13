import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  TestTube2,
  FileUp,
  Download,
  FlaskConical,
} from "lucide-react";

/* ---------------- MOCK DATA ---------------- */

const mockCatalog = [
  { id: 1, name: "Complete Blood Count", price: 450, active: true },
  { id: 2, name: "Thyroid Profile", price: 1200, active: true },
  { id: 3, name: "Lipid Profile", price: 900, active: false },
];

const mockOrders = [
  {
    id: "ORD-201",
    patient: "Ramesh Kumar",
    test: "CBC",
    status: "ORDERED",
    report: null,
  },
  {
    id: "ORD-202",
    patient: "Anitha S",
    test: "Thyroid Profile",
    status: "PROCESSING",
    report: "report.pdf",
  },
];

const tabs = ["Catalog", "Orders"];

/* ---------------- COMPONENT ---------------- */

export default function LabTests() {
  const [activeTab, setActiveTab] = useState("Catalog");
  const [catalog, setCatalog] = useState(mockCatalog);
  const [orders, setOrders] = useState(mockOrders);

  /* --------- CATALOG ACTIONS --------- */

  const toggleActive = (id) => {
    setCatalog((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, active: !t.active } : t
      )
    );
  };

  const deleteTest = (id) => {
    setCatalog((prev) => prev.filter((t) => t.id !== id));
  };

  /* --------- ORDER ACTIONS --------- */

  const advanceOrder = (id, next) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: next } : o
      )
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h2 className="text-2xl font-semibold text-gray-800">
          Lab Tests Management
        </h2>

        <div className="flex gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "Catalog" && (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Add Card */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center h-48 cursor-pointer"
            >
              <div className="text-center text-blue-600">
                <Plus size={32} />
                <p className="mt-2 font-medium">Add New Test</p>
              </div>
            </motion.div>

            {/* Existing Tests */}
            {catalog.map((test) => (
              <motion.div
                key={test.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-sm p-5 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">
                    {test.name}
                  </h3>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      test.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {test.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-gray-600">₹ {test.price}</p>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => toggleActive(test.id)}
                    className="text-sm text-blue-600"
                  >
                    Toggle Status
                  </button>

                  <div className="flex gap-3">
                    <Pencil size={16} className="text-gray-600 cursor-pointer" />
                    <Trash2
                      size={16}
                      onClick={() => deleteTest(test.id)}
                      className="text-red-600 cursor-pointer"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "Orders" && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-5"
          >
            {orders.map((o) => (
              <motion.div
                key={o.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{o.test}</h3>
                    <p className="text-sm text-gray-500">
                      {o.patient} • {o.id}
                    </p>
                  </div>

                  <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {o.status}
                  </span>
                </div>

                <div className="flex gap-3 mt-4">
                  {o.status === "ORDERED" && (
                    <button
                      onClick={() =>
                        advanceOrder(o.id, "PROCESSING")
                      }
                      className="btn-indigo"
                    >
                      <TestTube2 size={16} /> Collect Sample
                    </button>
                  )}

                  {o.status === "PROCESSING" && (
                    <button
                      onClick={() =>
                        advanceOrder(o.id, "COMPLETED")
                      }
                      className="btn-green"
                    >
                      <FileUp size={16} /> Upload Report
                    </button>
                  )}

                  {o.status === "COMPLETED" && (
                    <button className="btn-dark">
                      <Download size={16} /> Download
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
