// src/components/product/CategorySection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadSpinner';
import { useCategories } from '../../hooks/useCategories';

const CategoryCard = ({ category, onClick }) => (
  <div
    onClick={onClick}
    className="group cursor-pointer flex-shrink-0 w-48"
  >
    <div className="relative h-48 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-purple-50">
      <img
        src={category.image || 'https://via.placeholder.com/400x250?text=Category'}
        alt={category.name}
        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform transition-transform group-hover:translate-y-0 translate-y-1">
        <h4 className="text-lg font-bold mb-1 drop-shadow-lg">{category.name}</h4>
        {category.description && (
          <p className="text-xs opacity-90 line-clamp-2 drop-shadow">{category.description}</p>
        )}
      </div>
    </div>
  </div>
);

const CategorySection = () => {
  const { categories, loading } = useCategories();
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="mb-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
        </div>
        <LoadingSpinner />
      </section>
    );
  }

  return (
    <section className="mb-12 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Shop by Category</h2>
          <p className="text-sm text-gray-500">Find what you need quickly</p>
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
          {categories.map((cat) => (
            <CategoryCard
              key={cat._id ?? cat.key}
              category={cat}
              onClick={() => navigate(`/medicines?category=${encodeURIComponent(cat.key ?? cat.name)}`)}
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

export default CategorySection;