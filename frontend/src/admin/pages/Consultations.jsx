import React, { useEffect, useState } from "react";
import {
  getAllConsultations,
  updateConsultationStatus,
} from "../utils/api";

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await getAllConsultations();
      setConsultations(res.data?.consultations || []);
    } catch (error) {
      console.error("Error fetching consultations:", error);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateConsultationStatus(id, status);
      fetchConsultations();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading consultations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Consultations</h1>

      <div className="overflow-x-auto bg-white rounded shadow">
       <table className="w-full text-sm">
  <thead className="bg-gray-100 text-left">
    <tr>
      <th className="p-3">Consult ID</th>
      <th className="p-3">Patient</th>
      <th className="p-3">Doctor</th>
      <th className="p-3">Type</th>
      <th className="p-3">Payment</th>
      <th className="p-3">Appointment Date</th>
    </tr>
  </thead>

  <tbody>
    {consultations.map((c) => (
      <tr key={c._id} className="border-t hover:bg-gray-50">
        {/* CONSULT ID */}
        <td className="p-3 text-xs text-gray-600">
          {c._id}
        </td>

        {/* PATIENT */}
        <td className="p-3">
          <p className="font-medium">
            {c.name || "Guest"}
          </p>
          <p className="text-xs text-gray-500">
            {c.phone || "-"}
          </p>
        </td>

        {/* DOCTOR */}
        <td className="p-3">
          <p className="font-medium">
            {c.specialistDoctor?.doctorId?.name || "Not Assigned"}
          </p>
          <p className="text-xs text-gray-500">
            {c.specialistDoctor?.doctorId?.specialization || "-"}
          </p>
        </td>

        {/* TYPE */}
        <td className="p-3 capitalize">
          {c.consultingType || "-"}
        </td>

        {/* PAYMENT */}
        <td className="p-3">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              c.paymentDetails?.status === "paid"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {c.paymentDetails?.status || "pending"}
          </span>
        </td>

        {/* APPOINTMENT DATE */}
          <td className="p-3 text-sm text-gray-600">
    {c.paymentDetails?.paidAt
      ? new Date(c.paymentDetails.paidAt).toLocaleString("en-IN")
      : "-"}
</td>

      </tr>
    ))}
  </tbody>
</table>


        {consultations.length === 0 && (
          <p className="text-center p-6 text-gray-500">
            No consultations found
          </p>
        )}
      </div>
    </div>
  );
}
