/* src/App.jsx */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import authService from './services/auth';
import { login, logout } from './store/authslice';
import { Routes, Route, useLocation } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductsList from './pages/ProductsList';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Sidebar from './components/layout/Sidebar';

/* Pages that should NOT have the sidebar */
const PUBLIC_PATHS = ['/login'];

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    authService.getCurrentUser()
      .then((userData) => {
        if (userData) dispatch(login(userData));
        else dispatch(logout());
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f7f4] gap-4">
        <div className="relative w-12 h-12">
          <span className="absolute inset-0 rounded-xl bg-amber-400 opacity-20 animate-ping" />
          <span className="absolute inset-0 rounded-xl bg-amber-400 flex items-center justify-center">
            <span className="text-stone-900 font-bold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>G</span>
          </span>
        </div>
        <p className="text-stone-400 text-xs tracking-widest uppercase">Loading</p>
      </div>
    );
  }

  const isPublic = PUBLIC_PATHS.includes(location.pathname);

  const routes = (
    <Routes>
      <Route path="/login"                element={<Login />} />
      <Route path="/"                     element={<Dashboard />} />
      <Route path="/products"             element={<ProductsList />} />
      <Route path="/add-product"          element={<AddProduct />} />
      <Route path="/edit-product/:slug"   element={<EditProduct />} />
      <Route path="/orders"               element={<Orders />} />
      <Route path="/orders/:id"           element={<OrderDetail />} />
    </Routes>
  );

  if (isPublic) return routes;

  return <Sidebar>{routes}</Sidebar>;
}

export default App;
