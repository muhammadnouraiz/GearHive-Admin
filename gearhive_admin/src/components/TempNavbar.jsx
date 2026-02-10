/* src/components/TempNavbar.jsx */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function TempNavbar() {
    const location = useLocation();

    // Helper to style active tab with blue button-like hover effects
    const getLinkClass = (path) => {
        // Check if the current path matches the link path
        // Using exact match for root '/' to avoid it always being active,
        // startsWith for others to keep them active on sub-routes (e.g., /orders/5)
        const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

        // Base classes: define shape, padding, and smooth transitions
        const baseClasses = "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out";

        if (isActive) {
            // Active state: Solid blue background with white text for strong emphasis
            return `${baseClasses} bg-blue-600 text-white shadow-md`;
        } else {
            // Inactive state: Gray text normally, light blue background and blue text on hover
            return `${baseClasses} text-gray-600 hover:bg-blue-50 hover:text-blue-600`;
        }
    };

    return (
        // ✅ Added 'sticky top-0 z-50' to make it stick to the top
        <nav className="sticky top-0 z-50 bg-white py-6 px-8 border-b border-gray-100 shadow-sm">
            <div className="max-w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* Brand Area */}
                <div className="text-center md:text-left">
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-sm text-gray-500">Store Management</p>
                </div>

                {/* Navigation Links */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    {/* Adjust '/' to whatever your main dashboard route is */}
                    <Link to="/" className={getLinkClass('/')}>
                        Dashboard
                    </Link>

                    <Link to="/add-product" className={getLinkClass('/add-product')}>
                        Add Product
                    </Link>

                    <Link to="/products" className={getLinkClass('/products')}>
                        Products
                    </Link>

                    <Link to="/orders" className={getLinkClass('/orders')}>
                        Orders
                    </Link>

                </div>
            </div>
        </nav>
    );
}

export default TempNavbar;