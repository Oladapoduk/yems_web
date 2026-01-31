import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Edit, Trash2, Loader2, Save, X } from 'lucide-react';
import api from '../../services/api';

interface DeliveryZone {
    id: string;
    name: string;
    postcodePrefixes: string[];
    deliveryFee: number;
    minimumOrder: number;
    isActive: boolean;
}

export default function AdminDeliveryZones() {
    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        postcodePrefixes: '',
        deliveryFee: '',
        minimumOrder: '',
        isActive: true
    });

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            setLoading(true);
            const response = await api.get('/delivery-zones');
            setZones(response.data || []);
        } catch (error) {
            console.error('Failed to fetch delivery zones:', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (zone?: DeliveryZone) => {
        if (zone) {
            setEditingZone(zone);
            setFormData({
                name: zone.name,
                postcodePrefixes: zone.postcodePrefixes.join(', '),
                deliveryFee: zone.deliveryFee.toString(),
                minimumOrder: zone.minimumOrder.toString(),
                isActive: zone.isActive
            });
        } else {
            setEditingZone(null);
            setFormData({
                name: '',
                postcodePrefixes: '',
                deliveryFee: '',
                minimumOrder: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingZone(null);
        setFormData({
            name: '',
            postcodePrefixes: '',
            deliveryFee: '',
            minimumOrder: '',
            isActive: true
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = {
                name: formData.name,
                postcodePrefixes: formData.postcodePrefixes
                    .split(',')
                    .map(p => p.trim().toUpperCase())
                    .filter(p => p.length > 0),
                deliveryFee: parseFloat(formData.deliveryFee),
                minimumOrder: parseFloat(formData.minimumOrder),
                isActive: formData.isActive
            };

            if (editingZone) {
                await api.put(`/delivery-zones/admin/${editingZone.id}`, data);
            } else {
                await api.post('/delivery-zones/admin', data);
            }

            await fetchZones();
            closeModal();
        } catch (error: any) {
            console.error('Failed to save zone:', error);
            alert(error.response?.data?.message || 'Failed to save delivery zone');
        } finally {
            setSaving(false);
        }
    };

    const deleteZone = async (zoneId: string) => {
        if (!confirm('Are you sure you want to delete this delivery zone?')) {
            return;
        }

        try {
            await api.delete(`/delivery-zones/${zoneId}`);
            await fetchZones();
        } catch (error) {
            console.error('Failed to delete zone:', error);
            alert('Failed to delete delivery zone');
        }
    };

    const toggleZoneStatus = async (zoneId: string, currentStatus: boolean) => {
        try {
            await api.patch(`/delivery-zones/${zoneId}`, {
                isActive: !currentStatus
            });
            await fetchZones();
        } catch (error) {
            console.error('Failed to update zone:', error);
            alert('Failed to update zone status');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Delivery Zones</h1>
                        <p className="text-gray-600 mt-1">Manage delivery areas, fees, and minimum orders</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/admin"
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Back to Dashboard
                        </Link>
                        <button
                            onClick={() => openModal()}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Delivery Zone
                        </button>
                    </div>
                </div>
            </div>

            {/* Zones List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            ) : zones.length === 0 ? (
                <div className="text-center py-12">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No delivery zones configured</h3>
                    <p className="text-gray-600 mb-6">Add your first delivery zone to start accepting orders</p>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Delivery Zone
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {zones.map((zone) => (
                        <div
                            key={zone.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-semibold text-gray-900">{zone.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${zone.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {zone.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Postcode Prefixes</p>
                                            <div className="flex flex-wrap gap-2">
                                                {zone.postcodePrefixes.map((prefix, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                                                    >
                                                        {prefix}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-1">Delivery Fee</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                £{Number(zone.deliveryFee).toFixed(2)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-1">Minimum Order</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                £{Number(zone.minimumOrder).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => toggleZoneStatus(zone.id, zone.isActive)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${zone.isActive
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                    >
                                        {zone.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => openModal(zone)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => deleteZone(zone.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingZone ? 'Edit Delivery Zone' : 'Add Delivery Zone'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Zone Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g., Central London, Outer London"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Postcode Prefixes *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.postcodePrefixes}
                                        onChange={(e) => setFormData({ ...formData, postcodePrefixes: e.target.value })}
                                        required
                                        placeholder="e.g., SE, SW, E, W (comma-separated)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Enter postcode prefixes separated by commas (e.g., SE, DA, BR, RM)
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Delivery Fee (£) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.deliveryFee}
                                            onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                                            required
                                            placeholder="5.00"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Order (£) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.minimumOrder}
                                            onChange={(e) => setFormData({ ...formData, minimumOrder: e.target.value })}
                                            required
                                            placeholder="30.00"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Zone is active and accepting orders
                                        </span>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5 mr-2" />
                                                {editingZone ? 'Update Zone' : 'Create Zone'}
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
