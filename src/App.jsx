import React from 'react';
import {Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Products from './pages/Medicines';
import Cart from './pages/Cart';
import LabTests from './pages/LabTests';
import Login from './pages/Login';
import Signup from './pages/Register';

function App() {
  return (
    
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/medicines" element={<Products />} />
            <Route path="/lab-tests" element={<LabTests />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/cart" element={<Cart />} />
            {/* Add a catch-all route for 404 or a simple redirect */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>

  );
}

export default App;
