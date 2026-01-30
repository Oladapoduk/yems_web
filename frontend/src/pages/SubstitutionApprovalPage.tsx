import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface SubstitutionDetails {
    orderNumber: string;
    originalProduct: string;
    substitutionProduct: string;
    originalPrice: number;
    substitutionPrice: number;
    quantity: number;
}

export default function SubstitutionApprovalPage() {
    const { orderNumber, itemId } = useParams<{ orderNumber: string; itemId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [details, setDetails] = useState<SubstitutionDetails | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchSubstitutionDetails();
    }, [orderNumber, itemId]);

    const fetchSubstitutionDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders/${orderNumber}`);
            const order = response.data;

            const item = order.orderItems.find((i: any) => i.id === itemId);
            if (!item) {
                setError('Order item not found');
                setLoading(false);
                return;
            }

            if (item.substitutionStatus !== 'PENDING') {
                setError('This substitution request has already been processed');
                setLoading(false);
                return;
            }

            // Fetch substitution product details
            const productResponse = await api.get(`/products/${item.substitutionProductId}`);
            const substitutionProduct = productResponse.data.product;

            setDetails({
                orderNumber: order.orderNumber,
                originalProduct: item.productName,
                substitutionProduct: substitutionProduct.name,
                originalPrice: Number(item.productPrice),
                substitutionPrice: Number(substitutionProduct.price),
                quantity: item.quantity
            });
        } catch (err) {
            console.error('Failed to fetch substitution details:', err);
            setError('Failed to load substitution details');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (approved: boolean) => {
        if (!details) return;

        try {
            setProcessing(true);
            const status = approved ? 'ACCEPTED' : 'REFUNDED';

            await api.post(`/orders/substitution/${orderNumber}/${itemId}/respond`, {
                status
            });

            setSuccess(true);

            // Redirect to orders page after 3 seconds
            setTimeout(() => {
                navigate('/orders');
            }, 3000);
        } catch (err) {
            console.error('Failed to process substitution:', err);
            setError('Failed to process your response. Please try again.');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading substitution details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-green-900 mb-2">Response Received</h2>
                    <p className="text-green-700 mb-4">
                        Thank you for your response. We've updated your order accordingly.
                    </p>
                    <p className="text-sm text-gray-600">Redirecting to your orders...</p>
                </div>
            </div>
        );
    }

    if (!details) return null;

    const priceDifference = details.substitutionPrice - details.originalPrice;
    const totalDifference = priceDifference * details.quantity;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Package className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Product Substitution Required</h1>
                            <p className="text-sm text-gray-600">Order #{details.orderNumber}</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-yellow-800">
                                Unfortunately, <strong>{details.originalProduct}</strong> is currently out of stock.
                                We'd like to offer you a substitution to avoid delays in your delivery.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between py-3 border-b">
                            <div>
                                <p className="text-sm text-gray-500 uppercase font-medium">Original Product</p>
                                <p className="text-lg font-semibold text-gray-900">{details.originalProduct}</p>
                                <p className="text-sm text-gray-600">
                                    £{details.originalPrice.toFixed(2)} × {details.quantity} = £{(details.originalPrice * details.quantity).toFixed(2)}
                                </p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>

                        <div className="flex items-center justify-between py-3 border-b">
                            <div>
                                <p className="text-sm text-gray-500 uppercase font-medium">Substitute Product</p>
                                <p className="text-lg font-semibold text-gray-900">{details.substitutionProduct}</p>
                                <p className="text-sm text-gray-600">
                                    £{details.substitutionPrice.toFixed(2)} × {details.quantity} = £{(details.substitutionPrice * details.quantity).toFixed(2)}
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>

                        {totalDifference !== 0 && (
                            <div className={`p-4 rounded-lg ${totalDifference > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
                                <p className="text-sm font-medium">
                                    {totalDifference > 0 ? (
                                        <span className="text-orange-800">
                                            The substitute is £{Math.abs(totalDifference).toFixed(2)} more expensive.
                                            We'll charge this difference to your payment method.
                                        </span>
                                    ) : (
                                        <span className="text-green-800">
                                            The substitute is £{Math.abs(totalDifference).toFixed(2)} cheaper.
                                            We'll refund the difference to your payment method.
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">What would you like to do?</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <button
                                onClick={() => handleApproval(true)}
                                disabled={processing}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Accept Substitution
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => handleApproval(false)}
                                disabled={processing}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-5 w-5" />
                                        Request Refund
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <strong>Note:</strong> If you choose to request a refund, we'll remove this item from your order
                            and refund you the original amount. Please respond within 24 hours to avoid delays in delivery.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
