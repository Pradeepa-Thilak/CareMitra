import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  TestTube2,
  FileUp,
  Download,
  FlaskConical,
  Search,
} from "lucide-react";
import AddEditLabTestForm from "../components/forms/LabTestCreateForm";
import LabTestDetailsModal from "../components/modals/LabTestDetailsModal";
import { labTestAPI } from "../utils/api";

/* ---------------- MOCK DATA ---------------- */

const mockCatalog = [
  {
  id: 1,
  name: "CBC",
  price: 450,
  discountedPrice: 400,
  isActive: true,
  sampleType: "Blood",
  reportTime: "6–8 hrs"
},
{
  id: 2,
  name: "Thyroid",
  price: 450,
  discountedPrice: 400,
  isActive: true,
  sampleType: "Blood",
  reportTime: "6–8 hrs"
},
{
  id: 3,
  name: "Blood Test",
  price: 450,
  discountedPrice: 400,
  isActive: true,
  sampleType: "Blood",
  reportTime: "6–8 hrs"
},
{
  id: 4,
  name: "CBC",
  price: 450,
  discountedPrice: 400,
  isActive: true,
  sampleType: "Blood",
  reportTime: "6–8 hrs"
}


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
  const [showForm, setShowForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;


  /* --------- CATALOG ACTIONS --------- */

  useEffect(() => {
  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const res = await labTestAPI.getLabTest();
      const labTests = Array.isArray(res.data) ? res.data : res.data?.data || [];
      console.log("Lab Tests fetched:", res.data);
      setCatalog(labTests); // backend must return array
    } catch (err) {
      console.error("Failed to load lab tests", err);
    } finally {
      setLoading(false);
    }
  };

  fetchLabTests();
}, []);


  const toggleActive = async (id) => {
  try {
    const res = await labTestAPI.activeStatus(id);

    setCatalog((prev) =>
      prev.map((t) =>
        t.id === id ? res.data : t
      )
    );
  } catch (err) {
    console.error("Status update failed", err);
  }
};


  const deleteTest = async (id) => {
  try {
    await labTestAPI.deleteLabTest(id);

    setCatalog((prev) =>
      prev.filter((t) => t.id !== id)
    );
  } catch (err) {
    console.error("Delete failed", err);
  }
};


  const save = async (data) => {
  try {
    if (data.id) {
      // EDIT
      const res = await labTestAPI.editLabTest(data.id, data);

      setCatalog((prev) =>
        prev.map((t) =>
          t.id === data.id ? res.data : t
        )
      );
    } else {
      // CREATE
      const res = await labTestAPI.createLabTest(data);

      setCatalog((prev) => [...prev, res.data]);
    }

    setShowForm(false);
  } catch (err) {
    console.error("Save failed", err);
  }
};




  /* --------- ORDER ACTIONS --------- */

  const advanceOrder = (id, next) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: next } : o
      )
    );
  };


  const filteredCatalog = catalog.filter((test) => {
    const query = search.toLowerCase();

    return (
      test.name.toLowerCase().includes(query) ||
      test.sampleType?.toLowerCase().includes(query) ||
      test.reportTime?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(
  filteredCatalog.length / ITEMS_PER_PAGE
);

const paginatedCatalog = filteredCatalog.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);


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

        
      <div className="flex flex-wrap gap-3">
          <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            placeholder="Search Tests..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
          </div>
      </div>
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
              onClick={() => {
                setSelectedTest(null);
                setShowForm(true);
              }}
              className="border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center h-48 cursor-pointer"
            >
              <div className="text-center text-blue-600" >
                <Plus size={32} />
                <p className="mt-2 font-medium">Add New Test</p>
              </div>
            </motion.div>

            {/* Existing Tests */}
            {paginatedCatalog.map((test) => (
              <motion.div
                key={test.id}
                whileHover={{ y: -5 }}
                onClick={() => {
                  setSelectedTest(test);
                  setShowDetailsModal(true);
                }}
                className="bg-white rounded-xl shadow-sm p-5 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">
                    {test.name}
                  </h3>
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
                    onClick={() => toggleActive(test.id)}
                    className="text-sm text-blue-600"
                  >
                    Toggle Status
                  </button>

                  <div className="flex gap-3">
                    <Pencil 
                    size={16} 
                    className="text-gray-600 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTest(test);
                      setShowForm(true);
                    }}
                    />
                    <Trash2
                      size={16}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTest(test.id)
                      }}
                      className="text-red-600 cursor-pointer"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
            {totalPages > 1 && (
  <div className="flex justify-center items-center gap-2 mt-6">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Prev
    </button>

    {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded border ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )}

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

      <AnimatePresence>
        {showForm && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setShowForm(false)}
          >
            {/* Stop click inside form */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="h-full"
            >
              <AddEditLabTestForm
                initialData={selectedTest}
                onSave={save}
                onClose={() => setShowForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetailsModal && (
          <LabTestDetailsModal 
            test = {selectedTest}
            onClose = { () => setShowDetailsModal(false)}
            onEdit={(e) => {
              e.stopPropagation();
              setShowDetailsModal(false);
              setShowForm(true);
            }}

          />
        )}
      </AnimatePresence>
    </div>
  );
}
