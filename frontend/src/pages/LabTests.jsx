import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import LoadSpinner from '../components/LoadSpinner';
import LabTestOrderForm from '../components/forms/LabTestOrderForm';
import { labTestAPI } from '../utils/api';

export default function LabTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedTest, setSelectedTest] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => { fetchTests(); }, []);

  async function fetchTests() {
    setLoading(true); setError(null);
    try {
      const res = await labTestAPI.getAll();
      const fetched = res.data?.data;
      if (!fetched) throw new Error('Invalid response from server');
      setTests(fetched);
    } catch (err) {
      console.error('Error fetching lab tests', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tests');
    } finally { setLoading(false); }
  }

  const openOrder = (test) => {
    setSelectedTest(test);
    setShowOrderModal(true);
  };

  // Add this debugging function
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('No window object'));
      return;
    }
    
    if (window.Razorpay) {
      console.log("✅ Razorpay SDK already loaded");
      resolve(true);
      return;
    }
    
    console.log("📥 Loading Razorpay SDK from CDN...");
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log("✅ Razorpay SDK loaded successfully");
      console.log("Razorpay object:", window.Razorpay);
      resolve(true);
    };
    
    script.onerror = (error) => {
      console.error("❌ Razorpay SDK failed to load:", error);
      reject(new Error('Razorpay SDK failed to load'));
    };
    
    document.body.appendChild(script);
  });
}

async function openRazorpayCheckout(razorpayOrder, orderFromServer) {
  console.log("🎯 Opening Razorpay with order:", razorpayOrder);
  
  // Remove all mock handling - ALWAYS use real Razorpay
  // if (razorpayOrder.id.startsWith('order_mock_')) {
  //   console.log("🛠️ Development mode - simulating payment");
  //   // REMOVE THIS ENTIRE BLOCK
  // }
  
  // Load Razorpay script if not loaded
  if (!window.Razorpay) {
    console.log("📦 Loading Razorpay SDK...");
    await loadRazorpayScript();
  }
  
  return new Promise((resolve, reject) => {
    const options = {
      key: razorpayOrder.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || 'INR',
      order_id: razorpayOrder.id,
      name: 'CareMitra Lab Tests',
      description: `Lab Test: ${selectedTest?.name || 'Medical Test'}`,
      image: '/logo.png', // Add your logo
      handler: async function(response) {
        console.log("✅ Payment successful:", response);
        
        try {
          // Verify payment with backend
          const verifyRes = await labTestAPI.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
          
          console.log("Payment verified:", verifyRes.data);
          resolve(response);
          
        } catch (verifyError) {
          console.error("❌ Payment verification failed:", verifyError);
          reject(new Error("Payment verification failed"));
        }
      },
      prefill: {
        name: orderFromServer?.patientDetails?.name || 
              orderFromServer?.sampleCollectionDetails?.name || '',
        email: orderFromServer?.user?.email || 
               orderFromServer?.patientDetails?.email || '',
        contact: orderFromServer?.patientDetails?.phone || 
                 orderFromServer?.sampleCollectionDetails?.phone || ''
      },
      notes: {
        orderId: orderFromServer?._id,
        testName: selectedTest?.name
      },
      theme: {
        color: '#6366F1'
      },
      modal: {
        ondismiss: function() {
          console.log("❌ Payment modal closed");
          reject(new Error("Payment cancelled"));
        },
        escape: false, // Prevent closing with ESC key
        backdrop_close: false // Prevent closing by clicking outside
      }
    };
    
    console.log("🔄 Creating Razorpay instance with options:", options);
    
    try {
      const rzp = new window.Razorpay(options);
      
      // Handle payment failure
      rzp.on('payment.failed', function(response) {
        console.error("❌ Payment failed:", response.error);
        reject(new Error(`Payment failed: ${response.error.description}`));
      });
      
      // Add error event listener
      rzp.on('error', function(error) {
        console.error("❌ Razorpay error:", error);
        reject(new Error(`Razorpay error: ${error.description || error.message}`));
      });
      
      // Open payment gateway
      console.log("🚀 Opening Razorpay modal...");
      rzp.open();
      
    } catch (error) {
      console.error("❌ Failed to create Razorpay instance:", error);
      reject(new Error("Failed to initialize payment gateway"));
    }
  });
}

// Add this test function
// async function testRazorpayDirectly() {
//   console.log("🧪 Testing Razorpay directly...");
  
//   if (!window.Razorpay) {
//     await loadRazorpayScript();
//   }
  
//   const options = {
//     key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//     amount: 10000, // ₹100
//     currency: "INR",
//     name: "Test Payment",
//     description: "Test Transaction",
//     handler: function(response) {
//       alert("Payment successful: " + response.razorpay_payment_id);
//     },
//     prefill: {
//       name: "Test User",
//       email: "test@example.com",
//       contact: "9999999999"
//     },
//     theme: {
//       color: "#F37254"
//     }
//   };
  
//   console.log("Opening test Razorpay...");
//   const rzp = new window.Razorpay(options);
//   rzp.open();
// }

 async function handleFormSubmit(details, testIds, file) {
  try {
    setOrderLoading(true);
    
    // 1. Create FormData
    const fd = new FormData();
    fd.append("sampleCollectionDetails", JSON.stringify(details));
    fd.append("testIds", JSON.stringify(testIds));
    if (file) fd.append("prescription", file);
    
    console.log("📦 Creating order...");
    
    // 2. Create order in backend
    const orderRes = await labTestAPI.createOrder(fd);
    console.log("✅ Order created:", orderRes.data);
    
    if (orderRes.data.success && orderRes.data.data?.razorpayOrder) {
      const { razorpayOrder, order } = orderRes.data.data;
      
      console.log("💰 Opening payment gateway...", razorpayOrder);
      
      // 3. Open Razorpay payment gateway IMMEDIATELY
      await openRazorpayCheckout(razorpayOrder, order);
      
      // 4. Show success message (this runs AFTER payment is completed)
      alert("🎉 Payment successful! Order placed successfully.");
      setShowOrderModal(false);
      setSelectedTest(null);
      
    } else {
      throw new Error("Failed to create payment order");
    }
    
  } catch (error) {
    console.error("❌ Order/payment failed:", error);
    
    // Show appropriate error message
    if (error.message.includes("Payment cancelled") || 
        error.message.includes("payment.failed")) {
      alert("Payment was cancelled. Please try again.");
    } else if (error.response?.data?.message) {
      alert(`Error: ${error.response.data.message}`);
    } else {
      alert(error.message || "Failed to process order");
    }
    
  } finally {
    setOrderLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Lab Tests</h1>
          <p className="text-sm text-slate-600 mt-1">Choose tests and book a sample collection.</p>
        </header>

        <section>
          <div className="mb-6">
            {loading && <div className="flex items-center gap-2 text-sm text-slate-500"><LoadSpinner /> Loading tests...</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {!loading && tests.length === 0 ? (
              <div className="col-span-full text-center p-12 bg-white rounded-2xl shadow">No lab tests found.</div>
            ) : (
              tests.map(test => <TestCard key={test._id} test={test} onOrder={() => openOrder(test)} />)
            )}
          </div>
        </section>

        {showOrderModal && selectedTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Order: {selectedTest.name}</h3>
                  <div className="text-sm text-slate-500">{selectedTest.sampleType} • {selectedTest.duration}</div>
                </div>
                <button onClick={() => { setShowOrderModal(false); setSelectedTest(null); }} className="p-2 rounded hover:bg-slate-100"><X /></button>
              </div>

              <LabTestOrderForm
                selectedTest={selectedTest}
                initialValues={{
                  name: localStorage.getItem('user_name') || '',
                  phone: localStorage.getItem('user_phone') || '',
                }}
                onCancel={() => { setShowOrderModal(false); setSelectedTest(null); }}
                onSubmit={handleFormSubmit}
                loading={orderLoading}
              />
              
            </div>
          </div>
        )}
         {/* // Add this button somewhere in your JSX */}
{/* <button 
  onClick={testRazorpayDirectly}
  className="px-4 py-2 bg-green-600 text-white rounded-lg mt-4"
>
  🧪 Test Razorpay Directly
</button> */}
      </div>
    </div>
  );
}

function TestCard({ test, onOrder }) {
  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-md transition p-4 flex flex-col">
      <div className="relative rounded-lg overflow-hidden h-40">
        {test.image ? (
          <img src={test.image} alt={test.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">No image</div>
        )}
      </div>

      <div className="mt-3 flex-1">
        <h4 className="font-semibold text-lg">{test.name}</h4>
        <p className="text-sm text-slate-500 mt-1 line-clamp-3">{test.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">{test.sampleType}</div>
            <div className="text-base font-semibold">₹{test.finalPrice || test.price}</div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button onClick={onOrder} className="px-3 py-1 rounded-lg bg-indigo-600 text-white flex items-center gap-2"><Plus size={14} /> Book</button>
           
          </div>
        </div>
      </div>
    </div>
  );
}
