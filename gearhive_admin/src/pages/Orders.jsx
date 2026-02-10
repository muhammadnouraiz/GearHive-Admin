/* src/pages/Orders.jsx */
import React, { useState, useEffect } from 'react';
import databaseService from '../services/database';
import { useNavigate } from 'react-router-dom'; 
import { Eye, Search, Filter, ChevronDown } from 'lucide-react';
import TempNavbar from '../components/TempNavbar'; // ✅ Import Navbar

function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [sortConfig, setSortConfig] = useState("newest");
    const [statusFilter, setStatusFilter] = useState("all"); 

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await databaseService.getOrders();
                if (response) {
                    const formattedOrders = response.documents.map(doc => {
                        // Ensure we get a number. If missing, default to 0.
                        const count = doc.items_count ? parseInt(doc.items_count) : 0;
                        return {
                            id: doc.$id, 
                            customer: doc.customer_name, 
                            rawDate: new Date(doc.$createdAt), 
                            displayDate: new Date(doc.$createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
                            total: doc.total_amount,
                            status: doc.status || "Processing",
                            items: count
                        };
                    });
                    setOrders(formattedOrders);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Filter Logic
    const filteredOrders = orders.filter((order) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = order.customer.toLowerCase().includes(term) || order.id.toLowerCase().includes(term);
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        if (sortConfig === "newest") return b.rawDate - a.rawDate;
        if (sortConfig === "oldest") return a.rawDate - b.rawDate;
        if (sortConfig === "items-high") return b.items - a.items;
        if (sortConfig === "items-low") return a.items - b.items;
        return 0;
    });

    const getStatusColor = (s) => {
        const lower = s ? s.toLowerCase() : '';
        if (lower === 'delivered') return 'bg-green-100 text-green-700 border-green-200';
        if (lower === 'shipped') return 'bg-blue-100 text-blue-700 border-blue-200';
        if (lower === 'processing') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        if (lower === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading orders...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ✅ Added Navbar */}
            <TempNavbar />

            <div className="p-8 flex justify-center">
                <div className="w-full max-w-350 bg-white shadow-lg rounded-2xl p-8 h-fit">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <h2 className="text-3xl font-bold text-gray-900">Recent Orders</h2>
                        <div className="flex gap-3 w-full md:w-auto relative">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" placeholder="Search ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div className="relative">
                                <button onClick={() => setShowFilterMenu(!showFilterMenu)} className="flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-gray-50 font-medium transition-colors border-gray-300 text-gray-700">
                                    <Filter size={18} /> Filter <ChevronDown size={14} />
                                </button>
                                {showFilterMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-1">
                                        <button onClick={() => { setSortConfig("newest"); setShowFilterMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Newest First</button>
                                        <button onClick={() => { setSortConfig("items-high"); setShowFilterMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Highest Quantity</button>
                                        
                                        <div className="border-t my-1"></div>
                                        <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase">Status</div>
                                        <button onClick={() => { setStatusFilter("all"); setShowFilterMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">All</button>
                                        <button onClick={() => { setStatusFilter("Processing"); setShowFilterMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Processing</button>
                                        <button onClick={() => { setStatusFilter("Shipped"); setShowFilterMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Shipped</button>
                                        <button onClick={() => { setStatusFilter("Delivered"); setShowFilterMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Delivered</button>
                                        <button onClick={() => { setStatusFilter("Cancelled"); setShowFilterMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Cancelled</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="p-4 pl-6">Order ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Items</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.length === 0 ? (
                                    <tr><td colSpan="7" className="p-8 text-center text-gray-500">No orders found.</td></tr>
                                ) : filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 pl-6 font-semibold text-blue-600 text-sm">#{order.id.substring(0, 8)}...</td>
                                        <td className="p-4 font-medium text-gray-900">{order.customer}</td>
                                        <td className="p-4 text-gray-500 text-sm">{order.displayDate}</td>
                                        <td className="p-4 text-gray-500 text-sm">{order.items} items</td>
                                        <td className="p-4 font-semibold text-gray-900">${order.total ? order.total.toFixed(2) : '0.00'}</td>
                                        <td className="p-4"><span className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                        <td className="p-4 pr-6 text-right">
                                            <button onClick={() => navigate(`/orders/${order.id}`)} className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50">
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Orders;