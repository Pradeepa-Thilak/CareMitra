import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, User } from "lucide-react";

/* ---------------- MOCK DATA ---------------- */
const mockPatients = [
  {
    id: "PT001",
    name: "Arun Kumar",
    age: 34,
    gender: "Male",
    phone: "9876543210",
    region: "Coimbatore",
    status: "Active",
    email: "arun@gmail.com",

    consultations: [
      {
        id: "CONS01",
        doctorName: "Dr. Meena",
        speciality: "Cardiology",
        mode: "Online",
        date: "12 Dec 2025",
        status: "Completed",
      },
    ],

    labTests: [
      {
        id: "LAB01",
        testName: "Blood Sugar",
        labName: "Apollo Diagnostics",
        orderedDate: "13 Dec 2025",
        status: "Completed",
        reportAvailable: true,
      },
    ],

    medicines: [
      {
        id: "MED01",
        medicineName: "Metformin 500mg",
        quantity: 30,
        price: 180,
        orderedDate: "14 Dec 2025",
        status: "Delivered",
      },
      {
        id: "MED02",
        medicineName: "Amlodipine",
        quantity: 10,
        price: 120,
        orderedDate: "15 Dec 2025",
        status: "Ordered",
      },
    ],
  },

  ...Array.from({ length: 14 }).map((_, i) => ({
    id: `PT${102 + i}`,
    name: `Patient ${i + 1}`,
    age: 25 + (i % 15),
    gender: i % 2 ? "Male" : "Female",
    phone: `98765000${i}`,
    region: "Chennai",
    status: i % 3 ? "Active" : "Inactive",
    email: `patient${i + 1}@gmail.com`,
    consultations: [],
    labTests: [],
    medicines: [],
  })),
];

/* ---------------- COMPONENT ---------------- */
export default function Patients() {
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = mockPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedPatients = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "auto";
  }, [selected]);

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

      {/* Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedPatients.map((p) => (
          <motion.div
            key={p.id}
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
                  <p className="text-xs text-gray-500">
                    {p.age} yrs • {p.gender}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  p.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {p.status}
              </span>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              <p>📞 {p.phone}</p>
              <p>📍 {p.region}</p>
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

      {/* ---------------- MODAL ---------------- */}
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
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-lg font-semibold mb-4">Patient Details</h2>

              {/* BASIC INFO */}
              <div className="text-sm space-y-1 mb-4">
                <p><b>Name:</b> {selected.name}</p>
                <p><b>Phone:</b> {selected.phone}</p>
                <p><b>Email:</b> {selected.email}</p>
                <p><b>Region:</b> {selected.region}</p>
              </div>

              {/* CONSULTATIONS */}
              <Section title="Consultations" items={selected.consultations} empty="No consultations">
                {(c) => (
                  <>
                    <p className="font-medium">{c.doctorName}</p>
                    <p className="text-xs">{c.speciality} • {c.mode}</p>
                    <p className="text-xs">{c.date} • {c.status}</p>
                  </>
                )}
              </Section>

              {/* LAB TESTS */}
              <Section title="Lab Tests" items={selected.labTests} empty="No lab tests">
                {(t) => (
                  <>
                    <p className="font-medium">{t.testName}</p>
                    <p className="text-xs">{t.labName}</p>
                    <p className="text-xs">{t.orderedDate} • {t.status}</p>
                  </>
                )}
              </Section>

              {/* MEDICINES */}
              <Section title="Medicines Ordered" items={selected.medicines} empty="No medicines ordered">
                {(m) => (
                  <>
                    <p className="font-medium">{m.medicineName}</p>
                    <p className="text-xs">
                      Qty: {m.quantity} • ₹{m.price}
                    </p>
                    <p className="text-xs">
                      {m.orderedDate} • {m.status}
                    </p>
                  </>
                )}
              </Section>

              <button
                onClick={() => setSelected(null)}
                className="mt-6 w-full py-2 bg-sky-600 text-white rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- REUSABLE SECTION ---------------- */
function Section({ title, items, empty, children }) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-500">{empty}</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="border rounded p-2 mb-2 text-sm">
            {children(item)}
          </div>
        ))
      )}
    </div>
  );
}
