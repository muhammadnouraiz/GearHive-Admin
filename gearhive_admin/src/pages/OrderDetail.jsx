/* src/pages/OrderDetail.jsx */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import databaseService from '../services/database';
import { Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Save, Trash2 } from 'lucide-react';
import TempNavbar from '../components/TempNavbar';

function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState(""); 
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (id) {
                const data = await databaseService.getOrder(id);
                if (data) {
                    setOrder(data);
                    setSelectedStatus(data.status); 
                }
            }
            setLoading(false);
        };
        fetchOrder();
    }, [id]);

    const saveStatus = async () => {
        if (selectedStatus === order.status) return; 
        setUpdating(true);
        try {
            await databaseService.updateOrderStatus(id, selectedStatus);
            setOrder({ ...order, status: selectedStatus }); 
            alert("Status updated successfully!");
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status.");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this order? This action cannot be undone.");
        if (!confirmDelete) return;

        setDeleting(true);
        try {
            const success = await databaseService.deleteOrder(id);
            if (success) {
                alert("Order deleted successfully.");
                navigate('/orders'); 
            } else {
                throw new Error("Delete failed");
            }
        } catch (error) {
            console.error("Failed to delete order", error);
            alert("Failed to delete order.");
            setDeleting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading details...</div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center text-red-500">Order not found</div>;

    const safeItemCount = order.items_count || order.item_count || 0;

    const getStatusColor = (status) => {
        const s = status ? status.toLowerCase() : '';
        if (s === 'delivered') return 'bg-green-100 text-green-700 border-green-200';
        if (s === 'shipped') return 'bg-blue-100 text-blue-700 border-blue-200';
        if (s === 'processing') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        if (s === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <TempNavbar />

            {/* Centered Container */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-8">
                
                {/* Main Header Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">Order #{order.$id.substring(0, 8)}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                            <Clock size={16} /> Placed on {new Date(order.$createdAt).toLocaleDateString()} at {new Date(order.$createdAt).toLocaleTimeString()}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Delete Button */}
                        <button 
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                        >
                            {deleting ? "Deleting..." : <><Trash2 size={18} /> Delete Order</>}
                        </button>
                        
                        {/* Status Dropdown & Save */}
                        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                            <span className="text-sm font-medium text-gray-700 pl-2">Status:</span>
                            <select 
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 cursor-pointer hover:bg-gray-50 transition"
                            >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <button
                                onClick={saveStatus}
                                disabled={updating || selectedStatus === order.status}
                                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-white transition-colors
                                    ${updating || selectedStatus === order.status 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-sm'}`}
                            >
                                {updating ? 'Saving...' : <>Save</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Items Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Package className="text-blue-600" size={20} /> Items ({safeItemCount})
                            </h2>
                            <div className="divide-y divide-gray-100">
                                <div className="py-4 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Order Summary</p>
                                            <p className="text-sm text-gray-500">{safeItemCount} Item(s)</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-gray-900">${order.total_amount.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Total Amount</span>
                                <span className="text-2xl font-bold text-gray-900">${order.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer, Shipping, Payment */}
                    <div className="space-y-6">
                        
                        {/* Customer Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="text-green-600" size={20} /> Customer
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                        {order.customer_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{order.customer_name}</p>
                                        <p className="text-xs text-gray-500">Customer ID: {order.$id.substring(0, 6)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Truck className="text-orange-600" size={20} /> Shipping
                            </h2>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <MapPin size={18} className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Delivery Address</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {order.address ? order.address : "No address provided"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="text-purple-600" size={20} /> Payment
                            </h2>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Status</span>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded border border-green-200 uppercase">
                                    {order.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetail;