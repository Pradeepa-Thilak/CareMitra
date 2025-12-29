import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  TestTube2,
  FileUp,
  Download,
  Search,
} from "lucide-react";

import AddEditLabTestForm from "../components/forms/LabTestCreateForm";
import LabTestDetailsModal from "../components/modals/LabTestDetailsModal";
import { labTestAPI  } from "../utils/api";

const TABS = ["Catalog", "Orders"];
const ITEMS_PER_PAGE = 6;

export default function LabTests() {
  const [activeTab, setActiveTab] = useState("Catalog");
  const [catalog, setCatalog] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  /* ---------------- FETCH LAB TESTS ---------------- */

  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        setLoading(true);
        const res = await labTestAPI.getLabTest();
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        setCatalog(data);
      } catch (err) {
        console.error("Failed to fetch lab tests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLabTests();
  }, []);


  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const res = await  labTestAPI.getOrders();
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setOrders(data);
      console.log(res.data);
      
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  if (activeTab === "Orders") {
    fetchOrders();
  }
}, [activeTab]);

  /* ---------------- ACTIONS ---------------- */

  const toggleActive = async (id) => {
    try {
      const res = await labTestAPI.activeStatus(id);
      setCatalog((prev) =>
        prev.map((t) => (t._id === id ? res.data : t))
      );
    } catch (err) {
      console.error("Toggle status failed", err);
    }
  };

  const deleteTest = async (id) => {
    try {
      await labTestAPI.deleteLabTest(id);
      setCatalog((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const saveTest = async (data) => {
    try {
      let res;
      if (data._id) {
        res = await labTestAPI.editLabTest(data._id, data);
        setCatalog((prev) =>
          prev.map((t) => (t._id === data._id ? res.data : t))
        );
      } else {
        res = await labTestAPI.createLabTest(data);
        setCatalog((prev) => [...prev, res.data]);
      }
      setShowForm(false);
    } catch (err) {
      console.error("Save failed", err);
    }
  };



  const markSampleCollected = async (id) => {
  await labTestAPI.updateSampleStatus(id);
  setOrders((prev) =>
    prev.map((o) =>
      o._id === id ? { ...o, orderStatus: "processing" } : o
    )
  );
};

const markCompleted = async (id) => {
  await labTestAPI.updateProcessingStatus(id);
  setOrders((prev) =>
    prev.map((o) =>
      o._id === id ? { ...o, orderStatus: "completed" } : o
    )
  );
};

const handleUploadReport = async (orderId, file) => {
  const formData = new FormData();
  formData.append("report", file);

  await labTestAPI.uploadReport(orderId, formData);

  setOrders((prev) =>
    prev.map((o) =>
      o._id === orderId ? { ...o, orderStatus: "completed" } : o
    )
  );
};

const downloadPrescription = async (razorpayOrderId) => {
  try {
    const res = await labTestAPI.downloadPrescription(razorpayOrderId);

    const contentType = res.headers["content-type"];

    const blob = new Blob([res.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = contentType.includes("pdf")
      ? "prescription.pdf"
      : "prescription.jpg";

    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download prescription");
  }
};






  /* ---------------- FILTER + PAGINATION ---------------- */

  const filteredCatalog = useMemo(() => {
    const q = search.toLowerCase();
    return catalog.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.sampleType?.toLowerCase().includes(q) ||
        t.reportTime?.toLowerCase().includes(q)
    );
  }, [catalog, search]);

  const totalPages = Math.ceil(filteredCatalog.length / ITEMS_PER_PAGE);

  const paginatedCatalog = filteredCatalog.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Lab Tests Management
        </h2>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-2.5 text-gray-400"
          />
          <input
            placeholder="Search tests..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div className="flex gap-2">
          {TABS.map((tab) => (
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
      </div>

      {/* CONTENT */}
      <AnimatePresence mode="wait">
        {activeTab === "Catalog" && (
          <>
            {/* LOADING */}
            {loading && (
              <div className="text-center py-10 text-gray-500">
                Loading lab tests...
              </div>
            )}

            {/* EMPTY */}
            {!loading && filteredCatalog.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                No lab tests found
              </div>
            )}

            {/* GRID */}
            {!loading && filteredCatalog.length > 0 && (
              <motion.div
                key="catalog"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/* ADD CARD */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  onClick={() => {
                    setSelectedTest(null);
                    setShowForm(true);
                  }}
                  className="border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center h-48 cursor-pointer"
                >
                  <div className="text-center text-blue-600">
                    <Plus size={32} />
                    <p className="mt-2 font-medium">Add New Test</p>
                  </div>
                </motion.div>

                {/* TEST CARDS */}
                {paginatedCatalog.map((test) => (
                  <motion.div
                    key={test._id}
                    whileHover={{ y: -5 }}
                    onClick={() => {
                      setSelectedTest(test);
                      setShowDetailsModal(true);
                    }}
                    className="bg-white rounded-xl shadow-sm p-5 space-y-3"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{test.name}</h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          test.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {test.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="text-gray-600">₹ {test.price}</p>

                    <div className="flex justify-between pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActive(test._id);
                        }}
                        className="text-sm text-blue-600"
                      >
                        Toggle Status
                      </button>

                      <div className="flex gap-3">
                        <Pencil
                          size={16}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTest(test);
                            setShowForm(true);
                          }}
                          className="cursor-pointer"
                        />
                        <Trash2
                          size={16}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTest(test._id);
                          }}
                          className="text-red-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* FORM MODAL */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 bg-black/30 z-40">
            <AddEditLabTestForm
              initialData={selectedTest}
              onSave={saveTest}
              onClose={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILS MODAL */}
      <AnimatePresence>
        {showDetailsModal && (
          <LabTestDetailsModal
            test={selectedTest}
            onClose={() => setShowDetailsModal(false)}
            onEdit={() => {
              setShowDetailsModal(false);
              setShowForm(true);
            }}
          />
        )}

        {activeTab === "Orders" && (
  <motion.div
    key="orders"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="space-y-5"
  >
    {orders.length === 0 && (
      <div className="text-center py-10 text-gray-400">
        No lab orders found
      </div>
    )}

    {orders.map((order) => (
      <motion.div
        key={order._id}
        whileHover={{ scale: 1.01 }}
        className="bg-white rounded-xl shadow-sm p-6 space-y-4"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">
              {order.tests[0]?.name}
            </h3>
            <p className="text-sm text-gray-500">
              Order ID: {order._id}
            </p>
          </div>

          <span
            className={`px-3 py-1 text-xs rounded-full ${
              order.orderStatus === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : order.orderStatus === "processing"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {order.orderStatus}
          </span>
        </div>

        {/* PATIENT DETAILS */}
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><b>Name:</b> {order.sampleCollectionDetails?.name}</p>
            <p><b>Phone:</b> {order.sampleCollectionDetails?.phone}</p>
            <p><b>Address:</b> {order.sampleCollectionDetails?.address}</p>
          </div>

          <div>
            <p><b>Payment:</b> {order.paymentStatus}</p>
            <p><b>Total:</b> ₹{order.totalAmount}</p>
            <p><b>Date:</b> {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 flex-wrap">

          {/* SAMPLE COLLECTED */}
          {order.orderStatus === "pending" && (
            <button
              onClick={() => markSampleCollected(order._id)}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded"
            >
              <TestTube2 size={16} />
              Sample Collected
            </button>
          )}

          {/* UPLOAD REPORT */}
          {order.orderStatus === "processing" && (
            <label className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded cursor-pointer">
              <FileUp size={16} />
              Upload Report
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.png"
                onChange={(e) =>
                  handleUploadReport(order._id, e.target.files[0])
                }
              />
            </label>
          )}

          {/* DOWNLOAD PRESCRIPTION */}
          {order.razorpayOrderId && (
            <button
              onClick={() => downloadPrescription(order.razorpayOrderId)}
              className="flex items-center gap-1 px-4 py-2 bg-gray-800 text-white rounded"
            >
              <Download size={16} />
              Prescription
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
