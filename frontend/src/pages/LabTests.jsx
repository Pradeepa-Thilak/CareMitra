import React, { useState, useEffect } from 'react';
import { Plus, X, Clock, TestTube, Users, Award, CheckCircle } from 'lucide-react';
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

  // Featured section state
  const [featuredTab, setFeaturedTab] = useState('tests');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);

  useEffect(() => {
    fetchTests();
    fetchPackages();
  }, []);

  async function fetchPackages() {
    try {
      setPackagesLoading(true);
      const res = await labTestAPI.getFeaturedPackages();
      setPackages(res.data.data);
    } catch (err) {
      console.error("Failed to fetch packages");
    } finally {
      setPackagesLoading(false);
    }
  }

  async function fetchTests() {
    setLoading(true);
    setError(null);
    try {
      const res = await labTestAPI.getAll();
      const fetched = res.data?.data;
      if (!fetched) throw new Error('Invalid response from server');
      setTests(fetched);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  }

  const openOrder = (test) => {
    setSelectedTest(test);
    setShowOrderModal(true);
  };

  const openDetailModal = (item) => {
    setSelectedDetail(item);
    setShowDetailModal(true);
  };

  // Convert test data to detail modal format
  const convertTestToDetailFormat = (test) => {
    return {
      id: test._id,
      name: test.name,
      description: test.description,
      price: test.finalPrice || test.price,
      originalPrice: test.price !== test.finalPrice ? test.price : null,
      discount: test.discount || null,
      testsCount: 1,
      icon: '🧪',
      color: 'from-blue-100 to-purple-100',
      sampleType: test.sampleType || 'Blood',
      duration: test.duration || '12 hours',
      bookedRecently: '10,000+ booked recently',
      reportTime: test.duration || '12 hours',
      fasting: test.fasting || 'No special preparation required',
      conductedBy: 'CareMitra Labs',
      conductedByLogo: '🏥',
      highlights: [
        'Accredited labs',
        'Skilled Phlebos',
        'Verified reports'
      ],
      isActualTest: true,
      actualTestData: test
    };
  };

  const handlePackageBooking = async (packageItem, collectionDetails, file) => {
    try {
      setOrderLoading(true);
      const fd = new FormData();
      fd.append("sampleCollectionDetails", JSON.stringify(collectionDetails));
      fd.append("packageId", packageItem.id || packageItem._id);
      if (file) fd.append("prescription", file);

      const orderRes = await labTestAPI.createPackageOrder(fd);
      
      if (orderRes.data.success && orderRes.data.data?.razorpayOrder) {
        const { razorpayOrder, order } = orderRes.data.data;
        await openRazorpayCheckoutForPackage(razorpayOrder, order, packageItem);
        alert("🎉 Payment successful! Package order placed successfully.");
        setShowDetailModal(false);
        setSelectedDetail(null);
      } else {
        throw new Error("Failed to create payment order");
      }
    } catch (error) {
      if (error.message.includes("Payment cancelled") || error.message.includes("payment.failed")) {
        alert("Payment was cancelled. Please try again.");
      } else if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert(error.message || "Failed to process package order");
      }
    } finally {
      setOrderLoading(false);
    }
  };

  function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('No window object'));
        return;
      }
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = (error) => {
        reject(new Error('Razorpay SDK failed to load'));
      };
      document.body.appendChild(script);
    });
  }

  async function openRazorpayCheckout(razorpayOrder, orderFromServer) {
    if (!window.Razorpay) {
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
        image: '/logo.png',
        handler: async function(response) {
          try {
            const verifyRes = await labTestAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            resolve(response);
          } catch (verifyError) {
            reject(new Error("Payment verification failed"));
          }
        },
        prefill: {
          name: orderFromServer?.patientDetails?.name || orderFromServer?.sampleCollectionDetails?.name || '',
          email: orderFromServer?.user?.email || orderFromServer?.patientDetails?.email || '',
          contact: orderFromServer?.patientDetails?.phone || orderFromServer?.sampleCollectionDetails?.phone || ''
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
            reject(new Error("Payment cancelled"));
          },
          escape: false,
          backdrop_close: false
        }
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function(response) {
          reject(new Error(`Payment failed: ${response.error.description}`));
        });
        rzp.on('error', function(error) {
          reject(new Error(`Razorpay error: ${error.description || error.message}`));
        });
        rzp.open();
      } catch (error) {
        reject(new Error("Failed to initialize payment gateway"));
      }
    });
  }

  async function openRazorpayCheckoutForPackage(razorpayOrder, orderFromServer, packageItem) {
    if (!window.Razorpay) {
      await loadRazorpayScript();
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: razorpayOrder.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        order_id: razorpayOrder.id,
        name: 'CareMitra Lab Tests',
        description: `Health Package: ${packageItem?.name || 'Health Checkup'}`,
        image: '/logo.png',
        handler: async function(response) {
          try {
            const verifyRes = await labTestAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            resolve(response);
          } catch (verifyError) {
            reject(new Error("Payment verification failed"));
          }
        },
        prefill: {
          name: orderFromServer?.patientDetails?.name || orderFromServer?.sampleCollectionDetails?.name || '',
          email: orderFromServer?.user?.email || orderFromServer?.patientDetails?.email || '',
          contact: orderFromServer?.patientDetails?.phone || orderFromServer?.sampleCollectionDetails?.phone || ''
        },
        notes: {
          orderId: orderFromServer?._id,
          packageName: packageItem?.name
        },
        theme: {
          color: '#6366F1'
        },
        modal: {
          ondismiss: function() {
            reject(new Error("Payment cancelled"));
          },
          escape: false,
          backdrop_close: false
        }
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function(response) {
          reject(new Error(`Payment failed: ${response.error.description}`));
        });
        rzp.on('error', function(error) {
          reject(new Error(`Razorpay error: ${error.description || error.message}`));
        });
        rzp.open();
      } catch (error) {
        reject(new Error("Failed to initialize payment gateway"));
      }
    });
  }

  async function handleFormSubmit(details, testIds, file) {
    try {
      setOrderLoading(true);
      const fd = new FormData();
      fd.append("sampleCollectionDetails", JSON.stringify(details));
      fd.append("testIds", JSON.stringify(testIds));
      if (file) fd.append("prescription", file);

      const orderRes = await labTestAPI.createOrder(fd);
      if (orderRes.data.success && orderRes.data.data?.razorpayOrder) {
        const { razorpayOrder, order } = orderRes.data.data;
        await openRazorpayCheckout(razorpayOrder, order);
        alert("🎉 Payment successful! Order placed successfully.");
        setShowOrderModal(false);
        setSelectedTest(null);
      } else {
        throw new Error("Failed to create payment order");
      }
    } catch (error) {
      if (error.message.includes("Payment cancelled") || error.message.includes("payment.failed")) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Lab Tests</h1>
          <p className="text-slate-600">Choose tests and book a sample collection.</p>
        </div>

        {/* Most booked health checkups section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Most booked health checkups
          </h2>

          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFeaturedTab('packages')}
              className={`px-6 py-2.5 rounded-full font-medium transition ${
                featuredTab === 'packages'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Packages
            </button>
            <button
              onClick={() => setFeaturedTab('tests')}
              className={`px-6 py-2.5 rounded-full font-medium transition ${
                featuredTab === 'tests'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Tests
            </button>
          </div>

          {/* Featured Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTab === 'tests' ? (
              // Show actual lab tests from API
              !loading && tests.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No lab tests found.
                </div>
              ) : (
                tests.map(test => {
                  console.log('Rendering test card:', test);
                  return (
                    <TestCard
                      key={test._id}
                      test={test}
                      onOrder={() => {
                        console.log('Order clicked for test:', test);
                        openOrder(test);
                      }}
                      onView={() => {
                        console.log('View clicked for test:', test);
                        const detailData = convertTestToDetailFormat(test);
                        console.log('Detail data:', detailData);
                        openDetailModal(detailData);
                      }}
                    />
                  );
                })
              )
            ) : (
              // Show featured packages
              packages.map(item => (
                <FeaturedCard
                  key={item.id || item._id}
                  item={item}
                  onView={() => openDetailModal(item)}
                />
              ))
            )}
          </div>
        </div>

        {/* How does home sample collection work section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            How does home sample collection work?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <ProcessStep
              number="1"
              title="Book a test"
              description="Select tests and choose a time slot"
              imagePlaceholder="📋"
            />
            <ProcessStep
              number="2"
              title="Phlebotomist visits"
              description="Trained professional comes to your home"
              imagePlaceholder="🏠"
            />
            <ProcessStep
              number="3"
              title="Sample collection"
              description="Quick and hygienic sample collection"
              imagePlaceholder="💉"
            />
            <ProcessStep
              number="4"
              title="Get reports"
              description="Receive digital reports within 24 hours"
              imagePlaceholder="📊"
            />
          </div>
        </div>

        {/* Loading indicator for tests tab */}
        {featuredTab === 'tests' && loading && (
          <div className="flex items-center justify-center py-12">
            <LoadSpinner />
            <span className="ml-3 text-slate-600">Loading tests...</span>
          </div>
        )}

        {featuredTab === 'tests' && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedDetail && (
          <DetailModal
            item={selectedDetail}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedDetail(null);
            }}
            onBook={(collectionDetails, file) => {
              // If it's an actual test, open the order modal
              if (selectedDetail.isActualTest && selectedDetail.actualTestData) {
                setShowDetailModal(false);
                openOrder(selectedDetail.actualTestData);
              } else {
                // For packages, process the payment
                handlePackageBooking(selectedDetail, collectionDetails, file);
              }
            }}
            loading={orderLoading}
          />
        )}

        {/* Order Modal */}
        {showOrderModal && selectedTest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Order: {selectedTest.name}</h3>
                  <p className="text-sm text-slate-500">
                    {selectedTest.sampleType} • {selectedTest.duration}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedTest(null);
                  }}
                  className="p-2 rounded hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <LabTestOrderForm
                selectedTest={selectedTest}
                onCancel={() => {
                  setShowOrderModal(false);
                  setSelectedTest(null);
                }}
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

