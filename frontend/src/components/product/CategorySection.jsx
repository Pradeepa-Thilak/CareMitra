// src/components/product/CategorySection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadSpinner';
import { useCategories } from '../../hooks/useCategories';

const CategoryCard = ({ category, onClick }) => (
  <div
    onClick={onClick}
    className="category-card cursor-pointer rounded-md overflow-hidden border hover:shadow-md transition p-2"
  >
    <div className="h-36 w-full mb-3 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
      <img
        src={category.image || 'https://via.placeholder.com/400x250?text=Category'}
        alt={category.name}
        className="w-full h-full object-cover"
      />
    </div>
    <h4 className="text-sm font-semibold mb-1">{category.name}</h4>
    {category.description && (
      <p className="text-xs text-gray-500 line-clamp-2">{category.description}</p>
    )}
  </div>
);

const CategorySection = () => {
  const { categories, loading } = useCategories();
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Shop by Category</h2>
        </div>
        <LoadingSpinner />
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Shop by Category</h2>
        <button
          onClick={() => navigate('/medicines')}
          className="text-sm underline"
        >
          See all
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat._id ?? cat.key}
            category={cat}
            onClick={() => navigate(`/medicines?category=${encodeURIComponent(cat.key ?? cat.name)}`)}
          />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
