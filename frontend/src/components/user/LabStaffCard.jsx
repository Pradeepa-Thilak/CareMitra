// src/components/user/LabStaffCard.jsx
import React from "react";
import { format } from "date-fns";

const LabStaffCard = ({ item, onMarkDone }) => {
  const { testId, scheduledAt, testName, status, patient, notes } = item;

  const timeStr = scheduledAt ? format(new Date(scheduledAt), "dd MMM yyyy, hh:mm a") : "—";

  return (
    <div className="p-4 border rounded-md shadow-sm mb-3 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{testName} <span className="text-sm text-gray-500">({testId})</span></h3>
          <p className="text-sm text-gray-600">Scheduled: {timeStr}</p>
          <p className="text-sm text-gray-600">Status: <span className="font-semibold">{status}</span></p>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium">{patient?.name}</p>
          <p className="text-sm text-gray-600">ID: {patient?.id}</p>
          <p className="text-sm text-gray-600">{patient?.phone}</p>
        </div>
      </div>

      {notes && <p className="mt-2 text-sm text-gray-700">Notes: {notes}</p>}

      <div className="mt-3 flex gap-2">
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
          onClick={() => navigator.clipboard?.writeText(JSON.stringify(item))}
          title="Copy details"
        >
          Copy
        </button>

        <button
          className="px-3 py-1 rounded bg-green-600 text-white text-sm"
          onClick={() => onMarkDone(item)}
          disabled={status === "done"}
          title={status === "done" ? "Already marked done" : "Mark test complete"}
        >
          {status === "done" ? "Completed" : "Mark Done"}
        </button>
      </div>
    </div>
  );
};

export default LabStaffCard;
