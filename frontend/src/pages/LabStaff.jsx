// src/pages/LabStaff.jsx
import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { labTestAPI} from "../utils/api";
import { toast } from "react-hot-toast";

/**
 * LabStaff.jsx
 * - Self-contained mock data (toggle MOCK = true)
 * - Pagination (page size selector, page numbers, prev/next)
 * - View single order details modal (uses GET /admin/staff/order/:id when MOCK=false)
 * - Mark complete (PATCH /admin/staff/order/:id when MOCK=false)
 *
 * Usage:
 *  - Toggle MOCK to false to call real backend. It expects:
 *      GET  /admin/staff/order/:id        -> get single order by id
 *      PATCH /admin/staff/order/:id       -> payload { status: "done" } or similar
 *    If your axios instance is in src/utils/api.js, replace axios.* calls with that instance.
 */

// ------------------ CONFIG ------------------
const MOCK = true; // set to false to call real backend
// --------------------------------------------

const initialMockData = [
  {
    id: "t1",
    testId: "LAB-2025-001",
    testName: "Complete Blood Count (CBC)",
    scheduledAt: "2025-12-11T10:30:00.000Z",
    status: "pending",
    assignedTo: "lab-1",
    patient: { id: "P-1001", name: "Ravi Kumar", phone: "+91 98765 43210", age: 34, gender: "Male" },
    notes: "Fasting required",
  },
  {
    id: "t2",
    testId: "LAB-2025-002",
    testName: "Liver Function Test",
    scheduledAt: "2025-12-11T14:00:00.000Z",
    status: "pending",
    assignedTo: "lab-1",
    patient: { id: "P-1002", name: "Meena R", phone: "+91 91234 56780", age: 28, gender: "Female" },
    notes: "Collect 5ml blood",
  },
  {
    id: "t3",
    testId: "LAB-2025-003",
    testName: "HbA1c",
    scheduledAt: "2025-12-10T12:00:00.000Z",
    status: "done",
    assignedTo: "lab-1",
    patient: { id: "P-1003", name: "S. Anand", phone: "+91 99887 76655", age: 46, gender: "Male" },
    notes: "Diabetic patient — priority",
  },
  // add more to demonstrate pagination
  {
    id: "t4",
    testId: "LAB-2025-004",
    testName: "Thyroid Panel",
    scheduledAt: "2025-12-11T09:00:00.000Z",
    status: "pending",
    assignedTo: "lab-1",
    patient: { id: "P-1004", name: "Anitha S", phone: "+91 90123 45678", age: 31, gender: "Female" },
    notes: "",
  },
  {
    id: "t5",
    testId: "LAB-2025-005",
    testName: "Lipid Profile",
    scheduledAt: "2025-12-12T11:00:00.000Z",
    status: "pending",
    assignedTo: "lab-1",
    patient: { id: "P-1005", name: "Kumar V", phone: "+91 90909 90909", age: 50, gender: "Male" },
    notes: "Fasting 12 hours",
  },
  {
    id: "t6",
    testId: "LAB-2025-006",
    testName: "Urine Routine",
    scheduledAt: "2025-12-12T08:30:00.000Z",
    status: "pending",
    assignedTo: "lab-1",
    patient: { id: "P-1006", name: "Ramesh", phone: "+91 90000 11111", age: 39, gender: "Male" },
    notes: "",
  },
];

const PAGE_SIZES = [3, 5, 10];

