import { useState, useEffect } from 'react';
import { categoryAPI } from '../utils/api';

const fallbackCategories = [
  { _id: 'c1', key: 'pain-relief', name: 'Pain Relief', image: 'https://via.placeholder.com/400x250?text=Pain+Relief', description: 'Pain relief medicines' },
  { _id: 'c2', key: 'vitamins', name: 'Vitamins', image: 'https://via.placeholder.com/400x250?text=Vitamins', description: 'Vitamins & supplements' },
  { _id: 'c3', key: 'cough-cold', name: 'Cough & Cold', image: 'https://via.placeholder.com/400x250?text=Cough+%26+Cold', description: 'Cough & cold remedies' },
  { _id: 'c4', key: 'digestive', name: 'Digestive', image: 'https://via.placeholder.com/400x250?text=Digestive', description: 'Digestive health support' },
];

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await categoryAPI.getAll();
        const data = res.data.data ;
        if (mounted) setCategories(Array.isArray(data) ? data : fallbackCategories);
      } catch (err) {
        console.warn("Category API failed. Using fallback:", err);
        if (mounted) setCategories(fallbackCategories);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  return { categories, loading };
};
