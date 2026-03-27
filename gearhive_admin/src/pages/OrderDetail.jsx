/* src/pages/OrderDetail.jsx */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import databaseService from '../services/database';
import {
  Package, Truck, CheckCircle, Clock, MapPin, CreditCard,
  Save, Trash2, ArrowLeft, Loader2, AlertTriangle, X,
} from 'lucide-react';

/* ── Status badge ──────────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = (status ?? '').toLowerCase();
  const cls =
    s === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
    s === 'shipped'   ? 'bg-sky-50 text-sky-700 border-sky-100' :
    s === 'processing'? 'bg-amber-50 text-amber-700 border-amber-100' :
    s === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-stone-100 text-stone-500 border-stone-200';
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${cls}`}>
      {status}
    </span>
  );
}

/* ── Info card ─────────────────────────────────────────────── */
function InfoCard({ title, icon: Icon, iconColor, children }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
        <Icon size={16} className={iconColor} /> {title}
      </h3>
      {children}
    </div>
  );
}

/* ── Delete confirm modal ──────────────────────────────────── */
function DeleteModal({ onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm px-4"
      role="dialog" aria-modal="true">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div className="h-10 w-10 rounded-2xl bg-rose-100 flex items-center justify-center">
            <AlertTriangle size={20} className="text-rose-600" />
          </div>
          <button onClick={onCancel} className="text-stone-400 hover:text-stone-700"><X size={18} /></button>
        </div>
        <h2 className="text-lg font-bold text-stone-900 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Delete this order?</h2>
        <p className="text-stone-400 text-sm mb-6">This action cannot be undone. The order record will be permanently removed.</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-1.5">
            {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : 'Delete order'}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [order,    setOrder]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [selStatus,setSelStatus]= useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDel,  setShowDel]  = useState(false);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    (async () => {
      if (id) {
        const data = await databaseService.getOrder(id);
        if (data) { setOrder(data); setSelStatus(data.status); }
      }
      setLoading(false);
    })();
  }, [id]);

  const saveStatus = async () => {
    if (selStatus === order.status) return;
    setUpdating(true);
    try {
      await databaseService.updateOrderStatus(id, selStatus);
      setOrder((o) => ({ ...o, status: selStatus }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const ok = await databaseService.deleteOrder(id);
      if (ok) navigate('/orders');
      else throw new Error('Delete failed');
    } catch {
      alert('Failed to delete order.');
      setDeleting(false);
      setShowDel(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-amber-500" size={32} />
    </div>
  );
  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-stone-500">
      <p className="font-semibold">Order not found.</p>
      <Link to="/orders" className="text-sm text-amber-600 font-semibold underline">Back to orders</Link>
    </div>
  );

  const itemCount = order.items_count || order.item_count || 0;

  return (
    <>
      {showDel && <DeleteModal onConfirm={handleDelete} onCancel={() => setShowDel(false)} deleting={deleting} />}

      <div className="page-enter p-6 md:p-8 max-w-5xl mx-auto space-y-5">

        {/* ── Back ──────────────────────────────────────────── */}
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors">
          <ArrowLeft size={14} /> Back to orders
        </Link>

        {/* ── Header card ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center flex-wrap gap-3 mb-1">
              <h1 className="text-xl font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                Order #{order.$id.slice(0, 8)}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-stone-400 flex items-center gap-1.5">
              <Clock size={12} />
              Placed on {new Date(order.$createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              {' · '}{new Date(order.$createdAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Delete */}
            <button
              onClick={() => setShowDel(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>

            {/* Status updater */}
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-xl px-3 py-1.5">
              <span className="text-xs font-semibold text-stone-500">Status</span>
              <select
                value={selStatus}
                onChange={(e) => setSelStatus(e.target.value)}
                className="text-sm bg-transparent border-none focus:outline-none text-stone-800 font-medium cursor-pointer pr-1"
              >
                {['Processing','Shipped','Delivered','Cancelled'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={saveStatus}
                disabled={updating || selStatus === order.status}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all
                  ${updating || selStatus === order.status
                    ? 'bg-stone-300 cursor-not-allowed'
                    : saved ? 'bg-emerald-500' : 'bg-stone-900 hover:bg-stone-800'}`}
              >
                {updating ? <Loader2 size={12} className="animate-spin" />
                  : saved ? <CheckCircle size={12} />
                  : <Save size={12} />}
                {saved ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Detail grid ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Items summary */}
          <div className="lg:col-span-2">
            <InfoCard title={`Items (${itemCount})`} icon={Package} iconColor="text-amber-600">
              <div className="bg-stone-50 rounded-xl p-4 flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400">
                  <Package size={22} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-stone-900 text-sm">Order summary</p>
                  <p className="text-xs text-stone-400 mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                </div>
                <p className="font-bold text-stone-900">${order.total_amount.toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm text-stone-500">Order total</span>
                <span className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                  ${order.total_amount.toFixed(2)}
                </span>
              </div>
            </InfoCard>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Customer */}
            <InfoCard title="Customer" icon={CheckCircle} iconColor="text-emerald-600">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm shrink-0">
                  {order.customer_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{order.customer_name}</p>
                  <p className="text-xs text-stone-400 font-mono">ID: {order.$id.slice(0, 8)}</p>
                </div>
              </div>
            </InfoCard>

            {/* Shipping */}
            <InfoCard title="Shipping" icon={Truck} iconColor="text-sky-600">
              <div className="flex gap-2.5">
                <MapPin size={15} className="text-stone-300 mt-0.5 shrink-0" />
                <p className="text-sm text-stone-600">
                  {order.address || <span className="text-stone-300 italic">No address provided</span>}
                </p>
              </div>
            </InfoCard>

            {/* Payment */}
            <InfoCard title="Payment" icon={CreditCard} iconColor="text-purple-600">
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-500">Status</span>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100 uppercase">
                  {order.payment_status}
                </span>
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderDetail;
