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

  // pincode verification state
  const [pincodeVerified, setPincodeVerified] = useState(false);
  const [pincodeMsg, setPincodeMsg] = useState("");
  const [pincodeSuggs, setPincodeSuggs] = useState([]);
  const [verifying, setVerifying] = useState(false);

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
      
      // If pincode exists in initial data, mark as verified
      if (initialData.pincode && /^\d{6}$/.test(initialData.pincode)) {
        setPincodeVerified(true);
      }
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
    setPincodeMsg("");
    setPincodeSuggs([]);
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
    else if (!/^\d{6}$/.test(pincode)) e.pincode = "Enter a valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    if (!pincodeVerified) {
      setPincodeMsg("Please verify pincode before saving.");
      return;
    }

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

  const verifyPincode = async (pin) => {
    if (!/^\d{6}$/.test(pin)) {
      setPincodeVerified(false);
      setPincodeMsg("Enter a valid 6-digit pincode to verify.");
      setPincodeSuggs([]);
      return;
    }

    setVerifying(true);
    setPincodeMsg("");
    setPincodeSuggs([]);
    setPincodeVerified(false);

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setPincodeVerified(false);
        setPincodeMsg("Unable to verify pincode at the moment.");
        return;
      }

      const first = data[0];
      if (first.Status !== "Success" || !Array.isArray(first.PostOffice) || first.PostOffice.length === 0) {
        setPincodeVerified(false);
        setPincodeMsg("Pincode not serviceable.");
        return;
      }

      const postOffices = first.PostOffice;
      const sugg = postOffices.map((po) => ({
        name: po.Name,
        district: po.District,
        state: po.State,
        display: `${po.Name}, ${po.District}, ${po.State}`
      }));
      setPincodeSuggs(sugg);
      setPincodeVerified(true);
      setPincodeMsg("Pincode is serviceable. Select a location below to auto-fill city & state.");
    } catch (err) {
      console.error("pincode verify error", err);
      setPincodeVerified(false);
      setPincodeMsg("Error verifying pincode.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSuggestionClick = (sugg) => {
    setCity(sugg.district);
    setStateVal(sugg.state);
    setPincodeSuggs([]);
    setPincodeMsg("City and State auto-filled successfully!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b bg-linear-to-r from-sky-500 to-blue-600">
          <h3 className="text-xl font-bold text-white">Add / Edit Delivery Address</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              placeholder="Enter your full name"
            />
            {errors.fullName && <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.fullName}
            </p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              placeholder="Enter 10-digit mobile number"
              type="tel"
            />
            {errors.phone && <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.phone}
            </p>}
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              placeholder="House no., Building name, Street"
            />
            {errors.addressLine1 && <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.addressLine1}
            </p>}
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address Line 2 <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              placeholder="Landmark, Colony, Area"
            />
          </div>

          {/* Pincode with Verify */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pincode <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <input
                value={pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setPincode(val);
                  setPincodeVerified(false);
                  setPincodeMsg("");
                  setPincodeSuggs([]);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="Enter 6-digit pincode"
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => verifyPincode(pincode)}
                disabled={verifying || !/^\d{6}$/.test(pincode)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  pincodeVerified
                    ? "bg-green-500 text-white"
                    : verifying
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-sky-500 text-white hover:bg-sky-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                }`}
              >
                {verifying ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </span>
                ) : pincodeVerified ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  "Verify"
                )}
              </button>
            </div>

            {pincodeMsg && (
              <div className={`mt-2 p-3 rounded-lg flex items-start gap-2 ${
                pincodeVerified ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}>
                {pincodeVerified ? (
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-sm font-medium">{pincodeMsg}</span>
              </div>
            )}

            {pincodeSuggs.length > 0 && (
              <div className="mt-3 border border-sky-200 rounded-xl overflow-hidden">
                <div className="bg-sky-50 px-4 py-2 border-b border-sky-200">
                  <p className="text-sm font-semibold text-sky-800">Select your location to auto-fill City & State:</p>
                </div>
                <ul className="max-h-48 overflow-y-auto">
                  {pincodeSuggs.map((sugg, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSuggestionClick(sugg)}
                      className="px-4 py-3 hover:bg-sky-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-sky-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm text-gray-700">{sugg.display}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {errors.pincode && <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.pincode}
            </p>}
          </div>

          {/* City and State Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="City"
              />
              {errors.city && <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.city}
              </p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                value={stateVal}
                onChange={(e) => setStateVal(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="State"
              />
              {errors.state && <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.state}
              </p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-linear-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Save Address
          </button>
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