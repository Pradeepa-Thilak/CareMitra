import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function AddEditLabTestForm({
  initialData = null,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountedPrice: "",
    isActive: true,
    sampleType: "",
    reportTime: "",
  });

  useEffect(() => {
    if (initialData) {
    setForm({
      ...initialData,
      isActive: initialData.isActive ?? true,
    });
  } else {
    setForm({
      name: "",
      description: "",
      price: "",
      discountedPrice: "",
      isActive: true,   
      sampleType: "",
      reportTime: "",
    });
  }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...form,
      id: initialData?.id || Date.now(),
      price: Number(form.price),
      discountedPrice: Number(form.discountedPrice),
    });

    onClose();
  };

  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3 }}
      className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-xl z-50 p-6 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {initialData ? "Edit Lab Test" : "Add Lab Test"}
        </h3>
        <button onClick={onClose}>
          <X />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Lab Test Name"
          className="w-full border rounded px-3 py-2"
          required
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border rounded px-3 py-2"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            className="border rounded px-3 py-2"
            required
          />

          <input
            name="discountedPrice"
            type="number"
            value={form.discountedPrice}
            onChange={handleChange}
            placeholder="Discounted Price"
            className="border rounded px-3 py-2"
          />
        </div>

        <input
          name="sampleType"
          value={form.sampleType}
          onChange={handleChange}
          placeholder="Sample Type (Blood / Urine)"
          className="w-full border rounded px-3 py-2"
        />

        <input
          name="reportTime"
          value={form.reportTime}
          onChange={handleChange}
          placeholder="Report Time (e.g. 6–8 hrs)"
          className="w-full border rounded px-3 py-2"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />
          Active
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Save Lab Test
        </button>
      </form>
    </motion.aside>
  );
}
