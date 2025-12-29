import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Eye,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { labStaffAPI } from "../utils/api";

export default function LabStaffs() {
  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);

  const ITEMS_PER_PAGE = 5;

  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    address: "",
    location: null,
  });

  /* ---------------- FETCH LAB STAFF ---------------- */
  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      const res = await labStaffAPI.listLabStaff();
      setStaffs(res.data.data || res.data);
    } catch (err) {
      console.error("Failed to fetch lab staffs:", err);
    }
  };

  /* ---------------- ADD STAFF ---------------- */
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await labStaffAPI.createLabStaff(newStaff);
      setOpenAdd(false);
      setNewStaff({
        name: "",
        role: "",
        phone: "",
        email: "",
        address: "",
        location: null,
      });
      fetchStaffs();
    } catch (err) {
      console.error("Failed to create lab staff:", err);
    }
  };

  /* ---------------- GET CURRENT LOCATION ---------------- */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewStaff({
          ...newStaff,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      (err) => {
        console.error("Location error:", err);
        alert("Failed to get location.");
      }
    );
  };

  /* ---------------- TOGGLE STATUS ---------------- */
  const toggleStatus = async (staff) => {
    try {
      await labStaffAPI.updateLabStaff(staff._id, {
        isActive: !staff.isActive,
      });
      fetchStaffs();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  /* ---------------- FILTER + SEARCH ---------------- */
  const filtered = useMemo(() => {
    return staffs.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.role.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "All" || (s.isActive ? "Active" : "Inactive") === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [staffs, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lab Staffs</h2>

        <button
          onClick={() => setOpenAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            placeholder="Search staff..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {paginatedData.map((staff) => (
          <motion.div
            key={staff._id}
            layout
            className="bg-white p-4 rounded-xl shadow-sm space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{staff.name}</h3>
                <p className="text-sm text-gray-600">{staff.role}</p>
                <p className="text-xs text-gray-500">{staff.phone}</p>
                <p className="text-xs text-gray-500">{staff.email}</p>
              </div>

              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  staff.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {staff.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-gray-600">
                Assigned Orders: {staff.assignedOrders?.length || 0}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedStaff(staff)}
                  className="p-2 rounded hover:bg-gray-100"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => toggleStatus(staff)}
                  className="p-2 rounded hover:bg-gray-100"
                >
                  {staff.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
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

      {/* View Assigned Orders Modal */}
      <AnimatePresence>
        {selectedStaff && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold">
                  {selectedStaff.name} – Assigned Orders
                </h3>
                <button onClick={() => setSelectedStaff(null)}>
                  <X />
                </button>
              </div>

              <ul className="space-y-2">
                {selectedStaff.assignedOrders?.map((o) => (
                  <li key={o._id} className="p-2 border rounded text-sm">
                    {o.name || `Order ID: ${o._id}`}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Staff Drawer */}
      <AnimatePresence>
        {openAdd && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 p-6"
          >
            <form onSubmit={handleAddStaff} className="space-y-3">
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold">Add Lab Staff</h3>
                <button type="button" onClick={() => setOpenAdd(false)}>
                  <X />
                </button>
              </div>

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Name"
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                required
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Role"
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                required
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Phone"
                value={newStaff.phone}
                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                required
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                required
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Address"
                value={newStaff.address}
                onChange={(e) => setNewStaff({ ...newStaff, address: e.target.value })}
              />

              <button
                type="button"
                onClick={getCurrentLocation}
                className="w-full bg-gray-200 py-2 rounded"
              >
                Get Current Location
              </button>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded"
              >
                Save Staff
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
