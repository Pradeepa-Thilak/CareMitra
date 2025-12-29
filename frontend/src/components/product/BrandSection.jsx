// src/components/product/BrandSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoadSpinner from '../LoadSpinner';
import { useBrands } from '../../hooks/useBrands';

const BrandCard = ({ brand, onClick }) => {
  const [imageError, setImageError] = React.useState(false);
  
  return (
    <button
      onClick={onClick}
      className="group flex-shrink-0 w-44 h-36 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col items-center justify-center border border-gray-100 hover:border-blue-200 hover:scale-105"
      aria-label={`See products from ${brand.name}`}
    >
      <div className="h-20 w-full flex items-center justify-center overflow-hidden mb-3">
        {!imageError && brand.logo ? (
          <img
            src={brand.logo}
            alt={brand.name}
            className="max-h-16 max-w-full object-contain transition-transform group-hover:scale-110 duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <span className="text-2xl font-bold text-gray-400">
              {brand.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        )}
      </div>
      <div className="text-sm font-semibold text-gray-800 text-center line-clamp-2 group-hover:text-blue-600 transition-colors">
        {brand.name}
      </div>
    </button>
  );
};

const BrandSection = () => {
  const { brands, loading, error } = useBrands();
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="my-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Brands</h2>
        </div>
        <LoadSpinner />
      </section>
    );
  }

  if (error) {
    return (
      <section className="my-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Brands</h2>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Error loading brands: {error}</p>
        </div>
      </section>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <section className="my-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Brands</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>No brands available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-12 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Featured Brands</h2>
          <p className="text-sm text-gray-500">Shop from trusted healthcare brands</p>
        </div>
        <button
          onClick={() => navigate('/medicines')}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all group"
        >
          View All
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {brands.map((brand) => (
            <BrandCard
              key={brand._id ?? brand.key ?? brand.name}
              brand={brand}
              onClick={() => navigate(`/medicines?brand=${encodeURIComponent(brand.key ?? brand.name)}`)}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .snap-x {
          scroll-snap-type: x mandatory;
        }
        .snap-mandatory > * {
          scroll-snap-align: start;
        }
      `}</style>
    </section>
  );
};

export default BrandSection;