// src/hooks/useProduct.js
import { useContext } from 'react';
import { ProductContext } from '../contexts/ProductContext';

export const useProduct = () => {
  return useContext(ProductContext);
};
