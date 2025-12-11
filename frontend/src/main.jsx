import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext.jsx';
import { WishlistProvider } from './contexts/WishlistContext.jsx';
import { AppointmentProvider } from './contexts/AppointmentContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   
      <AuthProvider>
        <CartProvider>
          <ProductProvider>
            <WishlistProvider>
              <AppointmentProvider>
                <App />
              </AppointmentProvider>
            </WishlistProvider>
          </ProductProvider>
        </CartProvider>
      </AuthProvider>
  </React.StrictMode>,
);
