import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import api from '../../services/api';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    priceType: 'FIXED' | 'PER_KG';
    stockQuantity: number;
    isAvailable: boolean;
    imageUrls: string[];
    category: {
        id: string;
        name: string;
    };
}

interface Category {
    id: string;
    name: string;
}

export default function AdminProducts() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        categoryId: '',
        price: '',
        priceType: 'FIXED' as 'FIXED' | 'PER_KG',
        weightMin: '',
        weightMax: '',
        stockQuantity: '',
        isAvailable: true,
        allergens: '',
        storageInstructions: '',
        imageUrls: [] as string[]
    });

    // Fetch products
    const { data: productsData, isLoading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: async () => {
            const response = await api.get('/products');
            return response.data;
        }
    });

    // Fetch categories
    const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories');
            return response.data;
        }
    });

    // Extract categories array from response
    const categories = categoriesData?.categories || [];

    console.log('Categories loaded:', categoriesData); // Debug log
    console.log('Categories array:', categories); // Debug log
    console.log('Modal open state:', isModalOpen); // Debug log

    // Create/Update product mutation
    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingProduct) {
                return api.put(`/products/${editingProduct.id}`, data);
            } else {
                return api.post('/products', data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            closeModal();
        }
    });

    // Delete product mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        }
    });

    const openModal = (product?: Product) => {
        try {
            console.log('Opening modal for product:', product); // Debug log
            setError(null); // Clear any previous errors

            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';

            if (product) {
                setEditingProduct(product);
                setFormData({
                    name: product.name,
                    slug: product.slug,
                    description: product.description || '',
                    categoryId: product.category?.id || '',
                    price: product.price.toString(),
                    priceType: product.priceType,
                    weightMin: '',
                    weightMax: '',
                    stockQuantity: product.stockQuantity.toString(),
                    isAvailable: product.isAvailable,
                    allergens: '',
                    storageInstructions: '',
                    imageUrls: product.imageUrls || []
                });
            } else {
                setEditingProduct(null);
                setFormData({
                    name: '',
                    slug: '',
                    description: '',
                    categoryId: '',
                    price: '',
                    priceType: 'FIXED',
                    weightMin: '',
                    weightMax: '',
                    stockQuantity: '',
                    isAvailable: true,
                    allergens: '',
                    storageInstructions: '',
                    imageUrls: []
                });
            }

            setIsModalOpen(true);
            console.log('Modal should be open now');
        } catch (err) {
            console.error('Error opening modal:', err);
            setError('Failed to open product form');
            alert('Failed to open product form. Check console for details.');
        }
    };

    const closeModal = () => {
        // Re-enable body scroll
        document.body.style.overflow = 'unset';

        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const formDataObj = new FormData();

        Array.from(files).forEach(file => {
            formDataObj.append('images', file);
        });

        try {
            const response = await api.post('/upload/images', formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData(prev => ({
                ...prev,
                imageUrls: [...prev.imageUrls, ...response.data.urls]
            }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (url: string) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter(u => u !== url)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            ...formData,
            price: parseFloat(formData.price),
            stockQuantity: parseInt(formData.stockQuantity),
            allergens: formData.allergens.split(',').map(a => a.trim()).filter(Boolean),
            weightMin: formData.weightMin ? parseFloat(formData.weightMin) : undefined,
            weightMax: formData.weightMax ? parseFloat(formData.weightMax) : undefined
        };

        saveMutation.mutate(data);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
                <button
                    type="button"
                    onClick={() => {
                        console.log('Add Product button clicked');
                        openModal();
                    }}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Product
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12">Loading products...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {productsData?.products?.map((product: Product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {product.imageUrls?.[0] && (
                                                <img
                                                    src={product.imageUrls[0]}
                                                    alt={product.name}
                                                    className="h-10 w-10 rounded-md object-cover mr-3"
                                                />
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.category?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        £{Number(product.price).toFixed(2)}
                                        {product.priceType === 'PER_KG' && '/kg'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.stockQuantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            product.isAvailable
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {product.isAvailable ? 'Available' : 'Unavailable'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log('Edit clicked for:', product.name);
                                                openModal(product);
                                            }}
                                            className="text-primary-600 hover:text-primary-900 mr-4 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-primary-50"
                                            title="Edit product"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDelete(product.id, product.name);
                                            }}
                                            className="text-red-600 hover:text-red-900 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
                                            title="Delete product"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Product Form Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
                    style={{ zIndex: 9999 }}
                    onClick={(e) => {
                        // Close modal if clicking on backdrop
                        if (e.target === e.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        style={{ position: 'relative', zIndex: 10000 }}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Debug info */}
                            {categoriesLoading && (
                                <div className="text-sm text-gray-500">Loading categories...</div>
                            )}
                            {!categories && !categoriesLoading && (
                                <div className="text-sm text-red-500">Failed to load categories</div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.name}
                                    onChange={e => {
                                        setFormData({ ...formData, name: e.target.value });
                                        if (!editingProduct) {
                                            setFormData(prev => ({
                                                ...prev,
                                                slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                            }));
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.categoryId}
                                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    <option value="">Select category</option>
                                    {categories?.map((cat: Category) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Type *</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        value={formData.priceType}
                                        onChange={e => setFormData({ ...formData, priceType: e.target.value as any })}
                                    >
                                        <option value="FIXED">Fixed Price</option>
                                        <option value="PER_KG">Price per KG</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.stockQuantity}
                                    onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Allergens (comma-separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., fish, shellfish, dairy"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.allergens}
                                    onChange={e => setFormData({ ...formData, allergens: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {formData.imageUrls.map((url, index) => (
                                            <div key={index} className="relative">
                                                <img src={url} alt="" className="h-20 w-20 object-cover rounded-lg" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(url)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <Upload className="h-5 w-5" />
                                        {uploading ? 'Uploading...' : 'Upload Images'}
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={formData.isAvailable}
                                    onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                                />
                                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                                    Product is available for purchase
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={saveMutation.isPending}
                                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {saveMutation.isPending ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
