/* src/pages/ProductsList.jsx */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import databaseService from '../services/database';
import { Plus, Pencil, Trash2, Package, Loader2 } from 'lucide-react';

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const r = await databaseService.getProducts();
      if (r) setProducts(r.documents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(product.$id);
    try {
      if (product.featuredImage) await databaseService.deleteFile(product.featuredImage);
      await databaseService.deleteProduct(product.$id);
      setProducts((p) => p.filter((x) => x.$id !== product.$id));
    } catch {
      alert('Failed to delete product.');
    } finally {
      setDeleting(null);
    }
  };

  const StockBadge = ({ qty }) => {
    const n = qty ?? 0;
    const cls = n > 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : n > 0  ? 'bg-amber-50 text-amber-700 border-amber-100'
                       : 'bg-rose-50 text-rose-700 border-rose-100';
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
        {n === 0 ? 'Out of stock' : n}
      </span>
    );
  };

  return (
    <div className="page-enter p-6 md:p-8 max-w-6xl mx-auto space-y-5">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-0.5">Inventory</p>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>Products</h1>
        </div>
        <Link
          to="/add-product"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={15} strokeWidth={2.5} /> Add product
        </Link>
      </div>

      {/* ── Table card ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-stone-400">
            <Loader2 className="animate-spin" size={28} />
            <p className="text-sm">Loading products…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-stone-400">
            <Package size={48} className="opacity-20" />
            <div className="text-center">
              <p className="font-semibold text-stone-700">No products yet</p>
              <p className="text-sm mt-1">Add your first product to get started.</p>
            </div>
            <Link to="/add-product" className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-semibold">
              <Plus size={14} /> Add product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  {['', 'Product', 'Price', 'Stock', 'Category', 'Status', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {products.map((p) => (
                  <tr key={p.$id} className="group">
                    {/* Image */}
                    <td className="pl-5 py-3">
                      <div className="h-11 w-11 rounded-xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center">
                        <img
                          src={databaseService.getFileView(p.featuredImage)}
                          alt={p.name}
                          className="h-full w-full object-contain mix-blend-multiply p-1"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    </td>
                    {/* Name */}
                    <td className="px-5 py-3">
                      <p className="font-semibold text-stone-900 leading-snug line-clamp-1">{p.name}</p>
                      <p className="text-[11px] text-stone-400 font-mono mt-0.5">{p.$id.slice(0, 10)}…</p>
                    </td>
                    {/* Price */}
                    <td className="px-5 py-3 font-semibold text-stone-900">
                      ${(p.price ?? 0).toFixed(2)}
                    </td>
                    {/* Stock */}
                    <td className="px-5 py-3">
                      <StockBadge qty={p.quantity} />
                    </td>
                    {/* Category */}
                    <td className="px-5 py-3 text-stone-500 capitalize">{p.category}</td>
                    {/* Status */}
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border
                        ${p.status ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-stone-100 text-stone-500 border-stone-200'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${p.status ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                        {p.status ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/edit-product/${p.$id}`}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deleting === p.$id}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                          aria-label={`Delete ${p.name}`}
                        >
                          {deleting === p.$id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </button>
                      </div>
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

export default ProductsList;
