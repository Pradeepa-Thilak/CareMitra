import React, { useMemo, useState } from "react";
import { Search, Eye, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { motion } from "framer-motion";

const mockMedicines = [
  {
    id: "MED001",
    name: "Paracetamol 650mg",
    category: "Tablet",
    price: 30,
    stock: 120,
    status: "Active",
  },
  {
    id: "MED002",
    name: "Amoxicillin 500mg",
    category: "Capsule",
    price: 85,
    stock: 40,
    status: "Inactive",
  },
  {
    id: "MED003",
    name: "Cough Syrup",
    category: "Syrup",
    price: 120,
    stock: 15,
    status: "Active",
  },
  {
    id: "MED004",
    name: "Vitamin D3",
    category: "Tablet",
    price: 60,
    stock: 200,
    status: "Active",
  },
];

const ITEMS_PER_PAGE = 3;

export default function Medicines() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [medicines, setMedicines] = useState(mockMedicines);

  // 🔎 Search + Filter
  const filtered = useMemo(() => {
    return medicines.filter((m) => {
      const matchesSearch = m.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || m.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, medicines]);

  // 📄 Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // 🔁 Toggle Active / Inactive
  const toggleStatus = (id) => {
    setMedicines((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === "Active" ? "Inactive" : "Active" }
          : m
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Medicines</h1>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicine..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-left">Medicine</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price (₹)</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((m) => (
              <motion.tr
                key={m.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3 font-medium">{m.name}</td>
                <td className="p-3 text-center">{m.category}</td>
                <td className="p-3 text-center">{m.price}</td>
                <td className="p-3 text-center">{m.stock}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      m.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="p-3 flex justify-center gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Eye size={16} />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => toggleStatus(m.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {m.status === "Active" ? (
                      <ToggleRight size={18} />
                    ) : (
                      <ToggleLeft size={18} />
                    )}
                  </button>
                </td>
              </motion.tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="p-6 text-center text-gray-500"
                >
                  No medicines found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
