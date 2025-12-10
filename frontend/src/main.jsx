import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext.jsx';
import { WishlistProvider } from './contexts/WishlistContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   
      <AuthProvider>
        <CartProvider>
          <ProductProvider>
            <WishlistProvider>
            <App />
            </WishlistProvider>
          </ProductProvider>
        </CartProvider>
      </AuthProvider>
  </React.StrictMode>,
);
