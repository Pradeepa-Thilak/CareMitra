import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

/**
 * Props:
 * - selectedTest: object (test to order)
 * - initialValues: optional { name, phone, address, pincode, date, time }
 * - onCancel: function()
 * - onSubmit: async function(formValues, prescriptionFile) -> should return a promise
 * - loading: boolean
 */
export default function LabTestOrderForm({
  selectedTest,
  initialValues = {},
  onCancel,
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState({
    name: initialValues.name || '',
    phone: initialValues.phone || '',
    address: initialValues.address || '',
    pincode: initialValues.pincode || '',
    date: initialValues.date || '',
    time: initialValues.time || '',
  });

  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(prev => ({ ...prev, ...initialValues }));
  }, [initialValues, selectedTest]);

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!/^[0-9]{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit phone number.';
    if (!form.pincode || !/^[0-9]{6}$/.test(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode.';

    if (!form.date) errs.date = 'Please select a date.';
    else {
      const selected = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) errs.date = 'Date cannot be in the past.';
    }

    if (!form.time) errs.time = 'Please select a time.';

    return errs;
  };

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setPrescriptionFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validateForm();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    if (onSubmit) {
      await onSubmit(form, prescriptionFile);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-slate-600">Name</label>
        <input
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="mt-1 w-full rounded-lg border p-2"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm text-slate-600">Phone</label>
        <input
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="mt-1 w-full rounded-lg border p-2"
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm text-slate-600">Address</label>
        <input
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
          className="mt-1 w-full rounded-lg border p-2"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-600">Pincode</label>
        <input
          value={form.pincode}
          onChange={e => setForm({ ...form, pincode: e.target.value })}
          className="mt-1 w-full rounded-lg border p-2"
        />
        {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
      </div>

      <div>
        <label className="block text-sm text-slate-600">Preferred Date</label>
        <input
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
          className="mt-1 w-full rounded-lg border p-2"
        />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
      </div>

      <div>
        <label className="block text-sm text-slate-600">Preferred Time</label>
        <input
          type="time"
          value={form.time}
          onChange={e => setForm({ ...form, time: e.target.value })}
          className="mt-1 w-full rounded-lg border p-2"
        />
        {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
      </div>

      <div>
        <label className="block text-sm text-slate-600">Upload Prescription (optional)</label>
        <label className="flex items-center gap-2 mt-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border">
          <Upload size={16} />
          <span className="text-sm">Choose file</span>
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>
        {prescriptionFile && <div className="text-sm text-slate-600 mt-2">{prescriptionFile.name}</div>}
      </div>

      <div className="md:col-span-2 flex items-center justify-between mt-2">
        <div className="text-slate-700">
          Price: <span className="font-semibold">₹{selectedTest?.finalPrice || selectedTest?.price}</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white" disabled={loading}>
            {loading ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </form>
  );
}
