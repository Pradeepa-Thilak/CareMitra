// src/pages/BookConsultation.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import DoctorCard from "../components/user/DoctorCard";
import { useAuth } from "../hooks/useAuth";
import { memberAPI, consultationAPI, paymentAPI } from "../utils/api";

const SPECIALTIES = [
  "General Physician","Cardiology","Gynaecologist","Skin & Hair Specialist","Bone & Joint Specialist","Chest Physician",
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
 // load members from backend on mount
useEffect(() => {
  let mounted = true;
  async function loadMembers() {
    setMembersLoading(true);
    try {
      const res = await memberAPI.getMembers();
      console.log("DEBUG - Get Members Response:", res.data);

      // adapt: server could return [] or { members: [...] }
      let list = Array.isArray(res.data) ? res.data : res.data.members ?? [];

      // If list is still empty, check other possible structures
      if (list.length === 0 && res.data && typeof res.data === 'object') {
        // Try to find an array in the response
        Object.keys(res.data).forEach(key => {
          if (Array.isArray(res.data[key])) {
            list = res.data[key];
          }
        });
      }

      console.log("DEBUG - Extracted list:", list);

      // Transform each member to ensure they have proper IDs
      const transformedList = list.map((member, index) => {
        // Extract ID from multiple possible field names
        const memberId = member.id || member.memberId || member._id || member.userId ||
                        `member_${Date.now()}_${index}`;

        return {
          id: memberId,
          name: member.name || member.fullName || member.patientName || `Member ${index + 1}`,
          age: member.age || member.patientAge || 0,
          gender: member.gender || member.sex || "Other",
          phone: member.phone || member.phoneNumber || member.contact || "",
          // Store original for debugging
          _original: member
        };
      });

      console.log("DEBUG - Transformed members:", transformedList);

      if (mounted && transformedList.length) {
        setMembers(transformedList);
        setSelectedMemberId(transformedList[0]?.id || null);
      }
    } catch (err) {
      console.warn("Could not fetch members, continuing with local copy", err?.message || err);
      console.error("Error details:", err.response?.data);
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
    if (editingMember) {
      // ============================================
      // DEBUG: Check what ID we have
      // ============================================
      console.log("DEBUG - Editing Member ID:", editingMember.id);
      console.log("DEBUG - Editing Member Object:", editingMember);

      // Make sure we have a valid ID before calling API
      if (!editingMember.id || editingMember.id === "m_you" || editingMember.id.startsWith('temp_')) {
        console.log("DEBUG - Invalid or temporary ID detected, treating as ADD instead of EDIT");
        // Fall back to adding as new member
        const res = await memberAPI.addMember(payload);
        console.log("DEBUG - Add Member Response:", res.data);

        // Extract the saved member from response
        const saved = res.data?.member || res.data?.data || res.data;

        // Try to get ID from multiple possible field names
        const newId = saved?.id || saved?.memberId || saved?._id || saved?.userId ||
                     `member_${Date.now()}`;

        const newMember = {
          id: newId,
          name: saved?.name || formName,
          age: saved?.age || Number(formAge),
          gender: saved?.gender || formGender,
          phone: saved?.phone || formPhone,
        };

        // Replace the temporary member with the real one from backend
        setMembers((prev) =>
          prev.map(m => m.id === editingMember.id ? newMember : m)
        );
        setSelectedMemberId(newId);
      } else {
        // We have a valid ID, proceed with edit
        const res = await memberAPI.editMember(editingMember.id, payload);
        console.log("DEBUG - Edit Member Response:", res.data);

        const saved = res.data?.member || res.data?.data || res.data;

        setMembers((prev) =>
          prev.map(m => m.id === editingMember.id ? {
            ...m,
            ...saved,
            // Ensure we keep the ID
            id: editingMember.id
          } : m)
        );

        if (selectedMemberId === editingMember.id) {
          setSelectedMemberId(editingMember.id);
        }
      }
    } else {
      // Add new member
      const res = await memberAPI.addMember(payload);
      console.log("DEBUG - Add Member Response:", res.data);

      const saved = res.data?.member || res.data?.data || res.data;

      // ============================================
      // CRITICAL: Extract ID from multiple possible fields
      // ============================================
      const newId = saved?.id || saved?.memberId || saved?._id || saved?.userId ||
                   `member_${Date.now()}`;

      console.log("DEBUG - Extracted ID:", newId);
      console.log("DEBUG - Full saved object:", saved);

      const newMember = {
        id: newId,
        name: saved?.name || formName,
        age: saved?.age || Number(formAge),
        gender: saved?.gender || formGender,
        phone: saved?.phone || formPhone,
      };

      setMembers((prev) => [...prev, newMember]);
      setSelectedMemberId(newId);
    }

    setIsEditingMember(false);
    setEditingMember(null);
  } catch (err) {
    console.error("Failed to save member:", err);
    console.error("Error response data:", err.response?.data);
    setStepError(err?.response?.data?.message || err.message || "Failed to save member");
  } finally {
    setStepLoading(false);
  }
}

  async function removeMember(id) {
  if (!window.confirm("Are you sure you want to remove this member?")) return;

  setStepLoading(true);
  try {
    // Only call API if it's not a temporary ID
    if (!id.startsWith('temp_') && id !== "m_you") {
      await memberAPI.deleteMember(id);
    }

    const filtered = members.filter((m) => m.id !== id);
    setMembers(filtered);

    if (selectedMemberId === id) {
      setSelectedMemberId(filtered[0]?.id || null);
    }

    if (filtered.length === 0) {
      // Add a default member
      const defaultMember = {
        id: `temp_${Date.now()}`,
        name: user?.name ? `${user.name}` : "You",
        age: 28,
        gender: "Female",
        phone: ""
      };
      setMembers([defaultMember]);
      setSelectedMemberId(defaultMember.id);
    }
  } catch (err) {
    console.error("Failed to delete member:", err);
    setStepError(err?.response?.data?.message || err.message || "Failed to delete member");
  } finally {
    setStepLoading(false);
  }
}

  async function handleStep1Continue() {
    setStepLoading(true);
    setStepError(null);

    try {
      // local persistence already handled by useEffect/local state
      // call backend to save consultingType (mode) for the selected member
      if (!selectedMemberId) throw new Error("Select a member first");

      const payload = { consultingType: mode }; // backend expects consultingType in body
      console.log(payload, typeof(payload.consultingType));
      await memberAPI.addMode(selectedMemberId, payload.consultingType.toLowerCase());

      // advance UI
      setStep(2);
    } catch (err) {
      console.error("Failed to save consulting mode:", err);
      setStepError(err?.response?.data?.message || err.message || "Could not save mode");
    } finally {
      setStepLoading(false);
    }
  }

  // Step transitions integrated with backend
  async function handleStep2Continue() {
    setStepLoading(true);
    setStepError(null);
    try {
      if (!selectedMemberId) throw new Error("Member not selected");
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
// async function handleConfirm() {
//   setStepLoading(true);
//   setStepError(null);

//   try {
//     // 1️⃣ First select specialist
//     const specRes = await consultationAPI.selectSpecialist({
//       memberId: selectedMemberId,
//       specialization: selectedSpecialty,
//     });

//     console.log("Specialist selected:", specRes.data);

//     // 2️⃣ Now create Razorpay order
//     const orderRes = await consultationAPI.createOrder({
//       memberId: selectedMemberId
//     });

//     const orderData = orderRes.data;
//     console.log("Order created:", orderData);

//     // -------------------------
//     // 🟢 CASE 1: Success + Payment Required
//     // -------------------------
//     if (
//       orderData.success &&
//       orderData.payment &&                      // backend returns payment details
//       orderData.rzpOrder &&
//       orderData.rzpOrder.id                    // Valid Razorpay order ID
//     ) {
//       console.log("Opening Razorpay...");

//       await openRazorpayAndVerify(
//         orderData.rzpOrder,
//         orderData.appointmentId
//       );

//       return;
//     }

//     // -------------------------
//     // 🟢 CASE 2: No payment required (free consultation)
//     // -------------------------
//     if (orderData.success && !orderData.payment) {
//       console.log("Free consultation - skipping payment");

//       return navigate("/appointments", {
//         state: {
//           appointmentId: orderData.appointmentId,
//           message: "Appointment booked successfully!"
//         }
//       });
//     }

//     // -------------------------
//     // 🔴 CASE 3: Payment details missing - error
//     // -------------------------
//     console.error("Invalid backend response:", orderData);
//     setStepError("Payment setup failed. Please try again or contact support.");

//   } catch (err) {
//     console.error("Failed to complete booking:", err);
//     console.error("Error details:", err.response?.data);

//     setStepError(
//       err.response?.data?.message ||
//       err.message ||
//       "Failed to complete booking. Please try again."
//     );
//   } finally {
//     setStepLoading(false);
//   }
// }

// async function handleConfirm() {
//   setStepLoading(true);
//   setStepError(null);

//   try {
//     // 1️⃣ Select specialist
//     const specPayload = {
//       memberId: selectedMemberId,
//       specialization: selectedSpecialty,
//     };

//     const specRes = await consultationAPI.selectSpecialist(specPayload);
//     const specData = specRes.data;

//     console.log("Specialist selected:", specData);

//     // 2️⃣ Create Razorpay order (or free consultation info)
//     const orderPayload = { memberId: selectedMemberId };
//     const orderRes = await consultationAPI.createOrder(orderPayload);
//     const orderData = orderRes.data;

//     console.log("Order response:", orderData);

//     // 3️⃣ Handle payment flow
//     if (orderData.paymentDetails && orderData.paymentDetails.razorpayOrderId)
// {
//       // Paid consultation: open Razorpay
//       await openRazorpayAndVerify(orderData.paymentDetails.razorpayOrderId , orderData.appointmentId);
//     } else {
//       // Free consultation: skip payment
//       console.log("Free consultation, skipping payment");

//       navigate("/appointments", {
//         state: {
//           appointmentId: orderData.appointmentId,
//           message: orderData.message || "Appointment booked successfully!",
//           success: true
//         }
//       });
//     }
//   } catch (err) {
//     console.error("Failed to complete booking:", err);
//     console.error("Error details:", err.response?.data);

//     if (err.response?.data?.message) {
//       setStepError(`Error: ${err.response.data.message}`);
//     } else {
//       setStepError(err?.message || "Failed to complete booking. Please try again.");
//     }
//   } finally {
//     setStepLoading(false);
//   }
// }
async function handleConfirm() {
  setStepLoading(true);
  setStepError(null);

  try {
    const specPayload = {
      memberId: selectedMemberId,
      specialization: selectedSpecialty,
    };

    await consultationAPI.selectSpecialist(specPayload);

    const orderPayload = { memberId: selectedMemberId };
    const orderRes = await consultationAPI.createOrder(orderPayload);
    const orderData = orderRes.data;

    console.log("Order Data:", orderData);

    // Condition FIXED
    if (orderData.paymentDetails?.razorpayOrderId) {
      await openRazorpayAndVerify(orderData.rzpOrder, orderData.appointmentId);
    } else {
      navigate("/appointments", {
        state: {
          appointmentId: orderData.appointmentId,
          message: "Appointment booked successfully!",
          success: true
        }
      });
    }
  } catch (err) {
    console.log("Booking error:", err);
    setStepError(err?.response?.data?.message || "Booking failed");
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
// async function openRazorpayAndVerify(rzpOrder, appointmentId = null) {
//   console.log("Opening Razorpay with order:", rzpOrder);

//   // Validate Razorpay order structure
//   if (!rzpOrder || !rzpOrder.id) {
//     setStepError("Invalid payment order. Please try again.");
//     console.error("Invalid rzpOrder:", rzpOrder);
//     return;
//   }

//   // Test order protection
//   // if (typeof rzpOrder.id === "string" && rzpOrder.id.includes("order")) {
//   //   setStepError("Test payment order detected. Please contact support.");
//   //   console.error("Test order ID detected:", rzpOrder.id);
//   //   return;
//   // }

//   // Load razorpay script
//   try {
//     await loadRazorpayScript();
//   } catch (err) {
//     setStepError("Could not load payment gateway. Please try again.");
//     return;
//   }

//   return new Promise((resolve, reject) => {
//     const razorpayKey =
//       window.__RAZORPAY_KEY__ ||
//       import.meta.env.VITE_RAZORPAY_KEY_ID ||
//       process.env.REACT_APP_RAZORPAY_KEY_ID;

//     if (!razorpayKey) {
//       setStepError("Payment gateway not configured.");
//       return reject("Missing Razorpay key");
//     }

//     // Fallback for amount & currency
//     const finalAmount = rzpOrder.amount || rzpOrder.amount_due;
//     const finalCurrency = rzpOrder.currency || "INR";

//     const member = members?.find((m) => m._id === selectedMemberId);

//     const options = {
//       key: razorpayKey,
//       amount: finalAmount,
//       currency: finalCurrency,
//       name: "CareMitra",
//       description: selectedSpecialty
//         ? `Consultation - ${selectedSpecialty}`
//         : "Consultation",
//       order_id: rzpOrder.id,
//       image: "/logo.png",
//       prefill: {
//         name: member?.name || user?.name || "User",
//         email: user?.email || "",
//         contact: member?.phone || phone || ""
//       },
//       notes: {
//         appointmentId,
//         memberId: selectedMemberId,
//         specialty: selectedSpecialty || "",
//         doctorId: selectedDoctor?._id || "",
//         mode
//       },
//       theme: { color: "#0ea5e9" },

//       handler: async (response) => {
//         try {
//           const verifyPayload = {
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_signature: response.razorpay_signature,
//             appointmentId,
//             memberId: selectedMemberId,
//             specialty: selectedSpecialty,
//             doctorId: selectedDoctor?._id || null,
//           };

//           const verifyRes = await paymentAPI.verifyPayment(verifyPayload);

//           navigate("/appointments", {
//             state: {
//               appointmentId,
//               paymentId: response.razorpay_payment_id,
//               message: "Payment successful! Appointment booked.",
//               success: true
//             }
//           });

//           resolve(verifyRes.data);
//         } catch (err) {
//           console.error("Verification failed:", err);

//           setStepError("Payment verification failed. Contact support.");

//           navigate("/appointments", {
//             state: {
//               appointmentId,
//               message:
//                 "Payment completed but verification pending. Please check your appointments.",
//               warning: true
//             }
//           });

//           reject(err);
//         }
//       },

//       modal: {
//         ondismiss: () => {
//           setStepError("Payment cancelled. You can try again.");
//           reject("cancelled");
//         }
//       }
//     };

//     try {
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       setStepError("Unable to initialize payment.");
//       reject(error);
//     }
//   });
// }

async function openRazorpayAndVerify(rzpOrder, appointmentId) {
  if (!rzpOrder?.id) {
    setStepError("Invalid payment order");
    return;
  }

  // Load script
  await loadRazorpayScript();

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

  return new Promise((resolve, reject) => {

    const options = {
      key: razorpayKey,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      name: "CareMitra",
      description: `Consultation - ${selectedSpecialty}`,
      order_id: rzpOrder.id,

      handler: async (response) => {
        try {
          const verifyPayload = {
            razorpay_payment_id: response.razorpay_payment_id || response.razorpay_paymentId,
            razorpay_order_id: response.razorpay_order_id || response.razorpay_orderId,
            razorpay_signature: response.razorpay_signature,
            appointmentId,
            memberId: selectedMemberId,
            specialty: selectedSpecialty,
            doctorId: selectedDoctor?._id || null
          };

          const verifyRes = await paymentAPI.verifyPayment(verifyPayload);

          navigate("/appointments", {
            state: {
              appointmentId,
              paymentId: verifyPayload.razorpay_payment_id,
              message: "Payment successful! Appointment confirmed.",
              success: true
            }
          });

          resolve(verifyRes.data);

        } catch (err) {
          setStepError("Payment verification failed");
          reject(err);
        }
      },

      modal: {
        ondismiss: () => {
          setStepError("Payment cancelled");
          reject("cancelled");
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
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeMember(m.id);
                                    }} 
                                    className="text-xs text-red-600 px-2 py-1 hover:bg-red-50 rounded"
                                  >
                                    Remove
                                  </button>
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
                        if (step === 1) handleStep1Continue();
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
                  {/* Add this somewhere in your JSX for testing */}
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-sm font-medium text-yellow-800 mb-2">Development Test</div>
                  <button
                    onClick={async () => {
                      console.log("Testing payment flow...");
                      // Simulate a successful payment response
                      const testRzpOrder = {
                        id: "order_test_123",
                        amount: 29900, // 299 INR in paise
                        currency: "INR",
                        receipt: "receipt_test_123"
                      };
                      await openRazorpayAndVerify(testRzpOrder, "test_appointment_123");
                    }}
                    className="text-xs bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Test Payment Gateway
                  </button>
                </div>
              
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