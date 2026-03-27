/* src/components/layout/Sidebar.jsx */
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, Package, Plus, ShoppingCart,
  LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import authService from '../../services/auth';
import { logout } from '../../store/authslice';

const NAV = [
  { to: '/',             label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  { to: '/products',     label: 'Products',    icon: Package },
  { to: '/add-product',  label: 'Add Product', icon: Plus },
  { to: '/orders',       label: 'Orders',      icon: ShoppingCart },
];

export default function Sidebar({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userData = useSelector((s) => s.auth.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      navigate('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const initial = userData?.name?.[0]?.toUpperCase() ?? 'A';

  const NavItem = ({ to, label, icon: Icon, exact }) => (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group
         ${isActive
           ? 'bg-amber-50 text-amber-800 font-semibold'
           : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            className={`shrink-0 transition-colors ${isActive ? 'text-amber-600' : 'text-stone-400 group-hover:text-stone-700'}`}
          />
          {!collapsed && <span className="truncate">{label}</span>}
          {!collapsed && isActive && (
            <ChevronRight size={14} className="ml-auto text-amber-500" />
          )}
        </>
      )}
    </NavLink>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-stone-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="h-8 w-8 rounded-lg bg-amber-400 flex items-center justify-center shrink-0">
          <span className="text-stone-900 text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>G</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-stone-900 leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>
              GearHive
            </p>
            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest mt-0.5">Admin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => <NavItem key={item.to} {...item} />)}
      </nav>

      {/* User + logout */}
      <div className={`px-2 py-4 border-t border-stone-100 space-y-1`}>
        {!collapsed && userData && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-bold shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-stone-800 truncate">{userData.name ?? 'Admin'}</p>
              <p className="text-[10px] text-stone-400 truncate">{userData.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          aria-label="Log out"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:bg-rose-50 hover:text-rose-700 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && 'Log out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8f7f4] overflow-hidden">
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-stone-100 transition-all duration-300 shrink-0
          ${collapsed ? 'w-16' : 'w-56'}`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute top-4 left-0 z-10 hidden md:flex translate-x-full ml-1 h-6 w-6 items-center justify-center rounded-full bg-white border border-stone-200 text-stone-400 hover:text-stone-700 shadow-sm transition-colors"
          style={{ left: collapsed ? '3.5rem' : '13rem' }}
        >
          {collapsed ? <ChevronRight size={12} /> : <X size={12} />}
        </button>
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ───────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-56 z-50 bg-white border-r border-stone-100 transition-transform duration-300 md:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </aside>

      {/* ── Main area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between bg-white border-b border-stone-100 px-4 h-14 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="h-9 w-9 flex items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="text-base font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>
            Gear<span className="text-amber-500">Hive</span>
          </Link>
          <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-bold">
            {initial}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
