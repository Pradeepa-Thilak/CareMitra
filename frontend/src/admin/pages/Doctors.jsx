import React, { useEffect, useMemo, useState } from "react";
import {
  Eye,
  UserCheck,
  X,
  Search,
  XCircle,
  Mail,
  Phone,
  Award,
  Plus,
} from "lucide-react";

/* ---------------- STATUS BADGE ---------------- */
const StatusBadge = ({ status = "pending" }) => {
  const statusMap = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    blocked: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    verified: "bg-green-100 text-green-700",
  };

  const safeStatus =
    typeof status === "string" ? status.toLowerCase() : "pending";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        statusMap[safeStatus] || "bg-gray-100 text-gray-700"
      }`}
    >
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  );
};

/* ---------------- STATS CARD ---------------- */
const StatsCard = ({ label, count, color }) => (
  <div className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${color}`}>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-2xl font-bold mt-1">{count}</p>
  </div>
);

/* ---------------- DOCTOR CARD ---------------- */
const DoctorCard = ({ doctor, onView }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md border">
    <div className="flex justify-between">
      <div>
        <h3 className="font-semibold text-lg">{doctor.name || "Unknown"}</h3>
        <p className="text-sm text-gray-500">
          {doctor.specialization || "N/A"}
        </p>
      </div>
      <StatusBadge status={doctor.verificationStatus || doctor.status} />
    </div>

    <div className="mt-4">
      <button
        onClick={() => onView(doctor)}
        className="w-full text-blue-600 hover:bg-blue-50 py-2 rounded-lg flex items-center justify-center gap-2"
      >
        <Eye size={16} /> View Details
      </button>
    </div>
  </div>
);

/* ================= MAIN ================= */
export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  /* -------- ADD DOCTOR -------- */
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    gender: "",
    specialization: "",
    phone: "",
    email: "",
    medicalLicenseNumber: "",
    yearOfRegistration: "",
  });

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchDoctors();
  }, []);

  /* ---------------- FETCH ---------------- */
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDoctors(data.doctors || data.data || []);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY / REJECT (FIXED) ---------------- */
  const verifyDoctorApplication = async ({
    doctorId,
    status,
    notes = "",
    rejectionReason = "",
  }) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/doctors/${doctorId}/verify`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            notes,
            rejectionReason,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action failed");

      alert(data.message);
      fetchDoctors();
      setSelected(null);
    } catch (err) {
      alert(err.message);
    }
  };

  /* ---------------- ADD DOCTOR ---------------- */
  const handleAddDoctor = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/register/doctor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error("Failed to add doctor");

      setShowAdd(false);
      setForm({
        name: "",
        gender: "",
        specialization: "",
        phone: "",
        email: "",
        medicalLicenseNumber: "",
        yearOfRegistration: "",
      });

      fetchDoctors();
    } catch (err) {
      alert(err.message);
    }
  };

  /* ---------------- COUNTS ---------------- */
  const counts = useMemo(
    () => ({ total: doctors.length }),
    [doctors]
  );

  /* ---------------- FILTER ---------------- */
  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const matchSearch =
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
        d.email?.toLowerCase().includes(search.toLowerCase());

      const status = d.verificationStatus || d.status;
      const matchFilter = filter === "all" || status === filter;

      return matchSearch && matchFilter;
    });
  }, [doctors, search, filter]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Doctors Management</h1>
          <p className="text-gray-600">Manage and verify doctors</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} /> Add Doctor
        </button>
      </div>

      <StatsCard
        label="Total Doctors"
        count={counts.total}
        color="border-blue-500"
      />

      {/* SEARCH */}
      <div className="flex gap-4">
        <input
          className="border px-4 py-2 rounded w-full"
          placeholder="Search doctor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* GRID */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doc) => (
            <DoctorCard key={doc._id} doctor={doc} onView={setSelected} />
          ))}
        </div>
      )}

      {/* ---------------- DETAILS DRAWER ---------------- */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
          <div className="bg-white w-full max-w-lg p-6 overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">{selected.name}</h2>
              <button onClick={() => setSelected(null)}>
                <X />
              </button>
            </div>

            <StatusBadge status={selected.verificationStatus} />

            <div className="mt-4 space-y-2 text-sm">
              <p><Mail size={14} className="inline mr-2" />{selected.email}</p>
              <p><Phone size={14} className="inline mr-2" />{selected.phone}</p>
              <p><Award size={14} className="inline mr-2" />{selected.specialization}</p>
            </div>

            {selected.verificationStatus === "pending" && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() =>
                    verifyDoctorApplication({
                      doctorId: selected._id,
                      status: "verified",
                      notes: "Verified by admin",
                    })
                  }
                  className="flex-1 bg-green-600 text-white py-2 rounded"
                >
                  Verify
                </button>
                <button
                  onClick={() => {
                    const reason = prompt("Enter rejection reason");
                    if (!reason) return;
                    verifyDoctorApplication({
                      doctorId: selected._id,
                      status: "rejected",
                      rejectionReason: reason,
                    });
                  }}
                  className="flex-1 bg-red-600 text-white py-2 rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- ADD DOCTOR MODAL ---------------- */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Doctor</h2>
              <button onClick={() => setShowAdd(false)}>
                <X />
              </button>
            </div>

            {Object.keys(form).map((key) => (
              <input
                key={key}
                placeholder={key}
                className="w-full border px-3 py-2 rounded mb-3"
                value={form[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
              />
            ))}

            <button
              onClick={handleAddDoctor}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Save Doctor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
