// src/pages/Doctors.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ConsultationHero from "../components/common/ConsultationHero";
import DoctorCard from "../components/user/DoctorCard";

const mockDoctors = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    specialty: "General Physician",
    experience: "15 years",
    consultationFee: 299,
    rating: 4.8,
    reviews: 234,
    availability: "Available Now",
    image: "https://via.placeholder.com/150",
    languages: ["English", "Hindi"],
    location: "New Delhi",
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialty: "Heart Specialist",
    experience: "12 years",
    consultationFee: 499,
    rating: 4.9,
    reviews: 456,
    availability: "Available in 2 hours",
    image: "https://via.placeholder.com/150",
    languages: ["English", "Hindi"],
    location: "Mumbai",
  },
  {
    id: 3,
    name: "Dr. Amit Patel",
    specialty: "Skin & Hair Specialist",
    experience: "10 years",
    consultationFee: 399,
    rating: 4.7,
    reviews: 189,
    availability: "Available Tomorrow",
    image: "https://via.placeholder.com/150",
    languages: ["English", "Gujarati"],
    location: "Ahmedabad",
  },
];

export default function Doctors() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  const filtered = useMemo(() => {
    return mockDoctors.filter((d) => {
      const matchesSpecialty = selectedSpecialty === "All" || d.specialty === selectedSpecialty;
      const matchesSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase());
      return matchesSpecialty && matchesSearch;
    });
  }, [search, selectedSpecialty]);

  // ⬅ NEW ROUTES
  const openBookingGeneral = () => {
    navigate("/consultation");
  };

  const openBookingForDoctor = (doctor) => {
    navigate(`/consultation?doctorId=${doctor.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "var(--nav-offset)" }}>
      {/* Hero */}
      <ConsultationHero
        startingPrice={199}
        onStart={openBookingGeneral}
        stats={{ consultations: "30L+", doctors: "3k+", cities: "22+" }}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctors by name or specialty..."
              className="border rounded px-3 py-2 w-full"
            />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64"
            >
              <option>All</option>
              {[...new Set(mockDoctors.map((d) => d.specialty))].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctors grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((d) => (
            <DoctorCard key={d.id} doctor={d} onBook={() => openBookingForDoctor(d)} />
          ))}
        </div>

        {/* Reviews */}
        <div className="mt-10 bg-white p-6 rounded shadow-sm">
          <h3 className="text-xl font-semibold mb-2">What patients say</h3>
          <p className="text-gray-600 mb-3">4.8 average rating • 1,656+ consultations</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border rounded">
              <div className="font-medium">Excellent consultation</div>
              <div className="text-xs text-gray-500 mt-1">
                "Doctor listened carefully and gave effective advice."
              </div>
            </div>
            <div className="p-3 border rounded">
              <div className="font-medium">Fast & Helpful</div>
              <div className="text-xs text-gray-500 mt-1">
                "Quick response and clear instructions. Highly recommended."
              </div>
            </div>
            <div className="p-3 border rounded">
              <div className="font-medium">Friendly & Professional</div>
              <div className="text-xs text-gray-500 mt-1">
                "Explained tests and next steps. Very professional."
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
