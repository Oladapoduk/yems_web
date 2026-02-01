import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, Calendar, Clock } from 'lucide-react';
import { deliveryService } from '../services/deliveryService';
import { orderService } from '../services/orderService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { VoucherInput } from '../components/VoucherInput';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

type Step = 'shipping' | 'delivery' | 'payment' | 'confirmation';

interface DeliveryZone {
    id: string;
    name: string;
    deliveryFee: number;
    minimumOrder: number;
}

interface DeliverySlot {
    id: string;
    startTime: string;
    endTime: string;
    available: number;
    maxOrders: number;
}

function CheckoutForm() {
    const { items, getSubtotal, getDiscountAmount, getFinalTotal, appliedVoucher, clearCart } = useCartStore();
    const { user } = useAuthStore();

    const [step, setStep] = useState<Step>('shipping');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [clientSecret, setClientSecret] = useState('');
    const [orderNumber, setOrderNumber] = useState('');

    const [shippingDetails, setShippingDetails] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postcode: '',
        phone: ''
    });

    const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);
    const [postcodeValidated, setPostcodeValidated] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<Record<string, DeliverySlot[]>>({});
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; slotId: string } | null>(null);

    const subtotal = getSubtotal();
    const discountAmount = getDiscountAmount();
    const subtotalAfterDiscount = getFinalTotal();
    const deliveryFee = deliveryZone ? Number(deliveryZone.deliveryFee) : 0;
    const finalTotal = subtotalAfterDiscount + deliveryFee;

    if (items.length === 0 && step !== 'confirmation') {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <Link to="/products" className="text-primary-600 hover:underline">Continue Shopping</Link>
            </div>
        );
    }

    const validatePostcode = async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await deliveryService.validatePostcode(shippingDetails.postcode);
            if (result.isValid && result.zone) {
                // Ensure numeric values
                const zone = {
                    ...result.zone,
                    deliveryFee: Number(result.zone.deliveryFee),
                    minimumOrder: Number(result.zone.minimumOrder)
                };
                setDeliveryZone(zone);
                setPostcodeValidated(true);

                // Check minimum order
                if (subtotal < zone.minimumOrder) {
                    setError(`Minimum order for your area is £${zone.minimumOrder.toFixed(2)}`);
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid postcode or we do not deliver to this area');
            setPostcodeValidated(false);
            setDeliveryZone(null);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDeliverySlots = async () => {
        try {
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);

            const slots = await deliveryService.getDeliverySlots(
                today.toISOString().split('T')[0],
                nextWeek.toISOString().split('T')[0]
            );
            setAvailableSlots(slots);
        } catch (err) {
            setError('Failed to load delivery slots');
        }
    };

    const handleShippingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!postcodeValidated) {
            await validatePostcode();
            return;
        }

        if (deliveryZone && subtotal < deliveryZone.minimumOrder) {
            setError(`Minimum order for your area is £${deliveryZone.minimumOrder.toFixed(2)}`);
            return;
        }

        await loadDeliverySlots();
        setStep('delivery');
    };

    const handleDeliverySubmit = () => {
        if (!selectedSlot) {
            setError('Please select a delivery slot');
            return;
        }
        setStep('payment');
        createPaymentIntent();
    };

    const createPaymentIntent = async () => {
        setIsLoading(true);
        try {
            const orderData = {
                userId: user?.id,
                guestEmail: !user ? shippingDetails.email : undefined,
                orderItems: items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity
                })),
                deliveryAddress: {
                    firstName: shippingDetails.firstName,
                    lastName: shippingDetails.lastName,
                    phone: shippingDetails.phone,
                    addressLine1: shippingDetails.addressLine1,
                    addressLine2: shippingDetails.addressLine2,
                    city: shippingDetails.city,
                    postcode: shippingDetails.postcode
                },
                deliveryPostcode: shippingDetails.postcode,
                deliveryZoneId: deliveryZone!.id,
                deliverySlotId: selectedSlot!.slotId,
                voucherCode: appliedVoucher?.code || undefined
            };

            const result = await orderService.createOrder(orderData);
            setClientSecret(result.clientSecret);
            setOrderNumber(result.order.orderNumber);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create order');
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 'confirmation') {
        return (
            <div className="container mx-auto px-4 py-16 text-center max-w-lg">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="h-20 w-20 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
                <p className="text-gray-600 mb-4">
                    Thank you for your order. We've sent a confirmation email to {shippingDetails.email}.
                </p>
                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                    <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
                    <p className="text-sm text-gray-600">Order #: {orderNumber}</p>
                    <p className="text-sm text-gray-600">Total: £{finalTotal.toFixed(2)}</p>
                    {selectedSlot && (
                        <p className="text-sm text-gray-600 mt-2">
                            Delivery: {new Date(selectedSlot.date).toLocaleDateString()} at {availableSlots[selectedSlot.date]?.find(s => s.id === selectedSlot.slotId)?.startTime}
                        </p>
                    )}
                </div>
                <Link
                    to="/"
                    className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                    Return Home
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            {/* Progress Steps */}
            <div className="mb-8 flex items-center justify-center">
                <div className="flex items-center space-x-4">
                    <div className={`flex items-center ${step === 'shipping' ? 'text-primary-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>1</div>
                        <span className="ml-2 font-medium">Shipping</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className={`flex items-center ${step === 'delivery' ? 'text-primary-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'delivery' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>2</div>
                        <span className="ml-2 font-medium">Delivery</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className={`flex items-center ${step === 'payment' ? 'text-primary-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>3</div>
                        <span className="ml-2 font-medium">Payment</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {step === 'shipping' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Details</h2>
                            <form onSubmit={handleShippingSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                            value={shippingDetails.firstName}
                                            onChange={e => setShippingDetails({ ...shippingDetails, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                            value={shippingDetails.lastName}
                                            onChange={e => setShippingDetails({ ...shippingDetails, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        value={shippingDetails.email}
                                        onChange={e => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        value={shippingDetails.addressLine1}
                                        onChange={e => setShippingDetails({ ...shippingDetails, addressLine1: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        value={shippingDetails.addressLine2}
                                        onChange={e => setShippingDetails({ ...shippingDetails, addressLine2: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                            value={shippingDetails.city}
                                            onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Postcode *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                required
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                                value={shippingDetails.postcode}
                                                onChange={e => {
                                                    setShippingDetails({ ...shippingDetails, postcode: e.target.value });
                                                    setPostcodeValidated(false);
                                                }}
                                            />
                                            {!postcodeValidated && (
                                                <button
                                                    type="button"
                                                    onClick={validatePostcode}
                                                    disabled={isLoading || !shippingDetails.postcode}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                                >
                                                    Validate
                                                </button>
                                            )}
                                        </div>
                                        {postcodeValidated && deliveryZone && (
                                            <p className="text-sm text-green-600 mt-1 flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Delivers to {deliveryZone.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        value={shippingDetails.phone}
                                        onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={!postcodeValidated || isLoading}
                                        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Validating...' : 'Continue to Delivery'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 'delivery' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Select Delivery Slot</h2>
                                <button
                                    onClick={() => setStep('shipping')}
                                    className="text-sm text-primary-600 hover:underline"
                                >
                                    Edit Shipping
                                </button>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(availableSlots).map(([date, slots]) => (
                                    <div key={date} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center mb-3">
                                            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                                            <h3 className="font-semibold text-gray-900">
                                                {new Date(date).toLocaleDateString('en-GB', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {slots.map(slot => (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    disabled={slot.available === 0}
                                                    onClick={() => setSelectedSlot({ date, slotId: slot.id })}
                                                    className={`p-3 border rounded-lg text-left transition-colors ${
                                                        selectedSlot?.slotId === slot.id
                                                            ? 'border-primary-600 bg-primary-50'
                                                            : slot.available === 0
                                                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                                            : 'border-gray-200 hover:border-primary-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                                            <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {slot.available > 0 ? `${slot.available} slots left` : 'Fully booked'}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6">
                                <button
                                    onClick={handleDeliverySubmit}
                                    disabled={!selectedSlot}
                                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'payment' && clientSecret && (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <PaymentForm
                                finalTotal={finalTotal}
                                onSuccess={() => {
                                    clearCart();
                                    setStep('confirmation');
                                }}
                                onBack={() => setStep('delivery')}
                            />
                        </Elements>
                    )}
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                            {items.map((item) => (
                                <div key={item.product.id} className="flex gap-3">
                                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                        {item.product.imageUrls[0] && (
                                            <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        <p className="text-sm text-gray-900">£{(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Voucher Input */}
                        <div className="border-t border-gray-100 pt-4 pb-4">
                            <VoucherInput />
                        </div>

                        <div className="border-t border-gray-100 pt-4 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>£{subtotal.toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Discount ({appliedVoucher?.code})</span>
                                    <span>-£{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery</span>
                                <span>{deliveryFee === 0 ? 'Free' : `£${deliveryFee.toFixed(2)}`}</span>
                            </div>
                            {deliveryZone && (
                                <p className="text-xs text-gray-500">
                                    Minimum order: £{deliveryZone.minimumOrder.toFixed(2)}
                                </p>
                            )}
                            <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span>£{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface PaymentFormProps {
    finalTotal: number;
    onSuccess: () => void;
    onBack: () => void;
}

function PaymentForm({ finalTotal, onSuccess, onBack }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError('');

        const { error: submitError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: 'if_required'
        });

        if (submitError) {
            setError(submitError.message || 'Payment failed');
            setIsProcessing(false);
        } else {
            onSuccess();
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Payment</h2>
                <button
                    onClick={onBack}
                    className="text-sm text-primary-600 hover:underline"
                >
                    Back
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <PaymentElement />

                <button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="w-full flex items-center justify-center bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                    {isProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        `Pay £${finalTotal.toFixed(2)}`
                    )}
                </button>
            </form>
        </div>
    );
}

export default function CheckoutPageImproved() {
    return <CheckoutForm />;
}
