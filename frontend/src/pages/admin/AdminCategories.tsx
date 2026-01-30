import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Upload, X, Layers } from 'lucide-react';
import api from '../../services/api';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
    sortOrder: number;
    _count?: {
        products: number;
    };
}

export default function AdminCategories() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        imageUrl: '',
        parentId: '',
        sortOrder: 0
    });

    // Fetch categories
    const { data: categoriesData, isLoading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: async () => {
            const response = await api.get('/categories');
            return response.data;
        }
    });

    const categories: Category[] = categoriesData?.categories || [];

    // Create/Update category mutation
    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingCategory) {
                return api.put(`/categories/${editingCategory.id}`, data);
            } else {
                return api.post('/categories', data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            closeModal();
        }
    });

    // Delete category mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/categories/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || 'Failed to delete category');
        }
    });

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                slug: category.slug,
                description: category.description || '',
                imageUrl: category.imageUrl || '',
                parentId: category.parentId || '',
                sortOrder: category.sortOrder
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                slug: '',
                description: '',
                imageUrl: '',
                parentId: '',
                sortOrder: 0
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const formDataObj = new FormData();
        formDataObj.append('images', files[0]); // Only one image for category

        try {
            const response = await api.post('/upload/images', formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData(prev => ({
                ...prev,
                imageUrl: response.data.urls[0]
            }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate({
            ...formData,
            parentId: formData.parentId || null
        });
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete category "${name}"? This will fail if it has products.`)) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                        <Layers className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
                        <p className="text-gray-500">Organize your products into aisles</p>
                    </div>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                >
                    <Plus className="h-5 w-5" />
                    Add Category
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="h-12 w-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading categories...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Aisle / Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Products</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Sort Order</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden mr-4 border border-gray-100">
                                                {category.imageUrl ? (
                                                    <img src={category.imageUrl} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                        <Layers className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{category.name}</div>
                                                <div className="text-xs text-gray-500">{category.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            {category._count?.products || 0} items
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {category.sortOrder}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(category)}
                                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id, category.name)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                disabled={!!category._count?.products && category._count.products > 0}
                                                title={category._count?.products ? "Cannot delete category with products" : "Delete category"}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Category Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-2xl font-black text-gray-900">
                                {editingCategory ? 'Edit Category' : 'Create Category'}
                            </h2>
                            <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Aisle Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Seafood, Fresh Meat..."
                                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-primary-500 focus:ring-0 transition-all text-lg font-medium"
                                        value={formData.name}
                                        onChange={e => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (!editingCategory) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                                }));
                                            }
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">URL Slug</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50/50 focus:border-primary-500 focus:ring-0 transition-all font-mono text-sm"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Description</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-primary-500 focus:ring-0 transition-all font-medium"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Sort Order</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-primary-500 focus:ring-0 transition-all font-bold"
                                            value={formData.sortOrder}
                                            onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Image</label>
                                        <label className="flex flex-col items-center justify-center w-full h-12 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-all">
                                            <div className="flex items-center gap-2">
                                                <Upload className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs font-bold text-gray-500">
                                                    {formData.imageUrl ? 'Change Image' : 'Pick Image'}
                                                </span>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                </div>

                                {formData.imageUrl && (
                                    <div className="relative inline-block mt-2">
                                        <img src={formData.imageUrl} className="h-20 w-32 object-cover rounded-2xl border-2 border-gray-100" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, imageUrl: '' }))}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={saveMutation.isPending || uploading}
                                    className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-primary-700 disabled:opacity-50 shadow-xl shadow-primary-200 transition-all"
                                >
                                    {saveMutation.isPending ? 'Saving...' : (editingCategory ? 'Update Aisle' : 'Create Aisle')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
