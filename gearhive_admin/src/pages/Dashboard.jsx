/* src/pages/Dashboard.jsx */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth';
import databaseService from '../services/database';
import { logout } from '../store/authslice';
import { 
    Package, 
    ShoppingCart, 
    Plus, 
    LogOut, 
    Box, 
    UserCircle2,
    Loader2,
    DollarSign,
    Lock
} from 'lucide-react';

function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const [stats, setStats] = useState({
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);

    // Redirect or show message if not logged in
    useEffect(() => {
        if (!userData) {
            setLoading(false); // Stop loading so we can show the "Login first" UI
        } else {
            fetchDashboardData();
        }
    }, [userData]);

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Orders
            const ordersReq = await databaseService.getOrders();
            const orders = ordersReq ? ordersReq.documents : [];
            
            // Calculate total revenue
            const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

            // 2. Fetch Products
            const productsReq = await databaseService.getProducts();
            const products = productsReq ? productsReq.documents : [];

            setStats({
                totalOrders: orders.length,
                totalProducts: products.length,
                totalRevenue: totalRevenue,
                // Take the first 5 for the "Recent Orders" table
                recentOrders: orders.slice(0, 5)
            });
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            dispatch(logout());
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // If user is not logged in, show this UI
    if (!userData) {
        return (
            <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg text-center border border-gray-100">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-blue-600 h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                    <p className="text-gray-500 mb-6">You must be logged in to access the admin dashboard.</p>
                    <Link 
                        to="/login" 
                        className="inline-block w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F7F9]">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-md">
                        <Box className="text-white h-6 w-6" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">GearHive Admin</h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        {userData?.avatar ? (
                            <img src={userData.avatar} alt="Profile" className="w-8 h-8 rounded-full" />
                        ) : (
                            <UserCircle2 className="w-8 h-8 text-gray-400" />
                        )}
                        <span className="text-gray-600 font-medium">
                            {userData?.name || 'Admin'}
                        </span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        Logout <LogOut size={16} />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Dashboard Overview</h2>
                </div>

                {/* Top Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    
                    {/* Card 1: Add Product (Blue) */}
                    <div className="bg-blue-500 p-6 rounded-2xl shadow-sm text-white flex flex-col items-center justify-center text-center h-full">
                        <div className="bg-blue-400 p-4 rounded-full mb-4">
                            <Plus className="text-white h-8 w-8" strokeWidth={2} />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Add New Product</h3>
                        <Link 
                            to="/add-product" 
                            className="mt-4 bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg hover:bg-blue-50 transition shadow-sm"
                        >
                            Add Product
                        </Link>
                    </div>

                    {/* Card 2: Inventory Stats (Green/Gold Theme) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-xl text-gray-800 mb-1">Inventory</h3>
                                <p className="text-gray-500 text-sm">Total Items Available</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                                <Package className="text-green-600 h-6 w-6" strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="mb-4">
                            {loading ? (
                                <Loader2 className="animate-spin text-gray-400 h-8 w-8" />
                            ) : (
                                <span className="text-5xl font-bold text-gray-900">{stats.totalProducts}</span>
                            )}
                        </div>
                        <Link 
                            to="/products" 
                            className="w-full sm:w-auto mt-4 inline-block bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition shadow-sm text-center"
                        >
                            View Inventory
                        </Link>
                    </div>

                    {/* Card 3: Orders Stats (Green/Gold Theme) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-xl text-gray-800 mb-1">Orders</h3>
                                <p className="text-gray-500 text-sm">Total Orders Placed</p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                                <ShoppingCart className="text-yellow-600 h-6 w-6" strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="mb-4">
                            {loading ? (
                                <Loader2 className="animate-spin text-gray-400 h-8 w-8" />
                            ) : (
                                <span className="text-5xl font-bold text-gray-900">{stats.totalOrders}</span>
                            )}
                        </div>
                        <Link 
                            to="/orders" 
                            className="w-full sm:w-auto mt-4 inline-block bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-yellow-700 transition shadow-sm text-center"
                        >
                            View Orders
                        </Link>
                    </div>
                </div>

                {/* Total Revenue Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                            <DollarSign className="text-purple-600 h-6 w-6" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Total Revenue</h3>
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <Loader2 className="animate-spin text-gray-400 h-8 w-8" />
                        ) : (
                            <div>
                                <span className="text-5xl font-bold text-gray-900">
                                    ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <p className="text-gray-500 mt-2">Total Earnings from Sales</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;