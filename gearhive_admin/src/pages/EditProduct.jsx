/* src/pages/EditProduct.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import databaseService from '../services/database';
import { UploadCloud, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const input = 'w-full border border-stone-200 bg-stone-50 focus:bg-white px-4 py-3 rounded-xl text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all';

function EditProduct() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [fileName,  setFileName]  = useState('');

  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', quantity: 0,
    category: 'phones', status: true, image: null, featuredImage: '',
  });

  useEffect(() => {
    if (!slug) return;
    databaseService.getProduct(slug).then((p) => {
      if (p) {
        setForm({
          name: p.name, slug: p.$id, description: p.description,
          price: p.price, quantity: p.quantity, category: p.category,
          status: p.status, featuredImage: p.featuredImage, image: null,
        });
      } else {
        navigate('/products');
      }
    }).finally(() => setFetching(false));
  }, [slug, navigate]);

  const onChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setForm((p) => ({ ...p, [name]: file }));
      setFileName(file?.name ?? '');
    } else if (type === 'checkbox') {
      setForm((p) => ({ ...p, [name]: checked }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let fileId = form.featuredImage;
      if (form.image) {
        const file = await databaseService.uploadFile(form.image);
        if (file) fileId = file.$id;
      }
      const result = await databaseService.updateProduct(slug, {
        name:          form.name,
        description:   form.description,
        price:         parseFloat(form.price),
        quantity:      parseInt(form.quantity),
        category:      form.category,
        status:        form.status,
        featuredImage: fileId,
      });
      if (result) { setSuccess(true); setTimeout(() => navigate('/products'), 1200); }
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-amber-500" size={32} />
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
      <div className="bg-white rounded-3xl border border-stone-100 p-10 text-center max-w-sm w-full">
        <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Product updated!</h2>
        <p className="text-stone-400 text-sm">Redirecting to products…</p>
      </div>
    </div>
  );

  return (
    <div className="page-enter p-6 md:p-8 max-w-3xl mx-auto space-y-5">

      <div>
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-4">
          <ArrowLeft size={14} /> Back to products
        </Link>
        <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-0.5">Inventory</p>
        <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>Edit product</h1>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-6 md:p-8">

        {/* Product ID badge */}
        <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-2.5 mb-6">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Product ID</p>
          <p className="font-mono text-xs text-stone-700">{form.slug}</p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-6 text-sm text-rose-700">
            <AlertCircle size={15} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Product name" htmlFor="name">
            <input id="name" name="name" type="text" required value={form.name} onChange={onChange} className={input} />
          </Field>

          <Field label="Description" htmlFor="description">
            <textarea id="description" name="description" required rows={4} value={form.description} onChange={onChange} className={input} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Price ($)" htmlFor="price">
              <input id="price" name="price" type="number" required min="0" step="0.01" value={form.price} onChange={onChange} className={input} />
            </Field>
            <Field label="Stock qty" htmlFor="quantity">
              <input id="quantity" name="quantity" type="number" required min="0" step="1" value={form.quantity} onChange={onChange} className={input} />
            </Field>
            <Field label="Category" htmlFor="category">
              <select id="category" name="category" value={form.category} onChange={onChange} className={input}>
                {['phones','laptops','audio','wearables','cameras'].map((c) => (
                  <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Image */}
          <Field label="Product image">
            {form.featuredImage && (
              <div className="flex items-center gap-4 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 mb-3">
                <div className="h-14 w-14 rounded-lg bg-white border border-stone-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={databaseService.getFileView(form.featuredImage)}
                    alt="Current"
                    className="h-full w-full object-contain mix-blend-multiply p-1"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-700">Current image</p>
                  <p className="text-xs text-stone-400">Upload a new file to replace it.</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <input type="file" name="image" id="image" accept="image/*" className="hidden" onChange={onChange} />
              <label htmlFor="image"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-stone-200 hover:border-stone-400 text-stone-700 rounded-xl text-sm font-semibold cursor-pointer transition-colors">
                <UploadCloud size={16} /> {form.featuredImage ? 'Change image' : 'Choose file'}
              </label>
              {fileName && <span className="text-sm text-stone-500 truncate max-w-xs">{fileName}</span>}
            </div>
          </Field>

          {/* Status toggle */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <input type="checkbox" id="status" name="status" checked={form.status} onChange={onChange} className="sr-only peer" />
              <label htmlFor="status"
                className="flex h-5 w-9 cursor-pointer items-center rounded-full bg-stone-200 peer-checked:bg-amber-400 transition-colors relative">
                <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </label>
            </div>
            <label htmlFor="status" className="text-sm font-medium text-stone-700 cursor-pointer select-none">
              Active — visible in store
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-stone-900/15 mt-2">
            {loading ? <><Loader2 className="animate-spin" size={16} /> Updating…</> : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
