// src/pages/LabStaff.jsx
import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const LabStaff = () => {
  // ---------- MOCK DATA (stored inside the page) ----------
  const [tests, setTests] = useState([
    {
      id: "t1",
      testId: "LAB-2025-001",
      testName: "Complete Blood Count (CBC)",
      scheduledAt: "2025-12-11T10:30:00.000Z",
      status: "pending",
      patient: {
        id: "P-1001",
        name: "Ravi Kumar",
        phone: "+91 98765 43210",
        age: 34,
        gender: "Male",
      },
      notes: "Fasting required",
    },
    {
      id: "t2",
      testId: "LAB-2025-002",
      testName: "Liver Function Test",
      scheduledAt: "2025-12-11T14:00:00.000Z",
      status: "pending",
      patient: {
        id: "P-1002",
        name: "Meena R",
        phone: "+91 91234 56780",
        age: 28,
        gender: "Female",
      },
      notes: "Collect 5ml blood",
    },
    {
      id: "t3",
      testId: "LAB-2025-003",
      testName: "HbA1c",
      scheduledAt: "2025-12-10T12:00:00.000Z",
      status: "done",
      patient: {
        id: "P-1003",
        name: "S. Anand",
        phone: "+91 99887 76655",
        age: 46,
        gender: "Male",
      },
      notes: "Diabetic patient — priority",
    },
  ]);

  // ---------- MARK A TEST AS COMPLETED ----------
  const handleMarkDone = (id) => {
    setTests((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "done" } : t
      )
    );
    toast.success("Test marked as completed!");
  };

  // ---------- UI ----------

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Lab Staff — Assigned Lab Tests</h1>

      {tests.length === 0 && (
        <div className="text-gray-500 text-center">No assigned tests.</div>
      )}

      {tests.map((test) => (
        <div
          key={test.id}
          className="p-4 mb-4 border rounded-lg bg-white shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold">
                {test.testName}{" "}
                <span className="text-gray-500 text-sm">
                  ({test.testId})
                </span>
              </h2>

              <p className="text-sm text-gray-700 mt-1">
                Scheduled:{" "}
                {format(new Date(test.scheduledAt), "dd MMM yyyy, hh:mm a")}
              </p>

              <p className="text-sm mt-1">
                Status:{" "}
                <span
                  className={
                    test.status === "done"
                      ? "text-green-600 font-semibold"
                      : "text-orange-600 font-semibold"
                  }
                >
                  {test.status}
                </span>
              </p>

              {test.notes && (
                <p className="mt-2 text-gray-700 text-sm">
                  Notes: {test.notes}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="font-medium">{test.patient.name}</p>
              <p className="text-sm text-gray-600">
                Patient ID: {test.patient.id}
              </p>
              <p className="text-sm text-gray-600">{test.patient.phone}</p>
            </div>
          </div>

          {/* Mark Done Button */}
          <div className="mt-4">
            <button
              disabled={test.status === "done"}
              onClick={() => handleMarkDone(test.id)}
              className={`px-4 py-2 rounded text-white text-sm ${
                test.status === "done"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {test.status === "done" ? "Completed" : "Mark as Complete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LabStaff;
