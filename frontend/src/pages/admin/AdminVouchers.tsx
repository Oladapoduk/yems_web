import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, X, Tag, TrendingUp, Users, Calendar } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import {
    getAllVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    getVoucherStats,
    type Voucher,
    type CreateVoucherInput,
    type UpdateVoucherInput
} from '../../api/vouchers';

export default function AdminVouchers() {
    const queryClient = useQueryClient();
    const { token } = useAuthStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
    const [selectedVoucherStats, setSelectedVoucherStats] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateVoucherInput>({
        code: '',
        type: 'FIXED',
        value: 0,
        description: '',
        minimumOrder: 0,
        maxUses: null,
        oneTimePerUser: true,
        validFrom: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T23:59:59.999Z',
        isActive: true
    });

    // Fetch vouchers
    const { data: vouchers = [], isLoading } = useQuery({
        queryKey: ['admin-vouchers'],
        queryFn: () => getAllVouchers(token!),
        enabled: !!token
    });

    // Fetch stats for selected voucher
    const { data: stats } = useQuery({
        queryKey: ['voucher-stats', selectedVoucherStats],
        queryFn: () => getVoucherStats(selectedVoucherStats!, token!),
        enabled: !!selectedVoucherStats && !!token
    });

    // Create/Update voucher mutation
    const saveMutation = useMutation({
        mutationFn: async (data: CreateVoucherInput | UpdateVoucherInput) => {
            if (editingVoucher) {
                return updateVoucher(editingVoucher.id, data as UpdateVoucherInput, token!);
            } else {
                return createVoucher(data as CreateVoucherInput, token!);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
            closeModal();
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to save voucher');
        }
    });

    // Delete voucher mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteVoucher(id, token!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to delete voucher');
        }
    });

    const openModal = (voucher?: Voucher) => {
        if (voucher) {
            setEditingVoucher(voucher);
            setFormData({
                code: voucher.code,
                type: voucher.type,
                value: Number(voucher.value),
                description: voucher.description || '',
                minimumOrder: Number(voucher.minimumOrder),
                maxUses: voucher.maxUses,
                oneTimePerUser: voucher.oneTimePerUser,
                validFrom: new Date(voucher.validFrom).toISOString().split('.')[0] + '.000Z',
                validUntil: new Date(voucher.validUntil).toISOString().split('.')[0] + '.000Z',
                isActive: voucher.isActive
            });
        } else {
            setEditingVoucher(null);
            setFormData({
                code: '',
                type: 'FIXED',
                value: 0,
                description: '',
                minimumOrder: 0,
                maxUses: null,
                oneTimePerUser: true,
                validFrom: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T23:59:59.999Z',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVoucher(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this voucher?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Voucher Management</h1>
                    <p className="text-gray-600 mt-1">Create and manage discount vouchers</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                    <Plus className="h-5 w-5" />
                    New Voucher
                </button>
            </div>

            {/* Vouchers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uses</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {vouchers.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                    <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No vouchers yet. Create your first voucher to get started.</p>
                                </td>
                            </tr>
                        ) : (
                            vouchers.map((voucher) => (
                                <tr key={voucher.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Tag className="h-4 w-4 text-primary-500 mr-2" />
                                            <span className="font-mono font-medium text-gray-900">{voucher.code}</span>
                                        </div>
                                        {voucher.description && (
                                            <p className="text-xs text-gray-500 mt-1">{voucher.description}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            voucher.type === 'FIXED'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-purple-100 text-purple-800'
                                        }`}>
                                            {voucher.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {voucher.type === 'FIXED'
                                            ? `£${Number(voucher.value).toFixed(2)}`
                                            : `${voucher.value}%`
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        £{Number(voucher.minimumOrder).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => setSelectedVoucherStats(voucher.id)}
                                            className="text-primary-600 hover:text-primary-800"
                                        >
                                            {voucher.currentUses} / {voucher.maxUses || '∞'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(voucher.validUntil).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            voucher.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {voucher.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openModal(voucher)}
                                            className="text-primary-600 hover:text-primary-900 mr-4"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(voucher.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingVoucher ? 'Edit Voucher' : 'Create Voucher'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Voucher Code *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-mono"
                                        placeholder="e.g., SAVE10"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type *
                                    </label>
                                    <select
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'FIXED' | 'PERCENTAGE' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="FIXED">Fixed Amount (£)</option>
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Value *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max={formData.type === 'PERCENTAGE' ? 100 : undefined}
                                        step="0.01"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        placeholder={formData.type === 'FIXED' ? '10.00' : '15'}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        rows={2}
                                        placeholder="Brief description of the voucher"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Minimum Order (£)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.minimumOrder}
                                        onChange={(e) => setFormData({ ...formData, minimumOrder: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Maximum Uses
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.maxUses || ''}
                                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Unlimited"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valid From *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.validFrom.substring(0, 16)}
                                        onChange={(e) => setFormData({ ...formData, validFrom: new Date(e.target.value).toISOString() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valid Until *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.validUntil.substring(0, 16)}
                                        onChange={(e) => setFormData({ ...formData, validUntil: new Date(e.target.value).toISOString() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.oneTimePerUser}
                                            onChange={(e) => setFormData({ ...formData, oneTimePerUser: e.target.checked })}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">One-time use per customer</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={saveMutation.isPending}
                                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {saveMutation.isPending ? 'Saving...' : (editingVoucher ? 'Update Voucher' : 'Create Voucher')}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Stats Modal */}
            {selectedVoucherStats && stats && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Voucher Statistics</h3>
                            <button onClick={() => setSelectedVoucherStats(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center">
                                    <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                                    <span className="text-sm text-gray-600">Total Uses</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{stats.totalUses}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center">
                                    <Users className="h-5 w-5 text-green-600 mr-3" />
                                    <span className="text-sm text-gray-600">Unique Users</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{stats.uniqueUsers}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                                <div className="flex items-center">
                                    <Tag className="h-5 w-5 text-purple-600 mr-3" />
                                    <span className="text-sm text-gray-600">Total Discount Given</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">£{stats.totalDiscountGiven.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-orange-600 mr-3" />
                                    <span className="text-sm text-gray-600">Avg Discount/Use</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">£{stats.averageDiscountPerUse.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
