import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Edit, Trash2, Loader2, Save, X, Clock } from 'lucide-react';
import api from '../../services/api';

interface DeliverySlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    maxOrders: number;
    currentBookings: number;
    isAvailable: boolean;
}

export default function AdminDeliverySlots() {
    const [slots, setSlots] = useState<DeliverySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<DeliverySlot | null>(null);
    const [saving, setSaving] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        maxOrders: '10',
        isAvailable: true
    });

    useEffect(() => {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        fetchSlots(today);
    }, []);

    const fetchSlots = async (date?: string) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (date) {
                params.append('date', date);
            }

            const response = await api.get(`/delivery-slots?${params.toString()}`);
            setSlots(response.data.slots || []);
        } catch (error) {
            console.error('Failed to fetch delivery slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (slot?: DeliverySlot) => {
        if (slot) {
            setEditingSlot(slot);
            setFormData({
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                maxOrders: slot.maxOrders.toString(),
                isAvailable: slot.isAvailable
            });
        } else {
            setEditingSlot(null);
            setFormData({
                date: selectedDate || new Date().toISOString().split('T')[0],
                startTime: '',
                endTime: '',
                maxOrders: '10',
                isAvailable: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSlot(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = {
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                maxOrders: parseInt(formData.maxOrders),
                isAvailable: formData.isAvailable
            };

            if (editingSlot) {
                await api.put(`/delivery-slots/admin/${editingSlot.id}`, data);
            } else {
                await api.post('/delivery-slots/admin', data);
            }

            await fetchSlots(selectedDate);
            closeModal();
        } catch (error: any) {
            console.error('Failed to save slot:', error);
            alert(error.response?.data?.message || 'Failed to save delivery slot');
        } finally {
            setSaving(false);
        }
    };

    const deleteSlot = async (slotId: string) => {
        if (!confirm('Are you sure you want to delete this delivery slot?')) {
            return;
        }

        try {
            await api.delete(`/delivery-slots/admin/${slotId}`);
            await fetchSlots(selectedDate);
        } catch (error) {
            console.error('Failed to delete slot:', error);
            alert('Failed to delete delivery slot');
        }
    };

    const toggleSlotStatus = async (slotId: string, currentStatus: boolean) => {
        try {
            await api.patch(`/delivery-slots/admin/${slotId}`, {
                isAvailable: !currentStatus
            });
            await fetchSlots(selectedDate);
        } catch (error) {
            console.error('Failed to update slot:', error);
            alert('Failed to update slot status');
        }
    };

    const createBulkSlots = async () => {
        if (!confirm('Create standard delivery slots for the next 7 days?\n\n9:00-12:00\n12:00-15:00\n15:00-18:00\n\n10 orders per slot')) {
            return;
        }

        try {
            setSaving(true);
            const today = new Date();

            // Calculate start and end dates
            const startDate = new Date(today);
            startDate.setDate(today.getDate() + 1);

            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 7);

            // Standard time slots
            const timeSlots = [
                { startTime: '09:00', endTime: '12:00', maxOrders: 10 },
                { startTime: '12:00', endTime: '15:00', maxOrders: 10 },
                { startTime: '15:00', endTime: '18:00', maxOrders: 10 }
            ];

            // Use the bulk endpoint
            await api.post('/delivery-slots/admin/bulk', {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                timeSlots
            });

            await fetchSlots(selectedDate);
            alert('Bulk slots created successfully!');
        } catch (error: any) {
            console.error('Failed to create bulk slots:', error);
            alert(error.response?.data?.message || 'Failed to create bulk slots');
        } finally {
            setSaving(false);
        }
    };

    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        fetchSlots(newDate);
    };

    const groupedSlots = slots.reduce((acc, slot) => {
        const date = slot.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(slot);
        return acc;
    }, {} as Record<string, DeliverySlot[]>);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Delivery Slots</h1>
                        <p className="text-gray-600 mt-1">Manage delivery time slots and capacity</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/admin"
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Back to Dashboard
                        </Link>
                        <button
                            onClick={createBulkSlots}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                        >
                            Create Bulk Slots
                        </button>
                        <button
                            onClick={() => openModal()}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Slot
                        </button>
                    </div>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">View Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Slots List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            ) : Object.keys(groupedSlots).length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No delivery slots found</h3>
                    <p className="text-gray-600 mb-6">Add delivery slots to start accepting orders</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={createBulkSlots}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Create Bulk Slots
                        </button>
                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Single Slot
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                        <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {new Date(date).toLocaleDateString('en-GB', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h3>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {dateSlots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-gray-400" />
                                                <span className="font-semibold text-gray-900">
                                                    {slot.startTime} - {slot.endTime}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${slot.isAvailable
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {slot.isAvailable ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Bookings:</span>
                                                <span className={`font-medium ${slot.currentBookings >= slot.maxOrders
                                                        ? 'text-red-600'
                                                        : slot.currentBookings > slot.maxOrders * 0.8
                                                            ? 'text-yellow-600'
                                                            : 'text-green-600'
                                                    }`}>
                                                    {slot.currentBookings} / {slot.maxOrders}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${slot.currentBookings >= slot.maxOrders
                                                            ? 'bg-red-600'
                                                            : slot.currentBookings > slot.maxOrders * 0.8
                                                                ? 'bg-yellow-600'
                                                                : 'bg-green-600'
                                                        }`}
                                                    style={{
                                                        width: `${Math.min((slot.currentBookings / slot.maxOrders) * 100, 100)}%`
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleSlotStatus(slot.id, slot.isAvailable)}
                                                className={`flex-1 px-3 py-1.5 rounded text-xs font-medium ${slot.isAvailable
                                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                            >
                                                {slot.isAvailable ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => openModal(slot)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteSlot(slot.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingSlot ? 'Edit Delivery Slot' : 'Add Delivery Slot'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Time *
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Time *
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Orders *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.maxOrders}
                                        onChange={(e) => setFormData({ ...formData, maxOrders: e.target.value })}
                                        required
                                        placeholder="10"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Maximum number of orders for this time slot
                                    </p>
                                </div>

                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isAvailable}
                                            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                            className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Slot is available for booking
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
                                                {editingSlot ? 'Update Slot' : 'Create Slot'}
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
