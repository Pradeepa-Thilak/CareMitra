// src/pages/BookConsultation.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import DoctorCard from "../components/user/DoctorCard";
import { useAuth } from "../hooks/useAuth";
import { memberAPI, consultationAPI, paymentAPI, doctorAPI } from "../utils/api";

const SPECIALTIES = [
  "General Physician", "Cardiology", "Gynaecologist", "Skin & Hair Specialist", 
  "Bone & Joint Specialist", "Chest Physician", "Child Specialist", "Dentist", 
  "Diabetes Specialist", "Dietician", "ENT Specialist", "Endocrinology", 
  "Eye Specialist", "Gastroenterologist", "Heart Specialist", "Nephrologist", 
  "Psychiatrist"
];

const ALL_SYMPTOMS = [
  "Fever", "Cold", "Cough", "Sore Throat", "Runny Nose", "Sneezing", "Headache", 
  "Migraine", "Body Pain", "Back Pain", "Neck Pain", "Shoulder Pain", "Stomach Pain", 
  "Acidity", "Gas", "Bloating", "Diarrhea", "Constipation", "Vomiting", "Nausea",
  "Dizziness", "Fatigue", "Weakness", "Insomnia", "Anxiety", "Depression", "Stress", 
  "Palpitations", "Shortness of Breath", "Wheezing", "Chest Pain", "High BP", 
  "Low BP", "High Sugar", "Low Sugar", "Joint Pain", "Knee Pain", "Arthritis", 
  "Swelling", "Skin Rash", "Itching", "Acne", "Dark Patches", "Hairfall", 
  "Dandruff", "Dry Skin", "Red Eyes", "Blurred Vision", "Ear Pain", "Hearing Loss", 
  "Tinnitus", "Frequent Urination", "Burning Urine", "UTI symptoms", "Loss of Appetite", 
  "Weight Loss", "Weight Gain", "PCOS symptoms", "Missed Period", "Heavy Period", 
  "Irregular Period", "Cold & Flu", "Covid Symptoms", "Chest Congestion", "Sinus", 
  "Allergy", "Pet-related Concern", "Obesity/Weight Management", "Acne/Pimples", 
  "Hair Loss", "Menstrual Pain", "Premature Ejaculation", "Unprotected Sex", 
  "Night Sweats", "Fevers & Chills"
];

const MOST_SEARCHED = ["Fever", "Cough", "Headache", "Acne", "Stomach Pain", "Cold"];

const CONSULTATION_TYPES = ["video", "audio", "chat"];

