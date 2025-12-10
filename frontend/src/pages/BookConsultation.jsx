// src/pages/BookConsultation.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import DoctorCard from "../components/user/DoctorCard";
import { useAuth } from "../hooks/useAuth";
import { memberAPI, consultationAPI, paymentAPI } from "../utils/api";

/**
 * BookConsultation page (backend integrated)
 *
 * Routes used:
 * - GET /getMember           -> memberAPI.getMembers()
 * - POST /addMember          -> memberAPI.addMember(payload)
 * - POST /symptoms           -> consultationAPI.addSymptoms(payload)
 * - POST /specialists        -> consultationAPI.selectSpecialist(payload)
 * - POST /payment            -> paymentAPI.verifyPayment(payload)
 *
 * Notes:
 * - The backend /specialists should ideally return a Razorpay order object (or a payment token).
 *   Expected shape used below (adapt if your backend returns different keys):
 *   { rzpOrder: { id, amount, currency, receipt, notes }, appointmentId, ... }
 *
 * - If your backend returns a different structure, update the places marked with "ADAPT HERE".
 */

const SPECIALTIES = [
  "General Physician","Gynaecologist","Skin & Hair Specialist","Bone & Joint Specialist","Chest Physician",
  "Child Specialist","Dentist","Diabetes Specialist","Dietician","ENT Specialist","Endocrinology","Eye Specialist",
  "Gastroenterologist","Heart Specialist","Nephrologist","Psychiatrist"
];

const ALL_SYMPTOMS = [
  "Fever","Cold","Cough","Sore Throat","Runny Nose","Sneezing","Headache","Migraine","Body Pain","Back Pain",
  "Neck Pain","Shoulder Pain","Stomach Pain","Acidity","Gas","Bloating","Diarrhea","Constipation","Vomiting","Nausea",
  "Dizziness","Fatigue","Weakness","Insomnia","Anxiety","Depression","Stress","Palpitations","Shortness of Breath",
  "Wheezing","Chest Pain","High BP","Low BP","High Sugar","Low Sugar","Joint Pain","Knee Pain","Arthritis","Swelling",
  "Skin Rash","Itching","Acne","Dark Patches","Hairfall","Dandruff","Dry Skin","Red Eyes","Blurred Vision","Ear Pain",
  "Hearing Loss","Tinnitus","Frequent Urination","Burning Urine","UTI symptoms","Loss of Appetite","Weight Loss",
  "Weight Gain","PCOS symptoms","Missed Period","Heavy Period","Irregular Period","Cold & Flu","Covid Symptoms",
  "Chest Congestion","Sinus","Allergy","Pet-related Concern","Obesity/Weight Management","Acne/Pimples","Hair Loss",
  "Menstrual Pain","Premature Ejaculation","Unprotected Sex","Night Sweats","Fevers & Chills"
];

const MOST_SEARCHED = ["Fever","Cough","Headache","Acne","Stomach Pain","Cold"];

