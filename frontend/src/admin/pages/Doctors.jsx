import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  UserCheck,
  UserX,
  Plus,
  Stethoscope,
  MapPin,
  Search,
  X,
} from "lucide-react";

/* ---------------- MOCK DATA ---------------- */
const INITIAL_DOCTORS = [
  {
    id: 1,
    name: "Dr. Arjun Kumar",
    speciality: "Cardiologist",
    experience: "8 years",
    regions: ["Chennai", "Coimbatore"],
    consultation: ["Online", "Offline"],
    status: "pending",
  },
  {
    id: 2,
    name: "Dr. Meena Ravi",
    speciality: "Dermatologist",
    experience: "5 years",
    regions: ["Bangalore"],
    consultation: ["Online"],
    status: "active",
  },
  {
    id: 3,
    name: "Dr. Suresh N",
    speciality: "Orthopedic",
    experience: "12 years",
    regions: ["Madurai", "Trichy"],
    consultation: ["Offline"],
    status: "blocked",
  },
];

/* ---------------- STATUS BADGE ---------------- */
const StatusBadge = ({ status }) => {
  const map = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    blocked: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs ${map[status]}`}>
      {status}
    </span>
  );
};

/* ---------------- DOCTOR CARD ---------------- */
const DoctorCard = ({ doctor, onView, onApprove, onBlock }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition"
  >
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
        <p className="text-sm text-gray-500">{doctor.speciality}</p>
      </div>
      <StatusBadge status={doctor.status} />
    </div>

    <div className="mt-3 space-y-1 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <MapPin size={14} /> {doctor.regions.join(", ")}
      </div>
      <div className="flex items-center gap-2">
        <Stethoscope size={14} /> {doctor.consultation.join(", ")}
      </div>
    </div>

    <div className="mt-4 flex justify-between items-center">
      <button
        onClick={() => onView(doctor)}
        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
      >
        <Eye size={16} /> View
      </button>

      <div className="flex gap-2">
        {doctor.status !== "active" && (
          <button
            onClick={() => onApprove(doctor.id)}
            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
          >
            <UserCheck size={16} />
          </button>
        )}
        {doctor.status !== "blocked" && (
          <button
            onClick={() => onBlock(doctor.id)}
            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
          >
            <UserX size={16} />
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

/* ---------------- MAIN PAGE ---------------- */
export default function Doctors() {
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);

  const [newDoctor, setNewDoctor] = useState({
    name: "",
    speciality: "",
    experience: "",
    regions: "",
    consultation: "",
    status: "pending",
  });

  const updateStatus = (id, status) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.speciality.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || d.status === filter;
      return matchSearch && matchFilter;
    });
  }, [doctors, search, filter]);

  const handleAddDoctor = (e) => {
    e.preventDefault();
    setDoctors((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newDoctor,
        regions: newDoctor.regions.split(",").map((r) => r.trim()),
        consultation: newDoctor.consultation.split(",").map((c) => c.trim()),
      },
    ]);
    setNewDoctor({
      name: "",
      speciality: "",
      experience: "",
      regions: "",
      consultation: "",
      status: "pending",
    });
    setOpenAdd(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Doctors Management
        </h1>

        <div className="flex gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctors..."
              className="pl-9 pr-3 py-2 rounded-lg border text-sm"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="blocked">Blocked</option>
          </select>

          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
          >
            <Plus size={16} /> Add Doctor
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map((doc) => (
          <DoctorCard
            key={doc.id}
            doctor={doc}
            onView={setSelected}
            onApprove={(id) => updateStatus(id, "active")}
            onBlock={(id) => updateStatus(id, "blocked")}
          />
        ))}
      </div>

      {/* DETAILS DRAWER */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end"
            initial={{  opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{  opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md h-full bg-white shadow-xl p-6"
            >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{selected.name}</h2>
              <button onClick={() => setSelected(null)}>
                <X />
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <div>Speciality: {selected.speciality}</div>
              <div>Experience: {selected.experience}</div>
              <div>Regions: {selected.regions.join(", ")}</div>
              <div>Consultation: {selected.consultation.join(", ")}</div>
              <div>Status: {selected.status}</div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD DOCTOR DRAWER */}
      <AnimatePresence>
  {openAdd && (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => setOpenAdd(false)}
      />

      {/* SIDEBAR */}
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative h-full w-full max-w-md bg-white shadow-xl p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Add Doctor</h2>

        <form onSubmit={handleAddDoctor} className="space-y-3">
          <input
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Doctor Name"
            value={newDoctor.name}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, name: e.target.value })
            }
            required
          />

          <input
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Speciality"
            value={newDoctor.speciality}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, speciality: e.target.value })
            }
            required
          />

          <input
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Experience (eg. 5 years)"
            value={newDoctor.experience}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, experience: e.target.value })
            }
          />

          <input
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Regions (comma separated)"
            value={newDoctor.regions}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, regions: e.target.value })
            }
          />

          <input
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Consultation (Online, Offline)"
            value={newDoctor.consultation}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, consultation: e.target.value })
            }
          />

          <select
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={newDoctor.status}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, status: e.target.value })
            }
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>

          <button className="w-full py-2 rounded-lg bg-blue-600 text-white">
            Save Doctor
          </button>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
}