const CONSULTATION_DISPLAY = {
  "video": "Video",
  "audio": "Audio",
  "chat": "Chat"
};

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

  // State for doctors list
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // STEP state
  const [step, setStep] = useState(1);

  // Members
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);

  const [selectedMemberId, setSelectedMemberId] = useState(null);

  // Phone & consultation type
  const [phone, setPhone] = useState("");
  const [consultationType, setConsultationType] = useState("video");

  // Member form
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formGender, setFormGender] = useState("Female");
  const [formPhone, setFormPhone] = useState("");

  // Symptoms
  const [symptomQuery, setSymptomQuery] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const symptomInputRef = useRef(null);
  const suggestionRef = useRef(null);
  const [inputFocused, setInputFocused] = useState(false);

  // Specialty
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [specialtyDoctors, setSpecialtyDoctors] = useState([]);

  // Loading & error states
  const [stepLoading, setStepLoading] = useState(false);
  const [stepError, setStepError] = useState(null);

  // Payment/appointment result
  const [appointmentResult, setAppointmentResult] = useState(null);

  // Load doctors and members on component mount
  useEffect(() => {
    loadDoctors();
    loadMembers();
  }, []);

  // Load available doctors
  const loadDoctors = async () => {
    try {
      const res = await doctorAPI.getAllDoctors();
      if (res.data.success) {
        setDoctors(res.data.data);
        
        // If doctorId is provided in query, set it as selected
        if (doctorId) {
          const doctor = res.data.data.find(d => d._id === doctorId);
          if (doctor) {
            setSelectedDoctor(doctor);
            setSelectedSpecialty(doctor.specialization);
          }
        }
      }
    } catch (err) {
      console.error("Error loading doctors:", err);
    }
  };

  // Load members from backend
  const loadMembers = async () => {
    setMembersLoading(true);
    setMembersError(null);

    try {
      const res = await memberAPI.getMembers();
      
      if (res.data.success) {
        // Backend returns { success: true, data: membersArray }
        const membersList = res.data.data || [];
        
        const transformed = membersList.map(member => ({
          id: member._id,
          name: member.name,
          age: member.age,
          gender: member.gender,
          phone: member.phoneNumber || member.phone,
        }));

        // Add self as a member if user exists
        if (user && !transformed.some(m => m.name.includes("You"))) {
          transformed.unshift({
            id: "self",
            name: `${user.name} (You)`,
            age: user.age || 30,
            gender: user.gender || "Female",
            phone: user.phone || ""
          });
        }

        setMembers(transformed);
        
        if (transformed.length > 0) {
          setSelectedMemberId(transformed[0].id);
          setPhone(transformed[0].phone || "");
        }
      } else {
        setMembersError("Failed to load members");
      }
    } catch (err) {
      console.error("Error loading members:", err);
      setMembersError("Failed to load members");
      
      // Fallback to local storage if API fails
      const fallbackMembers = ls.read("caremitra_members_v1", []);
      if (fallbackMembers.length > 0) {
        setMembers(fallbackMembers);
        setSelectedMemberId(fallbackMembers[0]?.id);
        setPhone(fallbackMembers[0]?.phone || "");
      }
    } finally {
      setMembersLoading(false);
    }
  };

  // Save to localStorage when members change
  useEffect(() => {
    if (members.length > 0) {
      ls.write("caremitra_members_v1", members);
    }
  }, [members]);

  // Update phone when member changes
  useEffect(() => {
    const member = members.find(m => m.id === selectedMemberId);
    if (member) {
      setPhone(member.phone || "");
    }
  }, [selectedMemberId, members]);

  // Filter doctors by specialty
  useEffect(() => {
    if (selectedSpecialty) {
      const filtered = doctors.filter(d => 
        d.specialization === selectedSpecialty || 
        d.specialist === selectedSpecialty
      );
      setSpecialtyDoctors(filtered);
    }
  }, [selectedSpecialty, doctors]);

  // Symptom suggestions
  const symptomSuggestions = useMemo(() => {
    const q = symptomQuery.trim().toLowerCase();
    if (!q) {
      return inputFocused ? ALL_SYMPTOMS.slice(0, 60) : [];
    }
    return ALL_SYMPTOMS.filter((s) => s.toLowerCase().includes(q)).slice(0, 200);
  }, [symptomQuery, inputFocused]);

  // Handlers
  const handleSelectSymptomFromDropdown = (sym) => {
    setSelectedSymptoms((prev) => {
      if (prev.includes(sym)) return prev.filter((x) => x !== sym);
      return [...prev, sym];
    });
    setInputFocused(false);
    setSymptomQuery("");
    symptomInputRef.current?.blur();
  };

  const toggleSymptom = (sym) => {
    setSelectedSymptoms((p) => (p.includes(sym) ? p.filter((x) => x !== sym) : [...p, sym]));
  };

  // Member handlers
  const startAddMember = () => {
    setIsEditingMember(true);
    setEditingMember(null);
    setFormName("");
    setFormAge("");
    setFormGender("Female");
    setFormPhone("");
  };

  const startEditMember = (m) => {
    setIsEditingMember(true);
    setEditingMember(m);
    setFormName(m.name || "");
    setFormAge(String(m.age || ""));
    setFormGender(m.gender || "Female");
    setFormPhone(m.phone || "");
  };

  // Save member using backend
  const saveMember = async () => {
    if (!formName || !formAge) {
      setStepError("Name and age are required");
      return;
    }

    const payload = {
      name: formName,
      age: Number(formAge),
      gender: formGender,
      phone: formPhone,
    };

    setStepLoading(true);
    setStepError(null);

    try {
      if (!editingMember) {
        // Add new member
        const res = await memberAPI.addMember(payload);
        
        if (res.data.success) {
          const newMember = {
            id: res.data.member._id,
            name: res.data.member.name,
            age: res.data.member.age,
            gender: res.data.member.gender,
            phone: res.data.member.phoneNumber || formPhone,
          };

          setMembers(prev => [...prev, newMember]);
          setSelectedMemberId(newMember.id);
          setPhone(newMember.phone || "");
        }
      } else {
        // Edit existing member
        await memberAPI.editMember(editingMember.id, payload);
        
        setMembers(prev =>
          prev.map(m =>
            m.id === editingMember.id
              ? { ...m, ...payload }
              : m
          )
        );
      }

      setIsEditingMember(false);
      setEditingMember(null);

    } catch (err) {
      console.error("Save member error:", err);
      setStepError(
        err.response?.data?.message ||
        err.message ||
        "Failed to save member"
      );
    } finally {
      setStepLoading(false);
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    setStepLoading(true);
    setStepError(null);

    try {
      // If it's a self-added member (not from backend), just remove locally
      if (memberId === "self") {
        setMembers(prev => prev.filter(m => m.id !== memberId));
        if (selectedMemberId === memberId) {
          setSelectedMemberId(members[1]?.id || null);
        }
      } else {
        // Remove from backend
        await memberAPI.deleteMember(memberId);
        
        setMembers(prev => prev.filter(m => m.id !== memberId));
        if (selectedMemberId === memberId) {
          setSelectedMemberId(members[1]?.id || null);
        }
      }
    } catch (err) {
      setStepError("Failed to delete member");
    } finally {
      setStepLoading(false);
    }
  };

  // Step 1: Save consultation type and move to step 2
async function handleStep1Continue() {
  setStepLoading(true);
  setStepError(null);

  try {
    if (!selectedMemberId) throw new Error("Select a member first");

    // Use consultationType state variable (not 'mode')
    const payload = { consultingType: consultationType }; // Assuming you have consultationType state
    
    console.log("Saving consultation type:", payload);

    // Call the correct endpoint - PUT method
    await memberAPI.addMode(selectedMemberId, payload);

    // advance UI
    setStep(2);
  } catch (err) {
    console.error("Failed to save consulting mode:", err);
    setStepError(err?.response?.data?.message || err.message || "Could not save mode");
  } finally {
    setStepLoading(false);
  }
}

  // Step 2: Save symptoms and move to step 3
  const handleStep2Continue = async () => {
    if (!selectedMemberId) {
      setStepError("Member not selected");
      return;
    }

    if (selectedSymptoms.length === 0) {
      setStepError("Please select at least one symptom");
      return;
    }

    setStepLoading(true);
    setStepError(null);

    try {
      // For self member, just proceed without API call
      if (selectedMemberId !== "self") {
        const payload = {
          memberId: selectedMemberId,
          symptoms: selectedSymptoms,
        };
        
        await consultationAPI.addSymptoms(payload);
      }
      
      setStep(3);
    } catch (err) {
      console.error("Failed to send symptoms:", err);
      setStepError(err?.response?.data?.message || "Failed to send symptoms");
    } finally {
      setStepLoading(false);
    }
  };

  // Step 3: Select specialty and proceed to payment
  const handleStep3Continue = async () => {
    if (!selectedSpecialty) {
      setStepError("Please select a specialty");
      return;
    }

    setStepLoading(true);
    setStepError(null);

    try {
      // If doctor is already selected (from query), use that
      if (selectedDoctor) {
        await handleConfirm();
      } else {
        // If no doctor selected, show specialty doctors
        if (specialtyDoctors.length === 0) {
          setStepError(`No doctors available for ${selectedSpecialty}. Please select another specialty.`);
          return;
        }
        
        // For demo, auto-select first doctor in specialty
        if (specialtyDoctors.length > 0) {
          setSelectedDoctor(specialtyDoctors[0]);
          await handleConfirm();
        }
      }
    } catch (err) {
      console.error("Error in step 3:", err);
      setStepError(err?.response?.data?.message || "Error proceeding to payment");
    } finally {
      setStepLoading(false);
    }
  };

  // Final confirmation and payment
  const handleConfirm = async () => {
    if (!selectedMemberId || selectedMemberId === "self") {
      setStepError("Please add a member first");
      return;
    }

    setStepLoading(true);
    setStepError(null);

    try {
      // 1. Select specialist (assign doctor based on specialty)
      const specPayload = {
        memberId: selectedMemberId,
        specialization: selectedSpecialty,
      };

      const specialistRes = await consultationAPI.selectSpecialist(specPayload);
      console.log(specialistRes);
      if (!specialistRes.data.success) {
        throw new Error(specialistRes.data.message || "Failed to assign specialist");
      }

      // 2. Create payment order
      const orderPayload = { memberId: selectedMemberId };
      const orderRes = await consultationAPI.createOrder(orderPayload);
      
      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || "Failed to create order");
      }

      const orderData = orderRes.data;

      // 3. Process payment if required
      if (orderData.rzpOrder && orderData.rzpOrder.id) {
        await openRazorpayAndVerify(orderData.rzpOrder, orderData.appointmentId);
      } else {
        // If no payment required, navigate to appointments
        navigate("/appointments", {
          state: {
            appointmentId: orderData.appointmentId,
            message: "Appointment booked successfully!",
            success: true
          }
        });
      }
    } catch (err) {
      console.error("Booking error:", err);
      setStepError(
        err.response?.data?.message || 
        err.message || 
        "Booking failed. Please try again."
      );
    } finally {
      setStepLoading(false);
    }
  };

  // Razorpay payment integration
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      if (document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']")) {
        // Script is loading, wait for it
        const checkInterval = setInterval(() => {
          if (window.Razorpay) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error("Timeout loading Razorpay"));
        }, 5000);
        return;
      }
      
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });
  };

  const openRazorpayAndVerify = async (rzpOrder, appointmentId) => {
    try {
      await loadRazorpayScript();
      
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      const options = {
        key: razorpayKey,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || "INR",
        name: "CareMitra",
        description: `Consultation - ${selectedSpecialty}`,
        order_id: rzpOrder.id,
        handler: async (response) => {
          try {
            const verifyPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              memberId: selectedMemberId,
            };
           console.log(verifyPayload);
           
            await paymentAPI.verifyPayment(verifyPayload);

            navigate("/appointments", {
              state: {
                appointmentId,
                paymentId: response.razorpay_payment_id,
                message: "Payment successful! Appointment confirmed.",
                success: true
              }
            });
          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            setStepError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: members.find(m => m.id === selectedMemberId)?.name || "",
          email: user?.email || "",
          contact: phone || "",
        },
        theme: {
          color: "#0ea5e9"
        },
        modal: {
          ondismiss: () => {
            setStepError("Payment cancelled. You can try again.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      setStepError("Payment gateway error. Please try again.");
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target) && 
          symptomInputRef.current && !symptomInputRef.current.contains(e.target)) {
        setInputFocused(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Progress bar classes
  const progressClasses = (i) => {
    if (i < step) return "bg-emerald-600";
    if (i === step) return "bg-emerald-400";
    return "bg-gray-300";
  };

  // Get selected member name
  const selectedMember = members.find(m => m.id === selectedMemberId);

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
                {step === 1 ? "Who are you consulting for?" : 
                 step === 2 ? "Tell us your symptoms" : 
                 "Select your specialty"}
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
              {/* Step 1: Select Member and Consultation Type */}
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
                            <div 
                              key={m.id} 
                              className={`p-3 rounded border cursor-pointer transition-colors ${
                                selectedMemberId === m.id 
                                  ? "border-sky-600 bg-sky-50" 
                                  : "border-gray-200 hover:border-sky-300 hover:bg-sky-50/50"
                              }`}
                              onClick={() => {
                                setSelectedMemberId(m.id);
                                setPhone(m.phone || "");
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold">{m.name}</div>
                                  <div className="text-xs text-gray-500">{m.age} • {m.gender}</div>
                                  {selectedMemberId === m.id && (
                                    <div className="text-xs text-sky-600 mt-1">✓ Currently selected</div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditMember(m);
                                    }} 
                                    className="text-xs text-sky-600 px-2 py-1 hover:bg-sky-100 rounded"
                                  >
                                    Edit
                                  </button>
                                  {m.id !== "self" && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeMember(m.id);
                                      }} 
                                      className="text-xs text-red-600 px-2 py-1 hover:bg-red-50 rounded"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {membersError && <div className="text-xs text-red-600">{membersError}</div>}
                          {members.length === 0 && !membersLoading && (
                            <div className="text-center py-4 text-gray-500">
                              No members found. Add a member to continue.
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="font-medium mb-3">{editingMember ? "Edit member" : "Add member"}</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-600 block mb-1">Full name</label>
                            <input 
                              value={formName} 
                              onChange={(e) => setFormName(e.target.value)} 
                              placeholder="e.g., Priya Sharma" 
                              className="border rounded px-3 py-2 w-full" 
                            />
                          </div>

                          <div className="flex gap-2">
                            <div className="w-1/3">
                              <label className="text-sm text-gray-600 block mb-1">Age</label>
                              <input 
                                value={formAge} 
                                onChange={(e) => setFormAge(e.target.value)} 
                                placeholder="e.g., 29" 
                                type="number"
                                className="border rounded px-3 py-2 w-full" 
                              />
                            </div>
                            <div className="w-2/3">
                              <label className="text-sm text-gray-600 block mb-1">Gender</label>
                              <select 
                                value={formGender} 
                                onChange={(e) => setFormGender(e.target.value)} 
                                className="border rounded px-3 py-2 w-full"
                              >
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm text-gray-600 block mb-1">Phone</label>
                            <input 
                              value={formPhone} 
                              onChange={(e) => setFormPhone(e.target.value)} 
                              placeholder="98xxxx1234" 
                              className="border rounded px-3 py-2 w-full" 
                            />
                          </div>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => { 
                                setIsEditingMember(false); 
                                setEditingMember(null); 
                              }} 
                              className="border rounded px-4 py-2"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={saveMember} 
                              className="bg-sky-600 text-white px-4 py-2 rounded"
                              disabled={stepLoading}
                            >
                              {stepLoading ? "Saving..." : editingMember ? "Update" : "Save"}
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
                      <input 
                        className="border rounded px-3 py-2 w-full mb-4" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="98xxxx1234" 
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 block mb-2">Consultation mode</label>
                      <div className="flex gap-2">
                        {CONSULTATION_TYPES.map((type) => (
                          <button 
                            key={type} 
                            onClick={() => setConsultationType(type)} 
                            className={`px-3 py-2 rounded border ${
                              consultationType === type ? "bg-sky-600 text-white" : "bg-gray-100"
                            }`}
                          >
                            {CONSULTATION_DISPLAY[type]}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {consultationType === "video" && "Face-to-face video call with doctor"}
                        {consultationType === "audio" && "Audio call with doctor"}
                        {consultationType === "chat" && "Text chat with doctor"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Symptoms */}
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
                                className={`text-left px-3 py-2 rounded text-sm ${
                                  sel ? "bg-sky-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                                }`}
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
                        <button 
                          key={s} 
                          onClick={() => toggleSymptom(s)} 
                          className={`px-3 py-1 rounded text-sm ${
                            selectedSymptoms.includes(s) ? "bg-sky-600 text-white" : "bg-gray-100"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">Selected symptoms</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map(s => (
                        <div key={s} className="px-2 py-1 bg-sky-50 text-sky-600 rounded flex items-center gap-2 text-sm">
                          {s}
                          <button onClick={() => toggleSymptom(s)} className="text-xs">✕</button>
                        </div>
                      ))}
                      {selectedSymptoms.length === 0 && (
                        <div className="text-xs text-gray-400">No symptoms selected yet</div>
                      )}
                    </div>
                  </div>

                  {stepError && <div className="text-xs text-red-600 mb-2">{stepError}</div>}
                </div>
              )}

              {/* Step 3: Specialty Selection */}
              {step === 3 && (
                <div>
                  <h3 className="font-medium mb-3">Select your specialty</h3>
                  
                  {selectedDoctor ? (
                    <div className="mb-4 p-3 bg-sky-50 rounded">
                      <p className="text-sm">
                        You've selected: <span className="font-semibold">{selectedDoctor.name}</span><br />
                        Specialty: <span className="font-semibold">{selectedDoctor.specialization}</span>
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-56 overflow-auto border rounded p-3 grid grid-cols-2 gap-2">
                        {SPECIALTIES.map(sp => (
                          <div 
                            key={sp} 
                            onClick={() => setSelectedSpecialty(sp)} 
                            className={`p-2 rounded cursor-pointer ${
                              selectedSpecialty === sp ? "bg-sky-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            {sp}
                          </div>
                        ))}
                      </div>

                      {selectedSpecialty && specialtyDoctors.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">
                            Available {selectedSpecialty} doctors:
                          </p>
                          <div className="space-y-2">
                            {specialtyDoctors.slice(0, 3).map(doctor => (
                              <div 
                                key={doctor._id}
                                className={`p-3 border rounded cursor-pointer ${
                                  selectedDoctor?._id === doctor._id 
                                    ? "border-sky-600 bg-sky-50" 
                                    : "border-gray-200 hover:bg-gray-50"
                                }`}
                                onClick={() => setSelectedDoctor(doctor)}
                              >
                                <div className="font-medium">{doctor.name}</div>
                                <div className="text-xs text-gray-500">
                                  Experience: {doctor.experience || "Not specified"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedSpecialty && specialtyDoctors.length === 0 && (
                        <div className="mt-4 text-sm text-yellow-600">
                          No doctors available for {selectedSpecialty}. Please select another specialty.
                        </div>
                      )}

                      <div className="mt-4 text-sm text-gray-500">
                        Not sure which specialty?{' '}
                        <button 
                          className="text-sky-600 underline" 
                          onClick={() => setSelectedSpecialty("General Physician")}
                        >
                          Consult a General Physician
                        </button>
                      </div>
                    </>
                  )}

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
                      if (step > 1) {
                        setStep(step - 1);
                      } else {
                        navigate(-1);
                      }
                    }}
                    className="mr-3 border rounded px-4 py-2"
                  >
                    Back
                  </button>

                  {selectedMember ? (
                    <>
                      Booking for <span className="font-medium">{selectedMember.name}</span> • 
                      {CONSULTATION_DISPLAY[consultationType]} •{' '}
                      <span className="font-medium">{selectedSpecialty || "Select specialty"}</span>
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
                        if (step === 1) handleStep1Continue();
                        else if (step === 2) handleStep2Continue();
                      }}
                      className="bg-sky-600 text-white px-4 py-2 rounded"
                      disabled={stepLoading}
                    >
                      {stepLoading ? "Please wait..." : "Continue"}
                    </button>
                  ) : (
                    <button
                      onClick={handleStep3Continue}
                      className="bg-sky-600 text-white px-4 py-2 rounded"
                      disabled={stepLoading || !selectedSpecialty}
                    >
                      {stepLoading ? "Processing..." : "Confirm & Proceed to Payment"}
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
                <DoctorCard 
                  doctor={selectedDoctor} 
                  onBook={() => {}} 
                  showBookButton={false}
                />
              ) : (
                <div className="bg-white rounded shadow p-6">
                  <div className="text-lg font-semibold mb-2">Select a doctor</div>
                  <div className="text-sm text-gray-500 mb-4">
                    {selectedSpecialty 
                      ? `Doctors available for ${selectedSpecialty}: ${specialtyDoctors.length}`
                      : "Choose a specialty to see available doctors"}
                  </div>
                  
                  {selectedSpecialty && specialtyDoctors.length > 0 && (
                    <div className="space-y-3">
                      {specialtyDoctors.slice(0, 2).map(doctor => (
                        <div 
                          key={doctor._id}
                          className="p-3 border rounded hover:border-sky-300 cursor-pointer"
                          onClick={() => setSelectedDoctor(doctor)}
                        >
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-xs text-gray-500">
                            {doctor.experience || "Experience not specified"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 bg-white rounded shadow p-4 text-sm text-gray-600">
                <div className="font-medium mb-2">What you get</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Doctor-signed digital prescription</li>
                  <li>Free follow-up for 3 days</li>
                  <li>100% confidential</li>
                  <li>Video/Audio/Chat consultation</li>
                  <li>Secure payment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}