/* src/pages/ProductsList.jsx */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import databaseService from '../services/database';
// Import icons from lucide-react
import { Plus, Pencil, Trash2 } from 'lucide-react';
import TempNavbar from '../components/TempNavbar';

function ProductsList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await databaseService.getProducts();
            if (response) {
                setProducts(response.documents);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (product) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${product.name}"?`);
        if (!confirmDelete) return;

        try {
            if (product.featuredImage) {
                await databaseService.deleteFile(product.featuredImage);
            }
            await databaseService.deleteProduct(product.$id);
            setProducts((prev) => prev.filter((item) => item.$id !== product.$id));
        } catch (error) {
            alert("Failed to delete product");
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading products...</div>;

    return (
        // Main page background
        <div className="min-h-screen bg-gray-50 pb-8">
            <TempNavbar />
            
            {/* Centered container for main content with padding and margin */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
                {/* Main White Card Container */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    
                    {/* Card Header: Title and Add Button */}
                    <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b border-gray-200 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">All Products</h2>
                        <Link 
                            to="/add-product" 
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            <span>Add New Product</span>
                        </Link>
                    </div>

                    {/* Table Container */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-200">
                            {/* Table Header */}
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            
                            {/* Table Body */}
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="7">
                                            <div className="flex flex-col items-center justify-center p-16 text-center">
                                                <div className="h-24 w-24 text-gray-200 mb-4">
                                                    <Plus size={96} strokeWidth={0.5} />
                                                </div>
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
                                                <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
                                                <div className="mt-6">
                                                    <Link 
                                                        to="/add-product" 
                                                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                                                    >
                                                        <Plus size={16} strokeWidth={2.5} />
                                                        Add New Product
                                                    </Link>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.$id} className="hover:bg-gray-50/50 transition-colors group">
                                            {/* Image Cell */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                    <img 
                                                        src={databaseService.getFileView(product.featuredImage)} 
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                    />
                                                    <span className="text-xs text-gray-400 hidden">No IMG</span>
                                                </div>
                                            </td>
                                            
                                            {/* Name Cell */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            </td>
                                            
                                            {/* Price Cell */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">${product.price ? product.price.toFixed(2) : '0.00'}</div>
                                            </td>
                                            
                                            {/* Stock Cell */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    (product.quantity || 0) > 10 
                                                        ? 'bg-green-100 text-green-800'
                                                        : (product.quantity || 0) > 0
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {product.quantity || 0}
                                                </span>
                                            </td>
                                            
                                            {/* Category Cell */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 capitalize">{product.category}</div>
                                            </td>
                                            
                                            {/* Status Cell */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    product.status 
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${product.status ? 'bg-blue-600' : 'bg-gray-500'}`}></span>
                                                    {product.status ? 'Active' : 'Draft'}
                                                </span>
                                            </td>
                                            
                                            {/* Actions Cell */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* FIX: Removed opacity classes so buttons are always visible */}
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link 
                                                        to={`/edit-product/${product.$id}`}
                                                        className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} strokeWidth={2} />
                                                    </Link>
                                                    
                                                    <button 
                                                        onClick={() => handleDelete(product)}
                                                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} strokeWidth={2} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductsList;