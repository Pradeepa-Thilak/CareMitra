import { motion } from "framer-motion";
import { X, Pencil } from "lucide-react";

export default function LabTestDetailsModal({
  test,
  onClose,
  onEdit,
}) {
  if (!test) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{test.name}</h3>
            <span
              className={`text-xs px-3 py-1 rounded-full ${
                test.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {test.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-sm">
          <Detail label="Description" value={test.description} />
          <Detail label="Sample Type" value={test.sampleType} />
          <Detail label="Report Time" value={test.reportTime} />
          <Detail label="Price" value={`₹ ${test.price}`} />
          <Detail
            label="Discounted Price"
            value={`₹ ${test.discountedPrice}`}
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <Pencil size={16} /> Edit
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className="font-medium">{value || "—"}</p>
  </div>
);
