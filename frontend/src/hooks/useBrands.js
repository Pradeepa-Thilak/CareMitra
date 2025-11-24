// src/hooks/useBrands.js
import { useState, useEffect } from 'react';
import api from '../utils/api';

// fallback if backend not available (simple logos)
const fallbackBrands = [
  { _id: 'b1', key: 'himalaya', name: 'Himalaya', logo: 'https://via.placeholder.com/150x80?text=Himalaya' },
  { _id: 'b2', key: 'dabur', name: 'Dabur', logo: 'https://via.placeholder.com/150x80?text=Dabur' },
  { _id: 'b3', key: 'cipla', name: 'Cipla', logo: 'https://via.placeholder.com/150x80?text=Cipla' },
  { _id: 'b4', key: 'sunday', name: 'Sunday', logo: 'https://via.placeholder.com/150x80?text=Sunday' },
];

export const useBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // call your backend brands endpoint
        const res = await api.get('/brands'); // adjust path if needed
        const data = res.data.data;
        console.log(data);
        
        if (mounted) setBrands(Array.isArray(data) ? data : []);
        console.log(brands);
      } catch (err) {
        console.warn('Brands API failed, using fallback', err?.message || err);
        if (mounted) {
          setBrands(fallbackBrands);
          setError(err?.message || 'Failed to load brands');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  return { brands, loading, error };
};
