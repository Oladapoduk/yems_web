import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCartStore } from '../store/cartStore';

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    createdAt: string;
    orderItems: Array<{
        id: string;
        productId: string;
        productName: string;
        quantity: number;
        productPrice: number;
    }>;
}

export default function OrdersPage() {
    const navigate = useNavigate();
    const { addItem } = useCartStore();
    const [reorderingId, setReorderingId] = useState<string | null>(null);

    const { data: orders, isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: async () => {
            const response = await api.get('/orders/my-orders');
            return response.data as Order[];
        }
    });

    const handleOrderAgain = async (order: Order) => {
        try {
            setReorderingId(order.id);

            let availableCount = 0;
            let unavailableCount = 0;
            const unavailableItems: string[] = [];

            // Validate each product's availability before adding
            for (const item of order.orderItems) {
                try {
                    const response = await api.get(`/products/${item.productId}`);
                    const product = response.data.product;

                    if (product.isAvailable && product.stockQuantity >= item.quantity) {
                        addItem(product, item.quantity);
                        availableCount++;
                    } else {
                        unavailableCount++;
                        unavailableItems.push(product.name);
                    }
                } catch (err) {
                    console.error(`Failed to fetch product ${item.productId}:`, err);
                    unavailableCount++;
                    unavailableItems.push(item.productName);
                }
            }

            // Show feedback to user
            if (unavailableCount > 0) {
                alert(
                    `Added ${availableCount} item(s) to cart.\n\n` +
                    `${unavailableCount} item(s) are no longer available:\n` +
                    unavailableItems.join(', ')
                );
            }

            // Navigate to cart if at least one item was added
            if (availableCount > 0) {
                navigate('/cart');
            }
        } catch (error) {
            console.error('Failed to reorder:', error);
            alert('Failed to reorder. Please try again.');
        } finally {
            setReorderingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'CONFIRMED': 'bg-blue-100 text-blue-800',
            'PACKED': 'bg-purple-100 text-purple-800',
            'OUT_FOR_DELIVERY': 'bg-indigo-100 text-indigo-800',
            'DELIVERED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                <Link
                    to="/products"
                    className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order History</h2>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-green-200 transition-colors">
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                            <div className="flex gap-6">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Order Placed</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Total</p>
                                    <p className="text-sm font-medium text-gray-900">£{Number(order.total).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Order #</p>
                                    <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {order.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900 font-medium mb-3">Order Items ({order.orderItems.length})</p>
                                    <div className="space-y-2">
                                        {order.orderItems.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-gray-700">
                                                    {item.quantity}x {item.productName}
                                                </span>
                                                <span className="text-gray-900 font-medium">
                                                    £{(Number(item.productPrice) * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <Link
                                    to={`/order-confirmation/${order.orderNumber}`}
                                    className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
                                >
                                    View Details
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Link>

                                <button
                                    onClick={() => handleOrderAgain(order)}
                                    disabled={reorderingId === order.id}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {reorderingId === order.id ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Adding to Cart...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4" />
                                            Order Again
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
