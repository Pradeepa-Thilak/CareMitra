// // src/pages/Appointment.jsx
// import React, { useState, useEffect } from "react";
// import BookAppointmentModal from "../components/modals/BookAppointmentModal";
// import { useAppointments } from "../contexts/AppointmentContext";
// import { doctorAPI } from "../utils/api";
// import { useAuth } from "../hooks/useAuth";

// const Appointment = () => {
//   const { bookAppointment } = useAppointments();
//   const { user } = useAuth();

//   const [selectedDoctor, setSelectedDoctor] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [message, setMessage] = useState("");
//   const [doctors, setDoctors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch doctors from backend
//   useEffect(() => {
//     const fetchDoctors = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Call your backend API to get all doctors
//         const response = await doctorAPI.getAllDoctors();

//         if (response.data.success) {
//           setDoctors(response.data.data || []);
//         } else {
//           setError(response.data.message || "Failed to load doctors");
//         }
//       } catch (err) {
//         console.error("Error fetching doctors:", err);
//         setError(err.response?.data?.message || "Failed to load doctors. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDoctors();
//   }, []);

//   const handleOpen = (doctor) => {
//     setSelectedDoctor(doctor);
//     setShowModal(true);
//   };

//   const handleClose = () => {
//     setSelectedDoctor(null);
//     setShowModal(false);
//   };

//   const handleConfirm = async (form) => {
//     try {
//       // Call your backend API to book appointment
//       const response = await doctorAPI.bookAppointment({
//         doctorId: selectedDoctor._id,
//         date: form.date,
//         time: form.time,
//         reason: form.reason,
//         consultationType: form.consultationType || "video" // Default to video if not specified
//       });

//       if (response.data.success) {
//         setMessage(`Appointment booked with ${selectedDoctor.name} on ${form.date} at ${form.time}`);

//         // Update local context if using
//         if (bookAppointment) {
//           bookAppointment({
//             doctor: selectedDoctor,
//             date: form.date,
//             time: form.time,
//             reason: form.reason,
//             status: "confirmed",
//             appointmentId: response.data.data?.appointmentId
//           });
//         }
//       } else {
//         setMessage(response.data.message || "Failed to book appointment");
//       }
//     } catch (err) {
//       console.error("Error booking appointment:", err);
//       setMessage(err.response?.data?.message || "Failed to book appointment. Please try again.");
//     }

//     setShowModal(false);

//     // auto-clear message after 5 seconds
//     setTimeout(() => setMessage(""), 5000);
//   };

//   // Calculate available slots based on doctor's schedule
//   const getAvailableSlots = (doctor) => {
//     // You can implement logic based on doctor's schedule
//     // For now, return default slots
//     return ["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"];
//   };

//   // Format doctor experience
//   const formatExperience = (experience) => {
//     if (!experience) return "Experience not specified";
//     return `${experience} years experience`;
//   };

//   return (
//     <div className="container-custom py-8">
//       <h1 className="text-2xl font-semibold mb-4">Book an Appointment</h1>

//       {message && (
//         <div className={`mb-4 p-3 rounded ${message.includes("Failed") ? "bg-red-50 border border-red-200 text-red-800" : "bg-green-50 border border-green-200 text-green-800"}`}>
//           {message}
//         </div>
//       )}

//       <p className="text-sm text-gray-600 mb-6">
//         {user ? `Welcome, ${user.name}! Choose a doctor and pick a suitable date & time.` : "Choose a doctor and pick a suitable date & time."}
//       </p>