const ls = {
  read: (k, fallback) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  },
  write: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function BookConsultation() {
  const navigate = useNavigate();
  const query = useQuery();
  const doctorId = query.get("doctorId");

  const { isAuthenticated, user } = useAuth?.() ?? { isAuthenticated: false, user: null };

  // Demo doctors (keep this until you add /doctors backend)
  const mockDoctors = [
    { id: "1", name: "Dr. Rajesh Kumar", specialty: "General Physician", experience: "15 years", consultationFee: 299, image: "https://via.placeholder.com/150x150?text=Dr+1" },
    { id: "2", name: "Dr. Priya Sharma", specialty: "Heart Specialist", experience: "12 years", consultationFee: 499, image: "https://via.placeholder.com/150x150?text=Dr+2" },
    { id: "3", name: "Dr. Amit Patel", specialty: "Skin & Hair Specialist", experience: "10 years", consultationFee: 399, image: "https://via.placeholder.com/150x150?text=Dr+3" }
  ];
  const selectedDoctor = mockDoctors.find((d) => d.id === doctorId) || null;

  // STEP state
  const [step, setStep] = useState(1);

  // Members (persisted). Start with local fallback immediately, then overwrite from server if available
  const [members, setMembers] = useState(() =>
    ls.read("caremitra_members_v1", [
      { id: "m_you", name: user?.name ? `${user.name}` : "You (Sample)", age: 28, gender: "Female", phone: "98xxxx1234" }
    ])
  );
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);

  useEffect(() => ls.write("caremitra_members_v1", members), [members]);

  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || null);

  // phone & mode
  const [phone, setPhone] = useState(() => members.find(m => m.id === selectedMemberId)?.phone || "");
  const [mode, setMode] = useState("Video");

  // inline add/edit member form
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formGender, setFormGender] = useState("Female");
  const [formPhone, setFormPhone] = useState("");

  // symptoms
  const [symptomQuery, setSymptomQuery] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const symptomInputRef = useRef(null);
  const suggestionRef = useRef(null);
  const [inputFocused, setInputFocused] = useState(false); // controls showing large dropdown

  // specialty
  const [selectedSpecialty, setSelectedSpecialty] = useState(selectedDoctor?.specialty || SPECIALTIES[0]);

  // loading & error states for step actions
  const [stepLoading, setStepLoading] = useState(false);
  const [stepError, setStepError] = useState(null);

  // payment/appointment result
  const [appointmentResult, setAppointmentResult] = useState(null);

  // re-init when doctorId changes
  useEffect(() => {
    setStep(1);
    setSelectedSpecialty(selectedDoctor?.specialty || SPECIALTIES[0]);
    setSelectedSymptoms([]);
    setSymptomQuery("");
    setIsEditingMember(false);
    setEditingMember(null);
  }, [doctorId]); // eslint-disable-line

  useEffect(() => {
    const found = members.find((m) => m.id === selectedMemberId);
    setPhone(found?.phone || "");
  }, [selectedMemberId, members]);

  // load members from backend on mount
  useEffect(() => {
    let mounted = true;
    async function loadMembers() {
      setMembersLoading(true);
      try {
        const res = await memberAPI.getMembers();
        // adapt: server could return [] or { members: [...] }
        const list = Array.isArray(res.data) ? res.data : res.data.members ?? [];
        if (mounted && list.length) {
          setMembers(list);
          setSelectedMemberId(list[0]?.id ?? list[0]?.memberId ?? selectedMemberId);
        }
      } catch (err) {
        console.warn("Could not fetch members, continuing with local copy", err?.message || err);
        setMembersError(err?.response?.data?.message || err.message || "Failed to fetch members");
      } finally {
        if (mounted) setMembersLoading(false);
      }
    }
    loadMembers();
    return () => { mounted = false; };
  }, []); // run once

  // symptom suggestions: when input focused show many (filtered), when not focused and empty show none (we show MOST_SEARCHED chips separately)
  const symptomSuggestions = useMemo(() => {
    const q = symptomQuery.trim().toLowerCase();
    if (!q) {
      return inputFocused ? ALL_SYMPTOMS.slice(0, 60) : [];
    }
    return ALL_SYMPTOMS.filter((s) => s.toLowerCase().includes(q)).slice(0, 200);
  }, [symptomQuery, inputFocused]);

  // handlers
  function handleSelectSymptomFromDropdown(sym) {
    setSelectedSymptoms((prev) => {
      if (prev.includes(sym)) return prev.filter((x) => x !== sym);
      return [...prev, sym];
    });
    setInputFocused(false);
    setSymptomQuery("");
    symptomInputRef.current?.blur();
  }

  function toggleSymptom(sym) {
    setSelectedSymptoms((p) => (p.includes(sym) ? p.filter((x) => x !== sym) : [...p, sym]));
  }

  // member handlers
  function startAddMember() {
    setIsEditingMember(true);
    setEditingMember(null);
    setFormName("");
    setFormAge("");
    setFormGender("Female");
    setFormPhone("");
  }

  function startEditMember(m) {
    setIsEditingMember(true);
    setEditingMember(m);
    setFormName(m.name || "");
    setFormAge(String(m.age || ""));
    setFormGender(m.gender || "Female");
    setFormPhone(m.phone || "");
  }

  // Save member using backend POST /addMember
  async function saveMember() {
    if (!formName || !formAge) return;
    const payload = {
      name: formName,
      age: Number(formAge),
      gender: formGender,
      phone: formPhone,
    };

    setStepLoading(true);
    setStepError(null);
    try {
      const res = await memberAPI.addMember(payload);
      // adapt to server response: expected created member in res.data.member or res.data
      const saved = res.data.member ?? res.data;
      // ensure id exists (backend should return)
      if (!saved?.id && saved?.memberId) {
        saved.id = saved.memberId;
      }

      setMembers((prev) => [...prev, saved]);
      setSelectedMemberId(saved.id);
      setIsEditingMember(false);
      setEditingMember(null);
    } catch (err) {
      console.error("Failed to add member:", err);
      setStepError(err?.response?.data?.message || err.message || "Failed to add member");
    } finally {
      setStepLoading(false);
    }
  }

  function removeMember(id) {
    const filtered = members.filter((m) => m.id !== id);
    setMembers(filtered);
    if (selectedMemberId === id) setSelectedMemberId(filtered[0]?.id || null);
    if (filtered.length === 0) startAddMember();
  }

  // Step transitions integrated with backend
  // Move from Step 1 -> Step 2: just front-end change
  // Move from Step 2 -> Step 3: send symptoms to backend
  async function handleStep2Continue() {
    setStepLoading(true);
    setStepError(null);
    try {
      const payload = {
        memberId: selectedMemberId,
        symptoms: selectedSymptoms,
      };
      await consultationAPI.addSymptoms(payload);
      setStep(3);
    } catch (err) {
      console.error("Failed to send symptoms:", err);
      setStepError(err?.response?.data?.message || err.message || "Failed to send symptoms");
    } finally {
      setStepLoading(false);
    }
  }

  // Final step: select specialist -> backend returns payment info (rzp order) OR appointment id
  // Then we open Razorpay and on success call /payment to verify.
  // Replace this existing function in BookConsultation.jsx
