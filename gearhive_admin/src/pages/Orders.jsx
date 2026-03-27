/* src/pages/Orders.jsx */
import React, { useState, useEffect, useRef } from 'react';
import databaseService from '../services/database';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, SlidersHorizontal, ShoppingCart, Loader2 } from 'lucide-react';

function StatusBadge({ status }) {
  const s = (status ?? '').toLowerCase();
  const cls =
    s === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
    s === 'shipped'   ? 'bg-sky-50 text-sky-700 border-sky-100' :
    s === 'processing'? 'bg-amber-50 text-amber-700 border-amber-100' :
    s === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-stone-100 text-stone-500 border-stone-200';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${cls}`}>
      {status}
    </span>
  );
}

function Orders() {
  const navigate = useNavigate();
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [statusFilter,setStatusFilter]= useState('all');
  const [sortConfig,  setSortConfig]  = useState('newest');
  const [filterOpen,  setFilterOpen]  = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await databaseService.getOrders();
        if (r) setOrders(r.documents.map((d) => ({
          id:          d.$id,
          customer:    d.customer_name,
          rawDate:     new Date(d.$createdAt),
          displayDate: new Date(d.$createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          total:       d.total_amount,
          status:      d.status || 'Processing',
          items:       parseInt(d.items_count) || 0,
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Close filter on outside click */
  useEffect(() => {
    const handle = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const filtered = orders
    .filter((o) => {
      const q = search.toLowerCase();
      return (
        (o.customer.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)) &&
        (statusFilter === 'all' || o.status === statusFilter)
      );
    })
    .sort((a, b) =>
      sortConfig === 'newest'     ? b.rawDate - a.rawDate :
      sortConfig === 'oldest'     ? a.rawDate - b.rawDate :
      sortConfig === 'items-high' ? b.items - a.items    :
      sortConfig === 'items-low'  ? a.items - b.items    : 0
    );

  const FilterBtn = ({ label, value, type }) => (
    <button
      onClick={() => {
        type === 'sort' ? setSortConfig(value) : setStatusFilter(value);
        setFilterOpen(false);
      }}
      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
        ${(type === 'sort' ? sortConfig : statusFilter) === value
          ? 'bg-amber-50 text-amber-800 font-semibold'
          : 'text-stone-600 hover:bg-stone-50'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="page-enter p-6 md:p-8 max-w-6xl mx-auto space-y-5">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-0.5">Fulfilment</p>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>Orders</h1>
        </div>

        {/* Search + filter */}
        <div className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text" placeholder="Search ID or customer…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-stone-200 bg-white rounded-xl text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 w-56 transition-all"
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm font-medium transition-colors
                ${filterOpen ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'}`}
            >
              <SlidersHorizontal size={15} /> Filter
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-100 rounded-2xl shadow-xl z-20 p-2 space-y-0.5">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 py-1.5">Sort</p>
                <FilterBtn label="Newest first"      value="newest"     type="sort" />
                <FilterBtn label="Oldest first"      value="oldest"     type="sort" />
                <FilterBtn label="Highest quantity"  value="items-high" type="sort" />
                <FilterBtn label="Lowest quantity"   value="items-low"  type="sort" />
                <div className="border-t border-stone-100 my-1" />
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 py-1.5">Status</p>
                {['all','Processing','Shipped','Delivered','Cancelled'].map((s) => (
                  <FilterBtn key={s} label={s === 'all' ? 'All statuses' : s} value={s} type="status" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-stone-400">
            <Loader2 className="animate-spin" size={28} />
            <p className="text-sm">Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-stone-400">
            <ShoppingCart size={40} className="opacity-20" />
            <p className="text-sm">{orders.length === 0 ? 'No orders yet.' : 'No orders match your filters.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
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
                {filtered.map((o) => (
                  <tr key={o.id} className="group cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
                    <td className="px-5 py-3.5 font-mono text-xs text-amber-700 font-semibold">
                      #{o.id.slice(0, 8)}…
                    </td>
                    <td className="px-5 py-3.5 font-medium text-stone-800">{o.customer}</td>
                    <td className="px-5 py-3.5 text-stone-400 text-xs">{o.displayDate}</td>
                    <td className="px-5 py-3.5 text-stone-500">{o.items}</td>
                    <td className="px-5 py-3.5 font-semibold text-stone-900">
                      ${o.total ? o.total.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        aria-label="View order"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-300 group-hover:text-amber-600 group-hover:bg-amber-50 transition-colors ml-auto"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && (
        <p className="text-xs text-stone-400 text-right">
          Showing {filtered.length} of {orders.length} orders
        </p>
      )}
    </div>
  );
}

export default Orders;
