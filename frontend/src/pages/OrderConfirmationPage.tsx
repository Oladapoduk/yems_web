import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Package, Truck, Calendar, MapPin, Mail, Phone, Loader2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import OrderStatusStepper from '../components/OrderStatusStepper';
import { useCartStore } from '../store/cartStore';

interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    finalPrice: number;
    product: {
        imageUrls: string[];
        slug: string;
    };
}

// type Order = {
//     id: string;
//     orderNumber: string;
//     status: string;
//     subtotal: number;
//     deliveryFee: number;
//     total: number;
//     deliveryAddress: {
//         firstName: string;
//         lastName: string;
//         phone: string;
//         addressLine1: string;
//         addressLine2?: string;
//         city: string;
//         postcode: string;
//     };
//     deliverySlot: {
//         date: string;
//         startTime: string;
//         endTime: string;
//     };
//     deliveryZone: {
//         name: string;
//     };
//     orderItems: OrderItem[];
//     guestEmail?: string;
//     user?: {
//         email: string;
//     };
//     createdAt: string;
//     updatedAt?: string;
// }

export default function OrderConfirmationPage() {
    const { orderNumber } = useParams<{ orderNumber: string }>();
    const navigate = useNavigate();
    const { addItem } = useCartStore();

    // Use React Query for automatic polling and caching
    const { data: order, isLoading: loading, error: queryError } = useQuery({
        queryKey: ['order', orderNumber],
        queryFn: async () => {
            const response = await api.get(`/orders/${orderNumber}`);
            return response.data.order || response.data;
        },
        enabled: !!orderNumber,
        refetchInterval: 30000, // Poll every 30 seconds
        refetchIntervalInBackground: false, // Stop polling when tab is inactive
        staleTime: 10000, // Consider data stale after 10 seconds
        retry: 2, // Retry failed requests 2 times
    });

    const error = queryError ?
        (queryError as any).response?.data?.message || 'Failed to load order' :
        '';

    const handleOrderAgain = async () => {
        if (!order) return;

        try {
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
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-md mx-auto">
                    <div className="text-red-600 mb-4">
                        <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'We couldn\'t find this order.'}</p>
                    <Link to="/" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const customerEmail = order.guestEmail || order.user?.email;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Success Header */}
                <div className="max-w-3xl mx-auto mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-100 rounded-full p-4">
                                <CheckCircle className="h-16 w-16 text-green-600" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-gray-600 mb-4">
                            Thank you for your order. We've sent a confirmation email to{' '}
                            <span className="font-medium text-gray-900">{customerEmail}</span>
                        </p>
                        <div className="inline-block bg-gray-100 px-6 py-3 rounded-lg">
                            <span className="text-sm text-gray-600">Order Number</span>
                            <p className="text-2xl font-bold text-green-600">{order.orderNumber}</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Delivery Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center">
                                <Truck className="h-5 w-5 mr-2 text-green-600" />
                                Delivery Information
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Delivery Address
                                    </h3>
                                    <div className="text-gray-600 text-sm">
                                        <p>{order.deliveryAddress.firstName} {order.deliveryAddress.lastName}</p>
                                        <p>{order.deliveryAddress.addressLine1}</p>
                                        {order.deliveryAddress.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                                        <p>{order.deliveryAddress.city}</p>
                                        <p>{order.deliveryAddress.postcode}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Delivery Time
                                    </h3>
                                    <div className="text-gray-600 text-sm">
                                        <p className="font-medium">{new Date(order.deliverySlot.date).toLocaleDateString('en-GB', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                        <p className="text-green-600 font-medium mt-1">
                                            {order.deliverySlot.startTime} - {order.deliverySlot.endTime}
                                        </p>
                                        <p className="mt-2">{order.deliveryZone.name}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <h3 className="font-medium text-gray-900 mb-2">Contact</h3>
                                <div className="text-gray-600 text-sm space-y-1">
                                    <p className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2" />
                                        {customerEmail}
                                    </p>
                                    <p className="flex items-center">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {order.deliveryAddress.phone}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center">
                                <Package className="h-5 w-5 mr-2 text-green-600" />
                                Order Items
                            </h2>
                            <div className="space-y-4">
                                {order.orderItems.map((item: OrderItem) => (
                                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                                            {item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                                                <img
                                                    src={item.product.imageUrls[0]}
                                                    alt={item.productName}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.productName}</h3>
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            <p className="text-sm text-gray-600">£{Number(item.productPrice).toFixed(2)} each</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">£{Number(item.finalPrice).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">£{Number(order.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span className="font-medium">£{Number(order.deliveryFee).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-lg">Total</span>
                                        <span className="font-bold text-lg text-green-600">£{Number(order.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Status */}
                        <OrderStatusStepper
                            status={order.status as any}
                            updatedAt={order.updatedAt || order.createdAt}
                        />

                        {/* Order Again Fast Action */}
                        <div className="bg-primary-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary-200">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Need these items again?</h3>
                                <p className="text-primary-100 text-sm mb-6 max-w-[200px]">Quickly add everything from this order back to your cart.</p>
                                <button
                                    onClick={() => handleOrderAgain()}
                                    className="bg-white text-primary-900 px-6 py-3 rounded-xl font-black text-sm hover:bg-primary-50 transition-all flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    REORDER ALL
                                </button>
                            </div>
                            <Package className="absolute -right-8 -bottom-8 h-40 w-40 text-white opacity-10 rotate-12" />
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <Link
                                to="/products"
                                className="block w-full text-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Continue Shopping
                            </Link>
                            <Link
                                to="/orders"
                                className="block w-full text-center bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                View All Orders
                            </Link>
                        </div>

                        {/* Help */}
                        <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-green-900 mb-2">Need Help?</h3>
                            <p className="text-sm text-green-800 mb-3">
                                Contact us if you have any questions about your order.
                            </p>
                            <a href="mailto:support@tantifoods.com" className="text-sm text-green-600 hover:underline">
                                support@tantifoods.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
