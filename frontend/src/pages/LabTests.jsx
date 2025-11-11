import React, { useState } from 'react';
import { Beaker, Clock, MapPin, ShoppingCart } from 'lucide-react';
import { useCart } from '../hooks/useCart';

const LabTests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart } = useCart();

  const categories = ['All', 'Blood Tests', 'Urine Tests', 'Imaging', 'Cardiac', 'Wellness'];

  const mockTests = [
    {
      id: 101,
      name: 'Complete Blood Count (CBC)',
      category: 'Blood Tests',
      price: 299,
      originalPrice: 399,
      discount: 25,
      description: 'Comprehensive blood test to check overall health',
      turnaroundTime: '24 hours',
      homeCollection: true,
      sampleType: 'Blood',
      fasting: true,
    },
    {
      id: 102,
      name: 'Thyroid Profile (TSH, T3, T4)',
      category: 'Blood Tests',
      price: 499,
      originalPrice: 699,
      discount: 29,
      description: 'Check thyroid function and hormones',
      turnaroundTime: '24 hours',
      homeCollection: true,
      sampleType: 'Blood',
      fasting: true,
    },
    {
      id: 103,
      name: 'Lipid Profile',
      category: 'Blood Tests',
      price: 399,
      originalPrice: 549,
      discount: 27,
      description: 'Cholesterol and triglycerides test',
      turnaroundTime: '24 hours',
      homeCollection: true,
      sampleType: 'Blood',
      fasting: true,
    },
    {
      id: 104,
      name: 'Liver Function Test (LFT)',
      category: 'Blood Tests',
      price: 449,
      originalPrice: 599,
      discount: 25,
      description: 'Assess liver health and function',
      turnaroundTime: '24 hours',
      homeCollection: true,
      sampleType: 'Blood',
      fasting: false,
    },
    {
      id: 105,
      name: 'Kidney Function Test (KFT)',
      category: 'Blood Tests',
      price: 449,
      originalPrice: 599,
      discount: 25,
      description: 'Check kidney health and function',
      turnaroundTime: '24 hours',
      homeCollection: true,
      sampleType: 'Blood',
      fasting: false,
    },
    {
      id: 106,
      name: 'Chest X-Ray',
      category: 'Imaging',
      price: 349,
      originalPrice: 499,
      discount: 30,
      description: 'Digital chest X-ray imaging',
      turnaroundTime: '2 hours',
      homeCollection: false,
      sampleType: 'N/A',
      fasting: false,
    },
    {
      id: 107,
      name: 'Ultrasound Abdomen',
      category: 'Imaging',
      price: 599,
      originalPrice: 799,
      discount: 25,
      description: 'Abdominal ultrasound scan',
      turnaroundTime: '1 hour',
      homeCollection: false,
      sampleType: 'N/A',
      fasting: true,
    },
    {
      id: 108,
      name: 'ECG (Electrocardiogram)',
      category: 'Cardiac',
      price: 199,
      originalPrice: 299,
      discount: 33,
      description: 'Heart rhythm and electrical activity test',
      turnaroundTime: '30 minutes',
      homeCollection: true,
      sampleType: 'N/A',
      fasting: false,
    },
    {
      id: 109,
      name: 'Vitamin D Level Test',
      category: 'Wellness',
      price: 349,
      originalPrice: 499,
      discount: 30,
      description: 'Check vitamin D deficiency',
      turnaroundTime: '24 hours',
      homeCollection: true,
      sampleType: 'Blood',
      fasting: false,
    },
    {
      id: 110,
      name: 'COVID-19 RT-PCR Test',
      category: 'Blood Tests',
      price: 249,
      originalPrice: 349,
      discount: 29,
      description: 'Accurate COVID-19 detection test',
      turnaroundTime: '24 hours',
      homeCollection: true,
      sampleType: 'Nasal Swab',
      fasting: false,
    },
  ];

  const filteredTests = mockTests.filter((test) => {
    const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          test.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (test) => {
    addToCart({
      id: test.id,
      name: test.name,
      price: test.price,
      image: 'https://via.placeholder.com/100x100?text=LabTest',
      quantity: 1,
      type: 'lab-test',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Lab Tests</h1>

        {/* Search and Filter */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search tests by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-light text-dark hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tests Grid */}
        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div key={test.id} className="card hover:shadow-lg transition overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-dark mb-1">{test.name}</h3>
                      <p className="text-xs text-gray-500">{test.category}</p>
                    </div>
                    {test.discount && (
                      <div className="bg-danger text-white px-2 py-1 rounded text-xs font-bold">
                        {test.discount}%
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4">{test.description}</p>

                  {/* Details */}
                  <div className="space-y-2 mb-4 pb-4 border-b text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Report in {test.turnaroundTime}</span>
                    </div>
                    {test.homeCollection && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>Home collection available</span>
                      </div>
                    )}
                    <div className="text-gray-600">
                      <span className="font-medium">Sample: </span>
                      <span>{test.sampleType}</span>
                    </div>
                    {test.fasting && (
                      <div className="text-warning font-medium">
                        ⚠ Fasting required
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-primary">₹{test.price}</span>
                    <span className="text-sm text-gray-400 line-through">
                      ₹{test.originalPrice}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(test)}
                    className="btn-primary w-full py-2 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Book Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Beaker className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No tests found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
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

export default LabTests;
