import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, User, X } from "lucide-react";
import api from "../utils/api"; // axios instance

export default function Patients() {
  const PAGE_SIZE = 6;

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  /* ---------------- FETCH PATIENTS ---------------- */
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get("api/admin/patients");
      console.log(res.data);
      
      setPatients(res.data.patients || res.data);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER + PAGINATION ---------------- */
  const filtered = useMemo(() => {
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.includes(search)
    );
  }, [patients, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginatedPatients = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "auto";
  }, [selected]);

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-800">Patients</h1>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone"
          className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-sm text-gray-500">Loading patients...</p>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <p className="text-sm text-gray-500">No patients found</p>
      )}

      {/* Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedPatients.map((p) => (
          <motion.div
            key={p._id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 shadow-sm border"
          >
            <div className="flex justify-between">
              <div className="flex gap-3">
                <div className="p-2 bg-sky-100 rounded-full">
                  <User className="text-sky-600" />
                </div>
                <div>
                  <h3 className="font-medium">{p.name}</h3>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                Active
              </span>
            </div>

            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <p>📞 {p.phone}</p>
              {/* <p>📍 {p.address || "Not provided"}</p> */}
            </div>

            <button
              onClick={() => setSelected(p)}
              className="mt-3 flex items-center gap-2 text-sm text-sky-600"
            >
              <Eye size={16} /> View Details
            </button>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? "bg-sky-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* ---------------- DETAILS MODAL ---------------- */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
            onClick={() => setSelected(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Patient Details</h2>
                <button onClick={() => setSelected(null)}>
                  <X />
                </button>
              </div>

              <div className="text-sm space-y-2">
                <p><b>Name:</b> {selected.name}</p>
                <p><b>Email:</b> {selected.email}</p>
                <p><b>Phone:</b> {selected.phone}</p>
                {/* <p><b>Address:</b> {selected.address || "Not provided"}</p> */}
                <p><b>Created:</b> {new Date(selected.createdAt).toLocaleDateString()}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