const LabStaff = () => {
  // ---------------- state ----------------
  const [data, setData] = useState(initialMockData);
  const [filter, setFilter] = useState("all"); // all / pending / done
  const [pageSize, setPageSize] = useState(3);
  const [page, setPage] = useState(1);
  const [detailsId, setDetailsId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);

  // ------------- derived -------------
  const filtered = useMemo(() => {
    if (filter === "all") return data;
    return data.filter((d) => d.status === filter);
  }, [data, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  // ensure page not out of range
  if (page > totalPages) setPage(totalPages);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // ------------- helpers -------------
  const fetchOrderDetails = async (id) => {
    setDetailsLoading(true);
    setDetailsItem(null);
    setDetailsId(id);
    try {
      if (MOCK) {
        // local mock read
        const it = data.find((d) => d.id === id || d.testId === id);
        await new Promise((r) => setTimeout(r, 150)); // small delay
        if (!it) throw new Error("Order not found (mock)");
        setDetailsItem(it);
      } else {
        // real API call
        // NOTE: replace axios with your api instance if needed (e.g., import api from '../utils/api')
        const res = await labTestAPI.getByKey(id);
        setDetailsItem(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch order details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setDetailsId(null);
    setDetailsItem(null);
    setDetailsLoading(false);
  };

  const handleMarkDone = async (id) => {
    const prev = data;
    setData((p) => p.map((t) => (t.id === id ? { ...t, status: "done" } : t)));
    toast.loading("Marking complete...");
    try {
      if (MOCK) {
        await new Promise((r) => setTimeout(r, 250));
        toast.dismiss();
        toast.success("Marked complete (mock)");
      } else {
        // real API: PATCH /admin/staff/order/:id  with body { status: 'done' }
        await api.markComplete(id, { status: "done" });
        toast.dismiss();
        toast.success("Marked complete");
      }
    } catch (err) {
      console.error(err);
      setData(prev); // revert
      toast.dismiss();
      toast.error("Failed to mark complete");
    }
  };

  const handleViewDetails = (id) => {
    fetchOrderDetails(id);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleAddMock = () => {
    // quick way to add a mock test to see pagination effect
    const id = `t${Date.now().toString().slice(-5)}`;
    const created = {
      id,
      testId: `LAB-${Date.now().toString().slice(-6)}`,
      testName: "Random Test",
      scheduledAt: new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 24).toISOString(),
      status: "pending",
      patient: { id: `P-${id}`, name: `New Patient ${id}`, phone: "+91 90000 00000" },
      notes: "",
    };
    setData((p) => [created, ...p]);
    // go to first page so new item is visible
    setPage(1);
    toast.success("Mock test added");
  };

  // ---------------- UI ----------------
  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lab Staff — Assigned Tests</h1>
          <p className="text-sm text-gray-600 mt-1">
            Mode: <span className="font-medium">{MOCK ? "Mock (local)" : "Live API"}</span>
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="px-2 py-1 border rounded"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="done">Completed</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-2 py-1 border rounded"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>

          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleAddMock}>
            + Add mock
          </button>
        </div>
      </header>

      {/* list */}
      <div>
        {pageItems.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No tests to show.</div>
        ) : (
          pageItems.map((test) => (
            <div key={test.id} className="p-4 mb-4 border rounded-lg bg-white shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">
                    {test.testName}{" "}
                    <span className="text-gray-500 text-sm">({test.testId})</span>
                  </h2>

                  <p className="text-sm text-gray-700 mt-1">
                    Scheduled: {format(new Date(test.scheduledAt), "dd MMM yyyy, hh:mm a")}
                  </p>

                  <p className="text-sm mt-1">
                    Status:{" "}
                    <span className={test.status === "done" ? "text-green-600 font-semibold" : "text-orange-600 font-semibold"}>
                      {test.status}
                    </span>
                  </p>

                  {test.notes && <p className="mt-2 text-gray-700 text-sm">Notes: {test.notes}</p>}
                </div>

                <div className="text-right">
                  <p className="font-medium">{test.patient.name}</p>
                  <p className="text-sm text-gray-600">Patient ID: {test.patient.id}</p>
                  <p className="text-sm text-gray-600">{test.patient.phone}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleViewDetails(test.id)}
                  className="px-3 py-1 rounded border text-sm"
                >
                  View
                </button>

                <button
                  disabled={test.status === "done"}
                  onClick={() => handleMarkDone(test.id)}
                  className={`px-3 py-1 rounded text-sm text-white ${
                    test.status === "done" ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {test.status === "done" ? "Completed" : "Mark Complete"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * pageSize + (pageItems.length ? 1 : 0)} - {(page - 1) * pageSize + pageItems.length} of{" "}
          {filtered.length}
        </div>

        <div className="flex gap-2 items-center">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-2 py-1 border rounded">
            Prev
          </button>

          {/* page numbers (simple) */}
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-2 py-1 rounded ${p === page ? "bg-blue-600 text-white" : "border"}`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-2 py-1 border rounded">
            Next
          </button>
        </div>
      </div>

      {/* details modal */}
      {detailsId && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div className="absolute inset-0 bg-black/50" onClick={closeDetails} />
          <div className="relative bg-white rounded-lg p-6 w-[90%] max-w-xl z-50 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <button onClick={closeDetails} className="px-2 py-1 border rounded">Close</button>
            </div>

            {detailsLoading ? (
              <div className="py-6 text-center">Loading…</div>
            ) : detailsItem ? (
              <div className="mt-4 space-y-2 text-sm">
                <div><strong>Test:</strong> {detailsItem.testName} <span className="text-gray-500">({detailsItem.testId})</span></div>
                <div><strong>Scheduled:</strong> {format(new Date(detailsItem.scheduledAt), "dd MMM yyyy, hh:mm a")}</div>
                <div><strong>Status:</strong> {detailsItem.status}</div>
                <div><strong>Patient:</strong> {detailsItem.patient?.name} ({detailsItem.patient?.id})</div>
                <div><strong>Phone:</strong> {detailsItem.patient?.phone}</div>
                {detailsItem.notes && <div><strong>Notes:</strong> {detailsItem.notes}</div>}
                {detailsItem.completedAt && <div><strong>Completed At:</strong> {format(new Date(detailsItem.completedAt), "dd MMM yyyy, hh:mm a")}</div>}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      handleMarkDone(detailsItem.id);
                      // refresh details view from local state
                      if (MOCK) setDetailsItem((d) => ({ ...d, status: "done", completedAt: new Date().toISOString() }));
                    }}
                    disabled={detailsItem.status === "done"}
                    className={`px-3 py-1 rounded text-white ${detailsItem.status === "done" ? "bg-gray-400" : "bg-green-600"}`}
                  >
                    {detailsItem.status === "done" ? "Completed" : "Mark Complete"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-red-600">No details found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabStaff;
