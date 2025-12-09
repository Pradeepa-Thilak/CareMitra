import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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

  // pincode verification state
  const [pincodeVerifying, setPincodeVerifying] = useState(false);
  const [pincodeVerified, setPincodeVerified] = useState(null); // null | true | false
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [pincodeSuggestions, setPincodeSuggestions] = useState([]); // array of strings

  // allow user to override verification (if needed)
  const [allowOverride, setAllowOverride] = useState(false);

  // debounce ref for auto verify
  const verifyTimeout = useRef(null);

  useEffect(() => {
    setForm(prev => ({ ...prev, ...initialValues }));
  }, [initialValues, selectedTest]);

  // Auto-verify when pincode becomes a valid 6-digit number (debounced)
  useEffect(() => {
    const p = (form.pincode || '').trim();
    // reset state on change
    setPincodeVerified(null);
    setPincodeMessage('');
    setPincodeSuggestions([]);
    setAllowOverride(false);

    if (/^\d{6}$/.test(p)) {
      // debounce call to avoid many requests while typing
      if (verifyTimeout.current) clearTimeout(verifyTimeout.current);
      verifyTimeout.current = setTimeout(() => {
        verifyPincode(p);
      }, 600);
    } else {
      // if not valid format, clear verification
      if (verifyTimeout.current) clearTimeout(verifyTimeout.current);
      setPincodeVerifying(false);
    }

    return () => {
      if (verifyTimeout.current) clearTimeout(verifyTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.pincode]);

  const verifyPincode = async (pincode) => {
    setPincodeVerifying(true);
    setPincodeVerified(null);
    setPincodeMessage('');
    setPincodeSuggestions([]);

    try {
      // India Post public API
      const resp = await axios.get(`https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`);
      const data = resp.data && resp.data[0];

      if (!data) {
        setPincodeVerified(false);
        setPincodeMessage('No response from pincode API.');
        return;
      }

      if (data.Status !== 'Success') {
        setPincodeVerified(false);
        setPincodeMessage('Pincode not found.');
        return;
      }

      const postOffices = data.PostOffice || [];
      if (!postOffices.length) {
        setPincodeVerified(false);
        setPincodeMessage('No Post Office entries found for this pincode.');
        return;
      }

      // build suggestion strings and pick first as default suggestion
      const suggestions = postOffices.map(po => `${po.Name}, ${po.District}, ${po.State}`);
      setPincodeSuggestions(suggestions);

      // basic match success: if there's at least one post office, treat as verified
      setPincodeVerified(true);
      setPincodeMessage('Pincode found. Select a suggestion to autofill locality or continue.');

      // Optionally autofill address's city/state if empty — commented out; enable if desired:
      // if (!form.address) setForm(prev => ({ ...prev, address: `${postOffices[0].Name}, ${postOffices[0].District}` }));
    } catch (err) {
      console.error('verifyPincode error', err);
      setPincodeVerified(false);
      setPincodeMessage('Failed to verify pincode (network or CORS).');
    } finally {
      setPincodeVerifying(false);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setPrescriptionFile(f);
  };

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!/^[0-9]{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit phone number.';
    if (!form.pincode || !/^[0-9]{6}$/.test(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode.';

    // enforce verification unless user chooses override
    if (!allowOverride) {
      if (pincodeVerified !== true) {
        errs.pincode = pincodeMessage || 'Please verify the pincode.';
      }
    }

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

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validateForm();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    if (onSubmit) {
      await onSubmit(form, prescriptionFile);
    }
  }

  // allow user to accept a suggestion and populate address
  const acceptSuggestion = (suggestion, index) => {
    // suggestion like "Name, District, State" -> put into address field (you can customize)
    setForm(prev => ({ ...prev, address: `${suggestion}` }));
    // keep pincode verified as true
    setPincodeVerified(true);
    setAllowOverride(false);
  };

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
        <div className="flex items-center gap-2">
          <input
            value={form.pincode}
            onChange={e => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })}
            className="mt-1 w-full rounded-lg border p-2"
            maxLength={6}
            placeholder="6-digit pincode"
          />
          <button
            type="button"
            onClick={() => {
              if (/^\d{6}$/.test(form.pincode)) verifyPincode(form.pincode);
            }}
            className="px-3 py-2 rounded-lg border text-sm"
            disabled={pincodeVerifying || !/^\d{6}$/.test(form.pincode)}
          >
            {pincodeVerifying ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        {/* verification status / messages */}
        <div className="mt-2">
          {pincodeVerified === true && <p className="text-green-600 text-sm">✅ {pincodeMessage}</p>}
          {pincodeVerified === false && <p className="text-red-600 text-sm">❌ {pincodeMessage}</p>}
          {pincodeVerified === null && form.pincode && !/^\d{6}$/.test(form.pincode) && (
            <p className="text-gray-600 text-sm">Pincode must be 6 digits</p>
          )}
        </div>

        {/* list suggestions if available */}
        {pincodeSuggestions.length > 0 && (
          <div className="mt-2 border rounded p-2 bg-slate-50">
            <div className="text-xs text-slate-600 mb-1">Suggestions (click to autofill address):</div>
            <ul className="space-y-1 max-h-36 overflow-auto">
              {pincodeSuggestions.slice(0, 6).map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => acceptSuggestion(s, i)}
                    className="text-left text-sm w-full hover:underline"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowOverride}
              onChange={e => setAllowOverride(e.target.checked)}
            />
            <span>Allow submit without verification (override)</span>
          </label>
        </div>

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
