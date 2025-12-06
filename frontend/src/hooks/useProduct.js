// src/hooks/useProduct.js
import { useContext } from 'react';
import { ProductContext } from '../contexts/ProductContext';

export const useProduct = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error('useProduct must be used inside a ProductProvider. Wrap your app with <ProductProvider>.');
  }
  return ctx;
};

export default useProduct;
