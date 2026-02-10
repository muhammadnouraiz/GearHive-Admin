/* src/pages/EditProduct.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import databaseService from '../services/database';
import { UploadCloud } from 'lucide-react';
import TempNavbar from '../components/TempNavbar';

function EditProduct() {
    const { slug } = useParams(); // Get the product ID from URL
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('No new file chosen');

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price: '',
        quantity: 0, 
        category: 'phones',
        status: true,
        image: null,       // For new upload
        featuredImage: ''  // Stores existing image ID
    });

    // 1. Fetch existing product data
    useEffect(() => {
        if (slug) {
            databaseService.getProduct(slug).then((post) => {
                if (post) {
                    setFormData({
                        name: post.name,
                        slug: post.$id, // Document ID
                        description: post.description,
                        price: post.price,
                        quantity: post.quantity,
                        category: post.category,
                        status: post.status,
                        featuredImage: post.featuredImage, 
                        image: null 
                    });
                } else {
                    navigate('/products');
                }
            });
        }
    }, [slug, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            setFormData({ ...formData, [name]: file });
            setFileName(file ? file.name : 'No new file chosen');
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 2. Handle Image: Use new one if uploaded, otherwise keep old one
            let fileId = formData.featuredImage;

            if (formData.image) {
                const file = await databaseService.uploadFile(formData.image);
                if (file) {
                    fileId = file.$id;
                    // Optional: Delete old image here if you want to save storage
                    // await databaseService.deleteFile(formData.featuredImage); 
                }
            }

            // 3. Update Product
            const dbPost = await databaseService.updateProduct(slug, {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                category: formData.category,
                status: formData.status,
                featuredImage: fileId,
            });

            if (dbPost) {
                navigate('/products');
            }
        } catch (err) {
            setError(err.message || "Failed to update product");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors bg-gray-50";

    return (
        <div className="min-h-screen bg-gray-50">
            <TempNavbar />

            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-10">
                    <h2 className="text-2xl font-bold mb-8 text-gray-900 border-b pb-4">Edit Product</h2>
                    
                    {error && <p className="text-red-500 mb-6 bg-red-50 p-4 rounded-lg border border-red-100">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Read-only ID Display */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <label className="block text-xs font-bold text-blue-500 uppercase">Product ID</label>
                            <p className="font-mono text-sm text-blue-800">{formData.slug}</p>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                            <input type="text" name="name" id="name" required className={inputClass} value={formData.name} onChange={handleChange} />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea name="description" id="description" required rows="4" className={inputClass} value={formData.description} onChange={handleChange}></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                                <input type="number" name="price" id="price" required min="0" step="0.01" className={inputClass} value={formData.price} onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                                <input type="number" name="quantity" id="quantity" required min="0" step="1" className={inputClass} value={formData.quantity} onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select name="category" id="category" className={inputClass} value={formData.category} onChange={handleChange}>
                                    <option value="phones">Phones</option>
                                    <option value="laptops">Laptops</option>
                                    <option value="audio">Audio</option>
                                    <option value="wearables">Wearables</option>
                                    <option value="cameras">Cameras</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                            
                            {/* Current Image Preview */}
                            {formData.featuredImage && (
                                <div className="mb-4 flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <img 
                                        src={databaseService.getFileView(formData.featuredImage)}
                                        alt="Current" 
                                        className="h-16 w-16 object-cover rounded-md border border-gray-300"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Current Image</p>
                                        <p className="text-xs text-gray-500">Upload a new file to replace this.</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center">
                                <input type="file" name="image" id="image" accept="image/png, image/jpg, image/jpeg, image/gif" className="hidden" onChange={handleChange} />
                                <label htmlFor="image" className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-blue-600 rounded-md text-blue-600 font-medium hover:bg-blue-50 transition-colors focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <UploadCloud size={20} /> {formData.featuredImage ? "Change File" : "Choose File"}
                                </label>
                                <span className="ml-3 text-sm text-gray-500">{fileName}</span>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input type="checkbox" name="status" id="status" checked={formData.status} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors" />
                            <label htmlFor="status" className="ml-2 block text-sm font-medium text-gray-900 select-none">Active (Visible in Store)</label>
                        </div>

                        <button type="submit" disabled={loading} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}`}>
                            {loading ? "Updating..." : "Update Product"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditProduct;