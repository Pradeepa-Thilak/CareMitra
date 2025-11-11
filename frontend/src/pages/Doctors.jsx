import React, { useState } from 'react';
import { Star, MapPin, Video, MessageCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Doctors = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const specialties = ['All', 'General Practitioner', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic'];

  const mockDoctors = [
    {
      id: 1,
      name: 'Dr. Rajesh Kumar',
      specialty: 'General Practitioner',
      rating: 4.8,
      reviews: 234,
      experience: '15 years',
      consultationFee: 299,
      availability: 'Available Now',
      image: 'https://via.placeholder.com/150x150?text=Doctor1',
      languages: ['English', 'Hindi'],
      location: 'New Delhi',
    },
    {
      id: 2,
      name: 'Dr. Priya Sharma',
      specialty: 'Cardiologist',
      rating: 4.9,
      reviews: 456,
      experience: '12 years',
      consultationFee: 499,
      availability: 'Available in 2 hours',
      image: 'https://via.placeholder.com/150x150?text=Doctor2',
      languages: ['English', 'Hindi'],
      location: 'Mumbai',
    },
    {
      id: 3,
      name: 'Dr. Amit Patel',
      specialty: 'Dermatologist',
      rating: 4.7,
      reviews: 189,
      experience: '10 years',
      consultationFee: 399,
      availability: 'Available Tomorrow',
      image: 'https://via.placeholder.com/150x150?text=Doctor3',
      languages: ['English', 'Gujarati'],
      location: 'Ahmedabad',
    },
    {
      id: 4,
      name: 'Dr. Neha Singh',
      specialty: 'Pediatrician',
      rating: 4.6,
      reviews: 312,
      experience: '8 years',
      consultationFee: 349,
      availability: 'Available Now',
      image: 'https://via.placeholder.com/150x150?text=Doctor4',
      languages: ['English', 'Hindi'],
      location: 'Bangalore',
    },
    {
      id: 5,
      name: 'Dr. Vikram Reddy',
      specialty: 'Orthopedic',
      rating: 4.8,
      reviews: 267,
      experience: '14 years',
      consultationFee: 449,
      availability: 'Available in 1 hour',
      image: 'https://via.placeholder.com/150x150?text=Doctor5',
      languages: ['English', 'Telugu'],
      location: 'Hyderabad',
    },
    {
      id: 6,
      name: 'Dr. Anjali Verma',
      specialty: 'General Practitioner',
      rating: 4.5,
      reviews: 198,
      experience: '9 years',
      consultationFee: 279,
      availability: 'Available Now',
      image: 'https://via.placeholder.com/150x150?text=Doctor6',
      languages: ['English', 'Hindi', 'Punjabi'],
      location: 'Chandigarh',
    },
  ];

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  const handleBookConsultation = (doctorId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/consultation/book/${doctorId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Consult Doctors</h1>

        {/* Search and Filter */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search doctors by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Specialty Filter */}
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedSpecialty === specialty
                    ? 'bg-primary text-white'
                    : 'bg-light text-dark hover:bg-gray-300'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="card hover:shadow-lg transition overflow-hidden">
                {/* Doctor Info */}
                <div className="p-6">
                  <div className="flex gap-4 mb-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-dark">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      <p className="text-xs text-gray-500">{doctor.experience} experience</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(doctor.rating)
                              ? 'fill-warning text-warning'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{doctor.rating}</span>
                    <span className="text-xs text-gray-500">({doctor.reviews} reviews)</span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 pb-4 border-b text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{doctor.availability}</span>
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium text-primary">₹{doctor.consultationFee}</span>
                      <span className="text-gray-500"> per consultation</span>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Languages</p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.languages.map((lang) => (
                        <span
                          key={lang}
                          className="bg-blue-50 text-primary text-xs px-2 py-1 rounded"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBookConsultation(doctor.id)}
                      className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Video Call
                    </button>
                    <button className="btn-outline flex-1 py-2 text-sm flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No doctors found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('All');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
