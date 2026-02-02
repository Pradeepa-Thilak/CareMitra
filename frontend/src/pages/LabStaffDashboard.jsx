import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, FileText, AlertCircle, CheckCircle, RefreshCw, User, Navigation, XCircle } from 'lucide-react';

const LabStaffDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [staffName, setStaffName] = useState('Staff Member');
  const [staffProfile, setStaffProfile] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const API_BASE_URL = 'http://localhost:5001/admin/staff';

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, []);

  // Fetch staff profile
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStaffProfile(data.staff);
          setStaffName(data.staff.name || 'Staff Member');
          localStorage.setItem('staffName', data.staff.name);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`${API_BASE_URL}/order`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        }
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Start collection
  const handleStartCollection = async (orderId) => {
    setActionLoading(prev => ({ ...prev, [orderId]: 'starting' }));
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/order/${orderId}/start-collection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: 'Current location' // You can get actual location if needed
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.orderId === orderId 
              ? { ...order, status: 'in_progress', labData: { ...order.labData, status: 'in_progress' } }
              : order
          )
        );
        alert('Collection started successfully!');
      } else {
        alert(data.message || 'Failed to start collection');
      }
    } catch (err) {
      console.error('Error starting collection:', err);
      alert('Error starting collection: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  // Complete collection
  const handleCompleteCollection = async (orderId) => {
    const notes = prompt('Enter collection notes (optional):');
    
    setActionLoading(prev => ({ ...prev, [orderId]: 'completing' }));
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/order/${orderId}/complete-collection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: notes || '',
          sampleIds: [] // Add sample IDs if needed
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.orderId === orderId 
              ? { ...order, status: 'completed', labData: { ...order.labData, status: 'completed' } }
              : order
          )
        );
        alert('Collection completed successfully!');
        fetchProfile(); // Refresh profile to update statistics
      } else {
        alert(data.message || 'Failed to complete collection');
      }
    } catch (err) {
      console.error('Error completing collection:', err);
      alert('Error completing collection: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [orderId]: 'updating' }));
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/order/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          notes: ''
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.orderId === orderId 
              ? { ...order, status: newStatus, labData: { ...order.labData, status: newStatus } }
              : order
          )
        );
        alert(`Order status updated to ${newStatus}!`);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  // Navigate to location
  const handleNavigate = (address) => {
    if (address && address !== 'N/A' && address !== 'Address not provided') {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    } else {
      alert('Address not available for navigation');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'assigned': 'bg-blue-100 text-blue-800 border-blue-300',
      'in_progress': 'bg-purple-100 text-purple-800 border-purple-300',
      'sample_collected': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'processing': 'bg-orange-100 text-orange-800 border-orange-300',
      'completed': 'bg-green-100 text-green-800 border-green-300',
      'cancelled': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatDate = (date) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter || order.labData?.status === filter;
  });

  // Loading state - only show spinner initially
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Main Dashboard - Always show this structure
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Welcome, {staffName}
                  </h1>
                  <p className="text-gray-600 mt-1">Lab Staff Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {staffProfile?.statistics && (
                <div className="flex gap-3">
                  <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-xl font-bold text-blue-600">{orders.length}</p>
                  </div>
                  <div className="bg-purple-50 px-4 py-2 rounded-lg">
                    <p className="text-xs text-gray-600">In Progress</p>
                    <p className="text-xl font-bold text-purple-600">{staffProfile.statistics.inProgress || 0}</p>
                  </div>
                  <div className="bg-green-50 px-4 py-2 rounded-lg">
                    <p className="text-xs text-gray-600">Completed</p>
                    <p className="text-xl font-bold text-green-600">{staffProfile.statistics.completed || 0}</p>
                  </div>
                </div>
              )}
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh orders"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Error Loading Orders</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={fetchOrders}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'assigned', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {orders.length === 0 ? 'No Orders Assigned Yet' : 'No Orders Found'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {orders.length === 0 
                ? 'You currently have no assigned orders. New orders will appear here when they are assigned to you.'
                : `No orders with status: ${filter.replace('_', ' ')}`}
            </p>
            {filter !== 'all' && orders.length > 0 && (
              <button
                onClick={() => setFilter('all')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View All Orders
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {filteredOrders.map((order) => {
              const currentStatus = order.labData?.status || order.status;
              const isLoading = actionLoading[order.orderId];
              
              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            Order #{order.orderId.slice(-8).toUpperCase()}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(currentStatus)}`}>
                            {currentStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Test: <span className="font-medium text-gray-900">{order.labData?.TestName || 'N/A'}</span>
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs text-gray-500 mb-1">Assigned</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(order.assignedAt)}</p>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {/* Patient Details */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Patient Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-600">Name:</span> <span className="font-medium">{order.patientData?.name || 'N/A'}</span></p>
                          <p><span className="text-gray-600">Phone:</span> <span className="font-medium">{order.patientData?.phone || 'N/A'}</span></p>
                          <p><span className="text-gray-600">Email:</span> <span className="font-medium">{order.patientData?.email || 'N/A'}</span></p>
                        </div>
                      </div>

                      {/* Collection Details */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Collection Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-900">{order.labData?.location || order.patientData?.address || 'Address not provided'}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-900">{formatDate(order.labData?.scheduleAt)}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Special Notes */}
                    {order.labData?.Notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-yellow-900 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Special Instructions: {order.labData.Notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {currentStatus === 'assigned' && (
                        <button 
                          onClick={() => handleStartCollection(order.orderId)}
                          disabled={isLoading}
                          className="flex-1 min-w-[150px] bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading === 'starting' ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Start Collection
                            </>
                          )}
                        </button>
                      )}
                      
                      {currentStatus === 'in_progress' && (
                        <button 
                          onClick={() => handleCompleteCollection(order.orderId)}
                          disabled={isLoading}
                          className="flex-1 min-w-[150px] bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading === 'completing' ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Complete Collection
                            </>
                          )}
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleNavigate(order.labData?.location || order.patientData?.address)}
                        className="flex-1 min-w-[150px] bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition font-medium flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Navigate
                      </button>

                      {(currentStatus === 'assigned' || currentStatus === 'in_progress') && (
                        <button 
                          onClick={() => handleUpdateStatus(order.orderId, 'cancelled')}
                          disabled={isLoading}
                          className="flex-1 min-w-[150px] bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabStaffDashboard;