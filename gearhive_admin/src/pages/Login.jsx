/* src/pages/Login.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as authLogin } from '../store/authslice';
import { useDispatch } from 'react-redux';
import authService from '../services/auth';
import { Loader2, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';

const inputCls = 'w-full border border-stone-200 bg-stone-50 focus:bg-white px-4 py-3 rounded-xl text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [form,    setForm]    = useState({ email: '', password: '' });

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      if (u) { dispatch(authLogin(u)); navigate('/'); }
    }).catch(() => {});
  }, [navigate, dispatch]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await authService.login(form);
      if (session) {
        const u = await authService.getCurrentUser();
        if (u) { dispatch(authLogin(u)); navigate('/'); }
      }
    } catch (err) {
      if (err.message?.includes('session is active')) {
        navigate('/');
      } else {
        setError(err.message || 'Invalid credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-400 mb-4 shadow-lg shadow-amber-200">
            <span className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>G</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>
            GearHive Admin
          </h1>
          <p className="text-stone-400 text-sm mt-1">Sign in to manage your store</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 p-8 shadow-sm">

          {/* Admin notice */}
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-6">
            <Shield size={14} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 font-medium">Restricted to authorised admins only</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-100 rounded-xl px-3.5 py-3 mb-5 text-sm text-rose-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                id="email" name="email" type="email" required
                placeholder="admin@gearhive.com"
                value={form.email} onChange={onChange}
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password" name="password"
                  type={showPw ? 'text' : 'password'} required
                  placeholder="Your password"
                  value={form.password} onChange={onChange}
                  className={inputCls + ' pr-11'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full mt-2 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-stone-900/15"
            >
              {loading
                ? <><Loader2 className="animate-spin" size={16} /> Signing in…</>
                : 'Sign in to admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