async function handleConfirm() {
  setStepLoading(true);
  setStepError(null);

  try {
    const payload = {
      memberId: selectedMemberId,
      specialty: selectedSpecialty,
      symptoms: selectedSymptoms,
      doctorId: selectedDoctor?.id || null,
      mode,
      phone,
    };

    // 1) send selection to backend
    const res = await consultationAPI.selectSpecialist(payload);
    const data = res.data ?? {};
    setAppointmentResult(data);

    // If backend returned rzpOrder -> redirect to payment page (pass data via state)
    if (data.rzpOrder) {
      const appointmentId = data.appointmentId ?? data.id ?? data.rzpOrder?.notes?.appointmentId ?? null;
      navigate("/payment", {
        state: {
          rzpOrder: data.rzpOrder,
          appointmentId,
          specialty: selectedSpecialty,
          memberId: selectedMemberId,
          doctor: data.doctor ?? selectedDoctor,
          amount: data.rzpOrder.amount ?? (selectedDoctor?.consultationFee || 0),
        },
      });
      return;
    }

    // If backend did not return rzpOrder but created appointment
    if (data.appointmentId) {
      // navigate to appointment list or to the appointment details
      navigate("/appointments");
      return;
    }

    // fallback
    navigate("/appointments");
  } catch (err) {
    console.error("Failed to select specialist:", err);
    setStepError(err?.response?.data?.message || err.message || "Failed to complete booking");
  } finally {
    setStepLoading(false);
  }
}


  // Dynamically load Razorpay script
  function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      if (document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']")) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });
  }

  // Open Razorpay and then call backend /payment to verify
  async function openRazorpayAndVerify(rzpOrder, appointmentId = null) {
    try {
      await loadRazorpayScript();
    } catch (err) {
      setStepError("Could not load payment gateway. Please try again.");
      console.error(err);
      return;
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: window.__RAZORPAY_KEY__ || rzpOrder.key || "", // you can inject your key on page or backend can supply
        amount: rzpOrder.amount, // in paise (e.g., 29900)
        currency: rzpOrder.currency || "INR",
        name: "CareMitra",
        description: "Consultation Payment",
        order_id: rzpOrder.id, // razorpay order id from backend
        prefill: {
          name: members.find(m => m.id === selectedMemberId)?.name || user?.name || "",
          contact: phone || members.find(m => m.id === selectedMemberId)?.phone || ""
        },
        handler: async function (response) {
          // response contains razorpay_payment_id, razorpay_order_id, razorpay_signature
          try {
            const verifyPayload = {
              ...response,
              appointmentId,
              memberId: selectedMemberId,
              specialty: selectedSpecialty,
              doctorId: selectedDoctor?.id || null,
            };

            // call backend to verify payment server-side
            const verifyRes = await paymentAPI.verifyPayment(verifyPayload);
            // adapt: backend should return success details
            const verifyData = verifyRes.data ?? {};

            // success: navigate to appointments or show success modal
            navigate("/appointments");
            resolve(verifyData);
          } catch (err) {
            console.error("Payment verification failed:", err);
            setStepError(err?.response?.data?.message || err.message || "Payment verification failed");
            reject(err);
          }
        },
        modal: {
          ondismiss: function () {
            setStepError("Payment cancelled");
            reject(new Error("Payment cancelled"));
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  }

  // close suggestions when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target) && symptomInputRef.current && !symptomInputRef.current.contains(e.target)) {
        setInputFocused(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // progress bar classes
  const progressClasses = (i) => {
    if (i < step) return "bg-emerald-600";
    if (i === step) return "bg-emerald-400";
    return "bg-gray-300";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" style={{ paddingTop: "var(--nav-offset)" }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <ChevronLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className={`h-1 w-24 rounded ${progressClasses(1)}`} />
          <div className={`h-1 w-24 rounded ${progressClasses(2)}`} />
          <div className={`h-1 w-24 rounded ${progressClasses(3)}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 bg-white rounded shadow p-6" style={{ minHeight: 480, display: "flex", flexDirection: "column" }}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                {step === 1 ? "Who are you consulting for?" : step === 2 ? "Tell us your symptoms" : "Select your specialty"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {step === 1
                  ? "Choose the person and preferred consultation mode."
                  : step === 2
                  ? "Type to search symptoms or choose from suggestions."
                  : "Pick the specialist you want to consult."}
              </p>
            </div>

            <div style={{ flex: "1 1 auto", overflowY: "auto", paddingRight: 6 }}>
              {/* Step 1 */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {!isEditingMember ? (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">Patient / Member</h3>
                          <button onClick={startAddMember} className="text-sm text-sky-600">+ Add</button>
                        </div>

                        <div className="space-y-3">
                          {membersLoading && <div className="text-xs text-gray-500">Loading members...</div>}
                          {members.map((m) => (
                            <div key={m.id} className={`p-3 rounded border ${selectedMemberId === m.id ? "border-sky-600 bg-sky-50" : "border-gray-200"}`}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold">{m.name}</div>
                                  <div className="text-xs text-gray-500">{m.age} • {m.gender}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button onClick={() => { setSelectedMemberId(m.id); setPhone(m.phone || ""); }} className="text-xs px-2 py-1 rounded border text-gray-600">Select</button>
                                  <button onClick={() => startEditMember(m)} className="text-xs text-sky-600">Edit</button>
                                  <button onClick={() => removeMember(m.id)} className="text-xs text-red-600">Remove</button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {membersError && <div className="text-xs text-red-600">{membersError}</div>}
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="font-medium mb-3">{editingMember ? "Edit member" : "Add member"}</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-600 block mb-1">Full name</label>
                            <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g., Priya Sharma" className="border rounded px-3 py-2 w-full" />
                          </div>

                          <div className="flex gap-2">
                            <div className="w-1/3">
                              <label className="text-sm text-gray-600 block mb-1">Age</label>
                              <input value={formAge} onChange={(e) => setFormAge(e.target.value)} placeholder="e.g., 29" className="border rounded px-3 py-2 w-full" />
                            </div>
                            <div className="w-2/3">
                              <label className="text-sm text-gray-600 block mb-1">Gender</label>
                              <select value={formGender} onChange={(e) => setFormGender(e.target.value)} className="border rounded px-3 py-2 w-full">
                                <option>Select gender</option><option>Female</option><option>Male</option><option>Other</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm text-gray-600 block mb-1">Phone (example)</label>
                            <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="98xxxx1234" className="border rounded px-3 py-2 w-full" />
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => { setIsEditingMember(false); setEditingMember(null); }} className="border rounded px-4 py-2">Cancel</button>
                            <button onClick={saveMember} className="bg-sky-600 text-white px-4 py-2 rounded">
                              {stepLoading ? "Saving..." : "Save"}
                            </button>
                          </div>

                          {stepError && <div className="text-xs text-red-600 mt-2">{stepError}</div>}
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Patient phone number</label>
                      <input className="border rounded px-3 py-2 w-full mb-4" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98xxxx1234" />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 block mb-2">Preferred mode</label>
                      <div className="flex gap-2">
                        {["Video","Audio","Chat"].map((m) => (
                          <button key={m} onClick={() => setMode(m)} className={`px-3 py-2 rounded border ${mode === m ? "bg-sky-600 text-white" : "bg-gray-100"}`}>{m}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <h3 className="font-medium mb-3">Tell us your symptoms</h3>

                  <div className="relative mb-3">
                    <input
                      ref={symptomInputRef}
                      value={symptomQuery}
                      onChange={(e) => setSymptomQuery(e.target.value)}
                      placeholder="Search symptoms..."
                      className="border rounded px-3 py-2 w-full"
                      onFocus={() => setInputFocused(true)}
                    />

                    {inputFocused && (
                      <div ref={suggestionRef} className="absolute left-0 right-0 mt-2 bg-white border rounded shadow max-h-56 overflow-y-auto z-40">
                        <div className="px-3 py-2 text-xs text-gray-500 border-b">Suggestions</div>
                        <div className="px-2 py-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {symptomSuggestions.length ? symptomSuggestions.map((s) => {
                            const sel = selectedSymptoms.includes(s);
                            return (
                              <button
                                key={s}
                                onClick={() => handleSelectSymptomFromDropdown(s)}
                                className={`text-left px-3 py-2 rounded ${sel ? "bg-sky-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                              >
                                {s}
                              </button>
                            );
                          }) : <div className="text-xs text-gray-500 px-3 py-2">No matching symptoms</div>}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Most searched</div>
                    <div className="flex flex-wrap gap-2">
                      {MOST_SEARCHED.map(s => (
                        <button key={s} onClick={() => toggleSymptom(s)} className={`px-3 py-1 rounded ${selectedSymptoms.includes(s) ? "bg-sky-600 text-white" : "bg-gray-100"}`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">Selected</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map(s => (
                        <div key={s} className="px-2 py-1 bg-sky-50 text-sky-600 rounded flex items-center gap-2 text-sm">
                          {s}
                          <button onClick={() => toggleSymptom(s)} className="text-xs">✕</button>
                        </div>
                      ))}
                      {!selectedSymptoms.length && <div className="text-xs text-gray-400">No symptoms selected</div>}
                    </div>
                  </div>

                  {stepError && <div className="text-xs text-red-600 mb-2">{stepError}</div>}
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div>
                  <h3 className="font-medium mb-3">Select your specialty</h3>
                  <div className="max-h-56 overflow-auto border rounded p-3 grid grid-cols-2 gap-2">
                    {SPECIALTIES.map(sp => (
                      <div key={sp} onClick={() => setSelectedSpecialty(sp)} className={`p-2 rounded cursor-pointer ${selectedSpecialty === sp ? "bg-sky-600 text-white" : "bg-gray-100"}`}>{sp}</div>
                    ))}
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    Not sure which specialty? <button className="text-sky-600 underline" onClick={() => setSelectedSpecialty("General Physician")}>Consult a GP</button>
                  </div>

                  {stepError && <div className="text-xs text-red-600 mt-2">{stepError}</div>}
                </div>
              )}
            </div>

            {/* Footer summary */}
            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <button
                    onClick={() => {
                      if (typeof step === "number" && step > 1) {
                        setStep((s) => s - 1);
                      } else {
                        navigate(-1);
                      }
                    }}
                    className="mr-3 border rounded px-4 py-2"
                  >
                    Back
                  </button>

                  {members.find(m => m.id === selectedMemberId) ? (
                    <>
                      Booking for <span className="font-medium">{members.find(m => m.id === selectedMemberId)?.name}</span> • {mode} •{" "}
                      <span className="font-medium">{selectedSpecialty}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">Select patient details</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => navigate(-1)} className="border rounded px-4 py-2">
                    Cancel
                  </button>

                  {step < 3 ? (
                    <button
                      onClick={() => {
                        if (step === 1) setStep(2);
                        else if (step === 2) handleStep2Continue();
                      }}
                      className="bg-sky-600 text-white px-4 py-2 rounded"
                    >
                      {stepLoading ? "Please wait..." : "Continue"}
                    </button>
                  ) : (
                    <button
                      onClick={handleConfirm}
                      className="bg-sky-600 text-white px-4 py-2 rounded"
                    >
                      {stepLoading ? "Processing..." : "Confirm"}
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right column */}
          <div>
            <div className="sticky top-[calc(var(--nav-offset)+16px)]">
              {selectedDoctor ? (
                <DoctorCard doctor={selectedDoctor} onBook={() => {}} />
              ) : (
                <div className="bg-white rounded shadow p-6 text-center">
                  <div className="text-lg font-semibold mb-2">No doctor selected</div>
                  <div className="text-sm text-gray-500 mb-4">Choose a doctor after filling symptoms, or return to doctors list.</div>
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => navigate("/doctors")} className="border rounded px-3 py-2">Choose doctor</button>
                  </div>
                </div>
              )}

              <div className="mt-4 bg-white rounded shadow p-4 text-sm text-gray-600">
                <div className="font-medium mb-2">What you get</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Doctor-signed digital prescription</li>
                  <li>Free follow-up for 3 days</li>
                  <li>100% confidential</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
