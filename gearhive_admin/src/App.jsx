/* src/App.jsx */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import authService from './services/auth';
import { login, logout } from './store/authslice';
import { Routes, Route } from 'react-router-dom';

// Page Imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductsList from './pages/ProductsList';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Orders from './pages/Orders'; // ✅ IMPORT ADDED
import OrderDetail from './pages/OrderDetail';

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    authService.getCurrentUser()
      .then((userData) => {
        if (userData) {
          dispatch(login(userData));
        } else {
          dispatch(logout());
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductsList />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/edit-product/:slug" element={<EditProduct />} />
        <Route path="/orders/:id" element={<OrderDetail />} />

        {/* ✅ ROUTE ADDED */}
        <Route path="/orders" element={<Orders />} /> 
      </Routes>
    </div>
  );
}

export default App;