function FeaturedCard({ item, onView }) {
  return (
    <div
      onClick={onView}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer border border-slate-100"
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-4`}>
        {item.icon}
      </div>
      <h3 className="font-bold text-lg text-slate-900 mb-2">{item.name}</h3>
      <p className="text-sm text-slate-600 mb-3">Contains {item.testsCount} tests</p>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold text-slate-900">₹{item.price}</span>
        {item.originalPrice && (
          <>
            <span className="text-sm text-slate-400 line-through">₹{item.originalPrice}</span>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              {item.discount}
            </span>
          </>
        )}
      </div>
      <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
        BOOK
      </button>
    </div>
  );
}

function DetailModal({ item, onClose, onBook, loading }) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [collectionDetails, setCollectionDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    preferredDate: '',
    preferredTime: ''
  });
  const [prescriptionFile, setPrescriptionFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCollectionDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPrescriptionFile(e.target.files[0]);
    }
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    onBook(collectionDetails, prescriptionFile);
  };

  if (showBookingForm) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-bold">Book {item.name}</h3>
            <button onClick={onClose} className="p-2 rounded hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitBooking} className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={collectionDetails.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={collectionDetails.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={collectionDetails.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <textarea
                name="address"
                value={collectionDetails.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={collectionDetails.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={collectionDetails.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={collectionDetails.pincode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Preferred Date *</label>
                <input
                  type="date"
                  name="preferredDate"
                  value={collectionDetails.preferredDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preferred Time *</label>
                <select
                  name="preferredTime"
                  value={collectionDetails.preferredTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select time</option>
                  <option value="6:00 AM - 9:00 AM">6:00 AM - 9:00 AM</option>
                  <option value="9:00 AM - 12:00 PM">9:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 3:00 PM">12:00 PM - 3:00 PM</option>
                  <option value="3:00 PM - 6:00 PM">3:00 PM - 6:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Prescription (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Pay ₹${item.price}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full my-8 shadow-xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-start rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{item.name}</h2>
            <p className="text-sm text-slate-500 mt-1">Also referred as: Full Body Health Checkup</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="flex-1 bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-900">{item.bookedRecently}</div>
                <div className="text-sm text-slate-600">Recently booked</div>
              </div>
              <div className="flex-1 bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-900">For men & women</div>
                <div className="text-sm text-slate-600">Available for all</div>
              </div>
            </div>

            {/* Test Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Clock className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                <div className="font-semibold text-slate-900">Earliest reports in</div>
                <div className="text-sm text-slate-600">{item.reportTime}</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <TestTube className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                <div className="font-semibold text-slate-900">Contains</div>
                <div className="text-sm text-slate-600">{item.testsCount} tests</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Award className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                <div className="font-semibold text-slate-900">Preparations</div>
                <div className="text-sm text-slate-600">{item.fasting}</div>
              </div>
            </div>

            {/* Sample Collection Info */}
            <div className="bg-indigo-50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🩺</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Sample Collection</h3>
                  <p className="text-slate-700 mb-2">Who will collect your samples?</p>
                  <p className="text-sm text-slate-600">Samples required: {item.sampleType}</p>
                </div>
              </div>
            </div>

            {/* Know more section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Know more about this test</h3>
              <p className="text-slate-600">
                The {item.name} comprises various tests that help determine your overall health status. 
                It screens for early signs or risk factors of various health concerns.
              </p>
              <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                See more →
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl">🩸</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Samples required</h4>
                  <p className="text-sm text-slate-600">{item.sampleType}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl">🧪</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Find out</h4>
                  <p className="text-sm text-slate-600">Why is this package booked?</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl">⏰</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Preparations</h4>
                  <p className="text-sm text-slate-600">{item.fasting}</p>
                </div>
              </div>
            </div>

            {/* Understanding section */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900">Understanding {item.name}</h3>
              <p className="text-slate-600">
                Stress and unhealthy lifestyles can gradually take a toll on your health, putting you at risk 
                of chronic health issues. The {item.name} assesses various systems and organs to detect health 
                problems early. It is especially recommended to get tested if you have risk factors.
              </p>
            </div>
          </div>

          {/* Right Sidebar - Pricing & CTA */}
          <div className="lg:w-80 bg-slate-50 p-6 space-y-4 rounded-br-2xl">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="mb-4">
                <div className="text-sm text-slate-600 mb-2">Package price:</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">₹{item.price}</span>
                  {item.originalPrice && (
                    <span className="text-lg text-slate-400 line-through">₹{item.originalPrice}</span>
                  )}
                </div>
                {item.discount && (
                  <div className="mt-2 inline-block">
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      Save {item.discount}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <div className="text-xs font-medium text-amber-800 mb-1">Get additional 10% off</div>
                <div className="text-sm text-amber-700">Use CARE10 at checkout</div>
              </div>

              <button
                onClick={() => {
                  if (item.isActualTest) {
                    onBook();
                  } else {
                    setShowBookingForm(true);
                  }
                }}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                BOOK
              </button>
            </div>

            {item.conductedBy && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-sm text-slate-600 mb-3">Conducted by</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{item.conductedByLogo}</div>
                  <div>
                    <div className="font-bold text-slate-900">{item.conductedBy}</div>
                    <div className="text-xs text-slate-500">Most trusted lab</div>
                  </div>
                </div>

                {item.highlights && (
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-3">
                      Who will collect your samples?
                    </div>
                    <div className="text-sm text-slate-600 mb-3">
                      {item.conductedBy} certified phlebotomists
                    </div>
                    <div className="space-y-2">
                      {item.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessStep({ number, title, description, imagePlaceholder }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl font-bold text-indigo-600">{number}</span>
      </div>
      <div className="text-5xl mb-4">{imagePlaceholder}</div>
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}

function TestCard({ test, onOrder, onView }) {
  const handleClick = (e) => {
    console.log('Card clicked, target:', e.target);
    // Prevent triggering if clicking the book button
    if (e.target.closest('button')) {
      console.log('Button clicked, stopping');
      return;
    }
    console.log('Calling onView');
    if (onView) onView();
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer border border-slate-100"
    >
      {test.image ? (
        <img src={test.image} alt={test.name} className="w-full h-40 object-cover rounded-lg mb-4" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-4 flex items-center justify-center">
          <TestTube className="w-12 h-12 text-indigo-600" />
        </div>
      )}
      <h3 className="font-bold text-lg text-slate-900 mb-2">{test.name}</h3>
      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{test.description}</p>
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <TestTube className="w-4 h-4" />
        <span>{test.sampleType}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-slate-900">₹{test.finalPrice || test.price}</span>
        <button
          onClick={(e) => {
            console.log('Book button clicked');
            e.stopPropagation();
            onOrder();
          }}
          className="px-3 py-1 rounded-lg bg-indigo-600 text-white flex items-center gap-2 hover:bg-indigo-700"
        >
          Book
        </button>
      </div>
    </div>
  );
}