// src/components/product/BrandSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoadSpinner from '../LoadSpinner';
import { useBrands } from '../../hooks/useBrands';

const BrandCard = ({ brand, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-3 bg-white rounded shadow-sm hover:shadow-md transition min-w-[140] h-[120px]  flex-shrink-0  "
    aria-label={`See products from ${brand.name}`}
  >
    <div className="h-16 w-full flex items-center justify-center overflow-hidden">
      <img
        src={brand.logo || 'https://via.placeholder.com/150x80?text=Brand'}
        alt={brand.name}
        className="max-h-12 object-contain"
      />
    </div>
    <div className="mt-2 text-xs text-gray-700">{brand.name}</div>
  </button>
);

const BrandSection = () => {
  const { brands, loading } = useBrands();
  const navigate = useNavigate();

  if (loading) return <LoadSpinner />;

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Featured Brands</h2>
        <button
          onClick={() => navigate('/medicines')}
          className="text-sm underline"
        >
          See all
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {brands.map((brand) => (
          <BrandCard
            key={brand._id ?? brand.key ?? brand.name}
            brand={brand}
            onClick={() => navigate(`/medicines?brand=${encodeURIComponent(brand.key ?? brand.name)}`)}
          />
        ))}
      </div>
    </section>
  );
};

export default BrandSection;
