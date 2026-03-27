/* src/pages/Dashboard.jsx */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import databaseService from '../services/database';
import {
  Package, ShoppingCart, DollarSign, Plus,
  Lock, TrendingUp, Eye, Loader2,
} from 'lucide-react';

/* ── Stat card ─────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, loading, action }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{label}</p>
          {loading
            ? <div className="skeleton h-9 w-24 mt-1" />
            : <p className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
          }
          {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
      {action && (
        <Link
          to={action.to}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors group"
        >
          {action.label}
          <Eye size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

/* ── Status badge ──────────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = (status ?? '').toLowerCase();
  const cls =
    s === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
    s === 'shipped'   ? 'bg-sky-50 text-sky-700 border-sky-100' :
    s === 'processing'? 'bg-amber-50 text-amber-700 border-amber-100' :
    s === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-stone-100 text-stone-600 border-stone-200';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${cls}`}>
      {status}
    </span>
  );
}

function Dashboard() {
  const userData = useSelector((s) => s.auth.userData);
  const [stats, setStats]   = useState({ totalOrders: 0, totalProducts: 0, totalRevenue: 0, recentOrders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) { setLoading(false); return; }
    (async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          databaseService.getOrders(),
          databaseService.getProducts(),
        ]);
        const orders   = ordersRes?.documents   ?? [];
        const products = productsRes?.documents ?? [];
        setStats({
          totalOrders:   orders.length,
          totalProducts: products.length,
          totalRevenue:  orders.reduce((s, o) => s + (o.total_amount || 0), 0),
          recentOrders:  orders.slice(0, 6),
        });
      } catch (e) {
        console.error('Dashboard data error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userData]);

  /* ── Not logged in ── */
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-4">
        <div className="bg-white rounded-3xl border border-stone-100 p-10 max-w-sm w-full text-center">
          <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
            <Lock size={26} className="text-amber-700" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Access restricted
          </h2>
          <p className="text-stone-400 text-sm mb-6">You must be signed in to view the dashboard.</p>
          <Link to="/login" className="block w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold text-sm transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter p-6 md:p-8 space-y-6 max-w-6xl mx-auto">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-0.5">Overview</p>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>
            Good to see you, {userData?.name?.split(' ')[0] ?? 'Admin'} 👋
          </h1>
        </div>
        <Link
          to="/add-product"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={15} /> Add product
        </Link>
      </div>

      {/* ── Stat cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total revenue"
          value={loading ? '' : `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub="All-time sales"
          icon={DollarSign}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          loading={loading}
        />
        <StatCard
          label="Products"
          value={loading ? '' : stats.totalProducts}
          sub="In catalogue"
          icon={Package}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          loading={loading}
          action={{ to: '/products', label: 'Manage inventory' }}
        />
        <StatCard
          label="Orders"
          value={loading ? '' : stats.totalOrders}
          sub="Total placed"
          icon={ShoppingCart}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
          loading={loading}
          action={{ to: '/orders', label: 'View all orders' }}
        />
      </div>

      {/* ── Recent orders table ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-amber-500" />
            <h2 className="text-sm font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>Recent orders</h2>
          </div>
          <Link to="/orders" className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
          </div>
        ) : stats.recentOrders.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <ShoppingCart size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {stats.recentOrders.map((o) => (
                  <tr key={o.$id}>
                    <td className="px-5 py-3.5 font-mono text-xs text-amber-700 font-semibold">
                      #{o.$id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-stone-800">{o.customer_name}</td>
                    <td className="px-5 py-3.5 text-stone-400 text-xs">
                      {new Date(o.$createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-stone-500">{o.items_count ?? 0}</td>
                    <td className="px-5 py-3.5 font-semibold text-stone-900">${(o.total_amount ?? 0).toFixed(2)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/orders/${o.$id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-amber-700 transition-colors"
                      >
                        <Eye size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