//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
//         </div>
//       ) : error ? (
//         <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-4">
//           {error}
//           <button
//             onClick={() => window.location.reload()}
//             className="ml-2 text-sky-600 hover:text-sky-800"
//           >
//             Retry
//           </button>
//         </div>
//       ) : doctors.length === 0 ? (
//         <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
//           No doctors available at the moment. Please check back later.
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {doctors.map((doctor) => (
//             <div key={doctor._id} className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-300">
//               <div className="mb-4">
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex-1">
//                     <h3 className="font-bold text-lg text-gray-800">{doctor.name}</h3>
//                     <p className="text-sm text-gray-600 mt-1">{doctor.specialization || doctor.specialist || "General Physician"}</p>
//                   </div>
//                   {doctor.isActive && (
//                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                       Available
//                     </span>
//                   )}
//                 </div>

//                 {/* Doctor details */}
//                 <div className="space-y-2 text-sm text-gray-600">
//                   {doctor.hospital && (
//                     <div className="flex items-center">
//                       <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm3 1h6v4H7V5zm8 8v2h-2v-2h2zm-4 0v2h-2v-2h2z" clipRule="evenodd" />
//                       </svg>
//                       <span>{doctor.hospital}</span>
//                     </div>
//                   )}

//                   {doctor.experience && (
//                     <div className="flex items-center">
//                       <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
//                       </svg>
//                       <span>{formatExperience(doctor.experience)}</span>
//                     </div>
//                   )}

//                   {doctor.ratings && (
//                     <div className="flex items-center">
//                       <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                       </svg>
//                       <span>{doctor.ratings} ★</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <p className="text-sm font-medium text-gray-700 mb-2">Available slots:</p>
//                 <div className="flex flex-wrap gap-2">
//                   {getAvailableSlots(doctor).map((slot, index) => (
//                     <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
//                       {slot}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => handleOpen(doctor)}
//                   className="flex-1 px-4 py-2 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
//                 >
//                   Book Appointment
//                 </button>

//                 <button
//                   onClick={() => {
//                     // Navigate to doctor details page or show more info
//                     setMessage(`Viewing details for ${doctor.name}`);
//                   }}
//                   className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
//                 >
//                   Details
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {showModal && selectedDoctor && (
//         <BookAppointmentModal
//           doctor={selectedDoctor}
//           onClose={handleClose}
//           onConfirm={handleConfirm}
//           availableSlots={getAvailableSlots(selectedDoctor)}
//         />
//       )}

//       {/* Statistics */}
//       {doctors.length > 0 && (
//         <div className="mt-8 p-6 bg-gray-50 rounded-lg">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctor Statistics</h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="bg-white p-4 rounded shadow-sm">
//               <p className="text-sm text-gray-600">Total Doctors</p>
//               <p className="text-2xl font-bold text-sky-600">{doctors.length}</p>
//             </div>
//             <div className="bg-white p-4 rounded shadow-sm">
//               <p className="text-sm text-gray-600">Available Now</p>
//               <p className="text-2xl font-bold text-green-600">
//                 {doctors.filter(d => d.isActive).length}
//               </p>
//             </div>
//             <div className="bg-white p-4 rounded shadow-sm">
//               <p className="text-sm text-gray-600">Specialties</p>
//               <p className="text-2xl font-bold text-purple-600">
//                 {new Set(doctors.map(d => d.specialization || d.specialist)).size}
//               </p>
//             </div>
//             <div className="bg-white p-4 rounded shadow-sm">
//               <p className="text-sm text-gray-600">Avg. Rating</p>
//               <p className="text-2xl font-bold text-yellow-600">
//                 {doctors.filter(d => d.ratings).length > 0
//                   ? (doctors.reduce((sum, d) => sum + (d.ratings || 0), 0) / doctors.filter(d => d.ratings).length).toFixed(1)
//                   : "N/A"
//                 } ★
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Appointment;

import { useState, useEffect } from 'react';
import { FileText, Stethoscope, AlertCircle } from 'lucide-react';
import axios from 'axios';

const OrderTabs = () => {
  const [activeTab, setActiveTab] = useState('labtest');
  const [labOrders, setLabOrders] = useState([]);
  const [consultingOrders, setConsultingOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('authToken');

  // Fetch Lab Test Orders
  const fetchLabOrders = async () => {
    setLoading(true);
    setError(null);
    
    console.log('Token:', token); // Debug log
    console.log('Fetching from:', 'http://localhost:5001/dashboard/labOrder'); // Debug log
    
    try {
      const response = await axios.get('http://localhost:5001/dashboard/labOrder', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Lab Orders Response:', response.data);

      if (response.data?.success && response.data?.data) {
        const orders = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        setLabOrders(orders);
      } else if (Array.isArray(response.data)) {
       
        setLabOrders(response.data);
      } else if (response.data && typeof response.data === 'object') {
        
        setLabOrders([response.data]);
      } else {
        setLabOrders([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch lab orders');
      console.error('Error fetching lab orders:', err);
      setLabOrders([]); 
    } finally {
      setLoading(false);
    }
  };

  // Fetch Consulting Orders
  const fetchConsultingOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5001/dashboard/consult', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Consulting Orders Response:', response.data); 

      
      if (response.data?.success && response.data?.data) {
        
        const orders = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        setConsultingOrders(orders);
      } else if (Array.isArray(response.data)) {
        
        setConsultingOrders(response.data);
      } else if (response.data && typeof response.data === 'object') {
        setConsultingOrders([response.data]);
      } else {
        setConsultingOrders([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch consulting orders');
      console.error('Error fetching consulting orders:', err);
      setConsultingOrders([]); 
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    if (activeTab === 'labtest') {
      fetchLabOrders();
    } else if (activeTab === 'consulting') {
      fetchConsultingOrders();
    }
  }, [activeTab]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

 
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })} • ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  };

 
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: 'bg-green-100 text-green-800',
      confirmed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    
    const normalizedStatus = status?.toLowerCase() || 'pending';
    const colorClass = statusConfig[normalizedStatus] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
        {status || 'Pending'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('labtest')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
            activeTab === 'labtest'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-5 h-5" />
          Lab Test Orders
        </button>
        <button
          onClick={() => setActiveTab('consulting')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
            activeTab === 'consulting'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Stethoscope className="w-5 h-5" />
          Consulting Orders
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Tab Content */}
      {!loading && (
        <div>
          {activeTab === 'labtest' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Lab Test Orders</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Test Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {labOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No lab test orders found
                        </td>
                      </tr>
                    ) : (
                      labOrders.map((order, index) => (
                        <tr key={order._id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index+1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.tests[index].name || order.test || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.sampleCollectionDetails?.name || order.patient || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.updateAt || order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{order.totalAmount?.toFixed(2) || order.price?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'consulting' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Consulting Orders</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Doctor Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consultingOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No consulting orders found
                        </td>
                      </tr>
                    ) : (
                      consultingOrders.map((order, index) => (
                        <tr key={order._id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.orderId || `#CO${String(index + 1).padStart(3, '0')}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.doctorName || order.doctor || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.patientName || order.patient || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(order.appointmentDate || order.date || order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{order.amount?.toFixed(2) || order.fee?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderTabs;