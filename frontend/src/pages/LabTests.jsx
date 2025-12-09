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

  useEffect(() => {
    fetchTests();
  }, []);

  async function fetchTests() {
    setLoading(true);
    setError(null);
    try {
      const res = await labTestAPI.getAll();
      const fetched = res.data?.data;
      if (!fetched) throw new Error('Invalid response from server');
      setTests(fetched);
    } catch (err) {
      console.error('Error fetching lab tests', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  }

  function openOrder(test) {
    setSelectedTest(test);
    setShowOrderModal(true);
  }

  function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('No window object'));
      if (window.Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
      document.body.appendChild(script);
    });
  }

  async function openRazorpayCheckout(razorpayOrder, orderFromServer) {
    if (!razorpayOrder || !razorpayOrder.id) throw new Error('Invalid razorpay order');

    const keyId = razorpayOrder.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!keyId) throw new Error('Razorpay key_id missing');

    await loadRazorpayScript();

    return new Promise((resolve, reject) => {
      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        order_id: razorpayOrder.id,
        name: 'CareMitra',
        description: `Payment for lab tests (Order: ${orderFromServer?._id || 'N/A'})`,
        handler: async (response) => {
          try {
            await labTestAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            resolve(response);
          } catch (err) {
            reject(err);
          }
        },
        prefill: {
          name: orderFromServer?.sampleCollectionDetails?.name || '',
          email: orderFromServer?.user?.email || '',
          contact: orderFromServer?.sampleCollectionDetails?.phone || ''
        },
        theme: { color: '#6366F1' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) { reject(resp); });
      rzp.open();
    });
  }

async function handleFormSubmit(details, testIds, file) {
  const fd = new FormData();
  fd.append("sampleCollectionDetails", JSON.stringify(details));
  fd.append("testIds", JSON.stringify(testIds));
  if (file) fd.append("prescription", file);

  try {
    const res = await labTestAPI.createOrder(fd);
    console.log("Order created:", res.data);
    
    // ✅ Add Razorpay payment flow after order creation
    if (res.data.data?.razorpayOrder) {
      await openRazorpayCheckout(res.data.data.razorpayOrder, res.data.data.order);
      // Payment success handling
      alert("Order placed successfully!");
      setShowOrderModal(false);
      setSelectedTest(null);
    }
  } catch (error) {
    console.error("Order creation failed:", error);
    alert(error.response?.data?.message || "Failed to create order");
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
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <LoadSpinner /> Loading tests...
              </div>
            )}
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

        {/* Order Modal */}
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
            <button onClick={onOrder} className="px-3 py-1 rounded-lg bg-indigo-600 text-white flex items-center gap-2">
              <Plus size={14} /> Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
