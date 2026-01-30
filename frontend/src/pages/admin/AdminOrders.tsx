import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, ChevronRight, Loader2, Calendar, MapPin, Phone, Mail, RefreshCw, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    productPrice: number;
    finalPrice: number;
    substitutionProductId?: string;
    substitutionStatus: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    priceType: string;
    isAvailable: boolean;
    category: {
        id: string;
        name: string;
    };
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    createdAt: string;
    deliveryAddress: {
        firstName: string;
        lastName: string;
        phone: string;
        postcode: string;
    };
    deliverySlot: {
        date: string;
        startTime: string;
        endTime: string;
    };
    deliveryZone: {
        name: string;
    };
    user?: {
        email: string;
        firstName: string;
        lastName: string;
    };
    guestEmail?: string;
    orderItems: OrderItem[];
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PACKED: 'bg-purple-100 text-purple-800',
    OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
};

const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PACKED', label: 'Packed' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Substitution states
    const [substitutingItem, setSubstitutingItem] = useState<string | null>(null);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedSubstitute, setSelectedSubstitute] = useState<string>('');

    useEffect(() => {
        fetchOrders();
    }, [selectedStatus]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedStatus !== 'all') {
                params.append('status', selectedStatus);
            }

            const response = await api.get(`/orders/admin/all?${params.toString()}`);
            setOrders(response.data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderNumber: string, newStatus: string) => {
        try {
            setUpdatingStatus(true);
            await api.patch(`/orders/admin/${orderNumber}/status`, { status: newStatus });

            // Update local state
            setOrders(orders.map(order =>
                order.orderNumber === orderNumber
                    ? { ...order, status: newStatus }
                    : order
            ));

            if (selectedOrder?.orderNumber === orderNumber) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert('Failed to update order status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const startSubstitution = async (itemId: string, originalProductId: string) => {
        try {
            setSubstitutingItem(itemId);
            setLoadingProducts(true);

            // Fetch available products from the same category
            const response = await api.get(`/products/${originalProductId}`);
            const originalProduct = response.data.product;

            // Get products from same category
            const productsResponse = await api.get(`/products?category=${originalProduct.category.slug}&inStock=true`);
            setAvailableProducts(productsResponse.data.products.filter((p: Product) => p.id !== originalProductId));
        } catch (error) {
            console.error('Failed to load products:', error);
            alert('Failed to load available products');
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleSubstitution = async (orderNumber: string, itemId: string) => {
        if (!selectedSubstitute) {
            alert('Please select a substitute product');
            return;
        }

        try {
            await api.post(`/orders/admin/${orderNumber}/items/${itemId}/substitute`, {
                substitutionProductId: selectedSubstitute
            });

            // Refresh orders to get updated data
            await fetchOrders();

            // Close substitution UI
            setSubstitutingItem(null);
            setSelectedSubstitute('');
            setAvailableProducts([]);

            alert('Substitution request sent to customer via email');
        } catch (error) {
            console.error('Failed to create substitution:', error);
            alert('Failed to create substitution');
        }
    };

    const cancelSubstitution = () => {
        setSubstitutingItem(null);
        setSelectedSubstitute('');
        setAvailableProducts([]);
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.deliveryAddress.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.deliveryAddress.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user?.email || order.guestEmail || '').toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const getCustomerEmail = (order: Order) => {
        return order.user?.email || order.guestEmail || 'N/A';
    };

    const getCustomerName = (order: Order) => {
        if (order.user) {
            return `${order.user.firstName} ${order.user.lastName}`;
        }
        return `${order.deliveryAddress.firstName} ${order.deliveryAddress.lastName}`;
    };

    const getSubstitutionStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            'NONE': 'bg-gray-100 text-gray-800',
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'ACCEPTED': 'bg-green-100 text-green-800',
            'REFUNDED': 'bg-red-100 text-red-800',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
                        <p className="text-gray-600 mt-1">View and manage customer orders</p>
                    </div>
                    <Link
                        to="/admin"
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by order number, customer name, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600">
                        {searchTerm ? 'Try adjusting your search' : 'No orders match the selected filter'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {order.orderNumber}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleString('en-GB', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">£{Number(order.total).toFixed(2)}</p>
                                        <p className="text-sm text-gray-600">{order.orderItems.length} items</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Customer</p>
                                        <p className="text-sm text-gray-900">{getCustomerName(order)}</p>
                                        <p className="text-xs text-gray-600 flex items-center mt-1">
                                            <Mail className="h-3 w-3 mr-1" />
                                            {getCustomerEmail(order)}
                                        </p>
                                        <p className="text-xs text-gray-600 flex items-center mt-1">
                                            <Phone className="h-3 w-3 mr-1" />
                                            {order.deliveryAddress.phone}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Delivery</p>
                                        <p className="text-sm text-gray-900 flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {new Date(order.deliverySlot.date).toLocaleDateString('en-GB')}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {order.deliverySlot.startTime} - {order.deliverySlot.endTime}
                                        </p>
                                        <p className="text-xs text-gray-600 flex items-center mt-1">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {order.deliveryAddress.postcode} ({order.deliveryZone.name})
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Update Status</p>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.orderNumber, e.target.value)}
                                            disabled={updatingStatus}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                                        >
                                            {statusOptions.filter(s => s.value !== 'all').map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <button
                                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                                    >
                                        {selectedOrder?.id === order.id ? 'Hide' : 'View'} Order Details
                                        <ChevronRight className={`h-4 w-4 ml-1 transform transition-transform ${selectedOrder?.id === order.id ? 'rotate-90' : ''}`} />
                                    </button>
                                </div>

                                {/* Order Details Expansion */}
                                {selectedOrder?.id === order.id && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                                        <div className="space-y-3">
                                            {order.orderItems.map((item) => (
                                                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-gray-900">{item.productName}</p>
                                                                {item.substitutionStatus !== 'NONE' && (
                                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSubstitutionStatusColor(item.substitutionStatus)}`}>
                                                                        {item.substitutionStatus}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600">
                                                                Qty: {item.quantity} × £{Number(item.productPrice).toFixed(2)}
                                                            </p>

                                                            {/* Substitution UI */}
                                                            {substitutingItem === item.id ? (
                                                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                    <div className="flex items-start gap-2 mb-2">
                                                                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                                                        <p className="text-sm text-yellow-800 font-medium">Select a substitute product:</p>
                                                                    </div>

                                                                    {loadingProducts ? (
                                                                        <div className="flex items-center gap-2 py-2">
                                                                            <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                                                                            <span className="text-sm text-gray-600">Loading products...</span>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <select
                                                                                value={selectedSubstitute}
                                                                                onChange={(e) => setSelectedSubstitute(e.target.value)}
                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                                                                            >
                                                                                <option value="">Choose a product...</option>
                                                                                {availableProducts.map(product => (
                                                                                    <option key={product.id} value={product.id}>
                                                                                        {product.name} - £{Number(product.price).toFixed(2)}
                                                                                        {product.priceType === 'PER_KG' ? '/kg' : ''}
                                                                                    </option>
                                                                                ))}
                                                                            </select>

                                                                            <div className="flex gap-2">
                                                                                <button
                                                                                    onClick={() => handleSubstitution(order.orderNumber, item.id)}
                                                                                    disabled={!selectedSubstitute}
                                                                                    className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                                                >
                                                                                    Send Substitution Email
                                                                                </button>
                                                                                <button
                                                                                    onClick={cancelSubstitution}
                                                                                    className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                                                                                >
                                                                                    <X className="h-4 w-4" />
                                                                                </button>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ) : item.substitutionStatus === 'NONE' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' ? (
                                                                <button
                                                                    onClick={() => startSubstitution(item.id, item.productId)}
                                                                    className="mt-2 flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                                                                >
                                                                    <RefreshCw className="h-3 w-3" />
                                                                    Mark for Substitution
                                                                </button>
                                                            ) : null}
                                                        </div>
                                                        <p className="font-semibold text-gray-900">
                                                            £{Number(item.finalPrice).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-4 border-t space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="font-medium">£{Number(order.subtotal).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Delivery Fee</span>
                                                <span className="font-medium">£{Number(order.deliveryFee).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-base font-bold pt-2 border-t">
                                                <span>Total</span>
                                                <span className="text-green-600">£{Number(order.total).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                                            <p className="text-sm text-gray-600">
                                                {order.deliveryAddress.firstName} {order.deliveryAddress.lastName}<br />
                                                {order.deliveryAddress.postcode}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
