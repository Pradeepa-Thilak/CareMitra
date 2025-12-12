// src/components/address/AddressModal.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

/**
 * AddressModal
 *
 * Props:
 * - isOpen: boolean
 * - initialData: optional object with same shape as shippingAddress (to edit existing)
 * - onClose: () => void
 * - onConfirm: (addressObj) => void
 *
 * addressObj shape:
 * {
 *   fullName: string,
 *   phone: string,
 *   addressLine1: string,
 *   addressLine2: string,
 *   city: string,
 *   state: string,
 *   pincode: string
 * }
 */
export default function AddressModal({ isOpen, initialData = null, onClose, onConfirm }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pincode, setPincode] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName ?? "");
      setPhone(initialData.phone ?? "");
      setAddressLine1(initialData.addressLine1 ?? "");
      setAddressLine2(initialData.addressLine2 ?? "");
      setCity(initialData.city ?? "");
      setStateVal(initialData.state ?? "");
      setPincode(initialData.pincode ?? "");
    } else {
      setFullName("");
      setPhone("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setStateVal("");
      setPincode("");
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!phone.trim()) e.phone = "Phone is required";
    else if (!/^\d{7,15}$/.test(phone.replace(/\s+/g, ""))) e.phone = "Enter a valid phone number";
    if (!addressLine1.trim()) e.addressLine1 = "Address line 1 is required";
    if (!city.trim()) e.city = "City is required";
    if (!stateVal.trim()) e.state = "State is required";
    if (!pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{4,7}$/.test(pincode)) e.pincode = "Enter a valid pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    const addressObj = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      city: city.trim(),
      state: stateVal.trim(),
      pincode: pincode.trim(),
    };
    localStorage.setItem("shippingAddress", JSON.stringify(addressObj));
    onConfirm(addressObj);
  };

  return (
    // overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Add / Edit Address</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field w-full"
              placeholder="Eg. John Doe"
            />
            {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field w-full"
              placeholder="10-digit number"
            />
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address line 1</label>
            <input
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="input-field w-full"
              placeholder="House, building, street"
            />
            {errors.addressLine1 && <p className="text-red-600 text-sm mt-1">{errors.addressLine1}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address line 2 (optional)</label>
            <input
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className="input-field w-full"
              placeholder="Landmark, colony, area"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="input-field w-full" />
              {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input value={stateVal} onChange={(e) => setStateVal(e.target.value)} className="input-field w-full" />
              {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input value={pincode} onChange={(e) => setPincode(e.target.value)} className="input-field w-full" />
              {errors.pincode && <p className="text-red-600 text-sm mt-1">{errors.pincode}</p>}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-outline px-4 py-2">Cancel</button>
          <button onClick={handleConfirm} className="btn-primary px-4 py-2">Save Address</button>
        </div>
      </div>
    </div>
  );
}

AddressModal.propTypes = {
  isOpen: PropTypes.bool,
  initialData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
