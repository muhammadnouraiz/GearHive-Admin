/* src/pages/Login.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as authLogin } from '../store/authslice';
import { useDispatch } from 'react-redux';
import authService from '../services/auth';

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    // ✅ FIX 1: Check if user is already logged in when the page loads
    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const user = await authService.getCurrentUser();
                if (user) {
                    dispatch(authLogin(user));
                    navigate("/");
                }
            } catch (err) {
                // Not logged in, stay on page
            }
        };
        checkUserSession();
    }, [navigate, dispatch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const login = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const session = await authService.login(formData);
            
            if (session) {
                const userData = await authService.getCurrentUser();
                if (userData) {
                    dispatch(authLogin(userData));
                    navigate("/");
                }
            }
        } catch (error) {
            // ✅ FIX 2: Handle "Session Active" error specifically
            // If the session is already active, we just redirect the user
            if (error.message && error.message.includes("session is active")) {
                console.log("User already logged in, redirecting...");
                navigate("/");
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Common input styles
    const inputClasses = "flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow";

    return (
        <div className='flex items-center justify-center w-full min-h-screen bg-gray-50 p-4'>
            <div className={`mx-auto w-full max-w-md bg-white rounded-2xl p-8 shadow-xl`}>
                
                <div className="mb-8 text-center">
                    <h1 className="text-2xl text-gray-800">
                        <span className="font-medium">GearHive</span> <span className="font-bold">Admin</span>
                    </h1>
                    <h2 className="text-3xl font-bold mt-2 text-gray-900 leading-tight">Sign in to your account</h2>
                </div>
                
                {error && <p className="text-red-600 mb-6 text-center bg-red-50 p-2 rounded border border-red-100 text-sm">{error}</p>}
                
                <form onSubmit={login} className='mt-8'>
                    <div className='space-y-5'>
                        <div>
                            <label htmlFor="email" className='block text-sm font-medium text-gray-700 mb-1'>Email:</label>
                            <input
                                id="email"
                                placeholder="Enter your email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            />
                        </div>
                        <div>
                             <label htmlFor="password" className='block text-sm font-medium text-gray-700 mb-1'>Password:</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;