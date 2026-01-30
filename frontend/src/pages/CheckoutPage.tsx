import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle, MapPin, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { deliveryService, type DeliveryZone, type SlotsByDate } from '../services/deliveryService';
import { orderService } from '../services/orderService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutPayment from '../components/CheckoutPayment';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

type CheckoutStep = 'shipping' | 'delivery' | 'payment' | 'confirmation';

export default function CheckoutPage() {
    const { items, getTotal, clearCart } = useCartStore();
    const { user } = useAuthStore();

    const [step, setStep] = useState<CheckoutStep>('shipping');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidatingPostcode, setIsValidatingPostcode] = useState(false);
    const [postcodeError, setPostcodeError] = useState<string | null>(null);

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
    const [slotsByDate, setSlotsByDate] = useState<SlotsByDate>({});
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const total = getTotal();
    const deliveryFee = deliveryZone ? Number(deliveryZone.deliveryFee) : 0;
    const finalTotal = total + deliveryFee;

    const handlePostcodeBlur = async () => {
        if (!shippingDetails.postcode || shippingDetails.postcode.length < 5) return;

        setIsValidatingPostcode(true);
        setPostcodeError(null);
        try {
            const response = await deliveryService.validatePostcode(shippingDetails.postcode);
            if (response.isValid && response.zone) {
                setDeliveryZone(response.zone);
            } else {
                setPostcodeError(response.message || 'We do not deliver to this area yet.');
                setDeliveryZone(null);
            }
        } catch (error) {
            setPostcodeError('Failed to validate postcode. Please try again.');
        } finally {
            setIsValidatingPostcode(false);
        }
    };

    const handleShippingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deliveryZone) {
            await handlePostcodeBlur();
            if (!deliveryZone) return;
        }

        setIsLoading(true);
        try {
            const startDate = new Date().toISOString().split('T')[0];
            const slots = await deliveryService.getDeliverySlots(startDate);
            setSlotsByDate(slots);
            setStep('delivery');
        } catch (error) {
            console.error('Failed to fetch slots', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeliverySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlotId) return;

        setIsLoading(true);
        try {
            const orderData = {
                userId: user?.id,
                guestEmail: !user ? shippingDetails.email : undefined,
                items: items.map(item => ({
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
                deliverySlotId: selectedSlotId!,
            };

            const response = await orderService.createOrder(orderData);
            setOrderNumber(response.order.orderNumber);
            setClientSecret(response.clientSecret);
            setStep('payment');
        } catch (error) {
            console.error('Order/Payment creation failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        clearCart();
        setStep('confirmation');
    };

    if (items.length === 0 && step !== 'confirmation') {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <Link to="/products" className="text-primary-600 hover:underline inline-flex items-center gap-2">
                    Continue Shopping <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    const steps = [
        { id: 'shipping', label: 'Shipping', icon: MapPin },
        { id: 'delivery', label: 'Delivery', icon: Calendar },
        { id: 'payment', label: 'Payment', icon: CreditCard },
    ];

    if (step === 'confirmation') {
        return (
            <div className="container mx-auto px-4 py-16 text-center max-w-lg">
                <div className="flex justify-center mb-6">
                    <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
                <p className="text-gray-600 mb-8 text-lg">
                    Thank you for your order. We've sent a confirmation email to <span className="font-semibold text-gray-900">{shippingDetails.email}</span>.
                </p>
                <div className="bg-gray-50 rounded-2xl p-8 mb-8 text-left border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 text-xl">Order Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Order Number</span>
                            <span className="font-mono font-medium">{orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total Charged</span>
                            <span className="font-bold text-primary-600">£{finalTotal.toFixed(2)}</span>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500">We'll notify you when your items are ready for delivery.</p>
                        </div>
                    </div>
                </div>
                <Link
                    to="/"
                    className="inline-block bg-primary-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-200"
                >
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4">
                {/* Stepper */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="flex items-center justify-between relative">
                        {steps.map((s, idx) => {
                            const Icon = s.icon;
                            const isActive = step === s.id;
                            const isPast = steps.findIndex(x => x.id === step) > idx;

                            return (
                                <div key={s.id} className="flex flex-col items-center relative z-10">
                                    <div className={`
                                        h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300
                                        ${isActive ? 'bg-primary-600 text-white shadow-lg ring-4 ring-primary-100' :
                                            isPast ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                                    `}>
                                        {isPast ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                                    </div>
                                    <span className={`mt-2 text-sm font-semibold ${isActive ? 'text-primary-800' : 'text-gray-500'}`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                        {/* Line connector */}
                        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 -z-0">
                            <div
                                className="h-full bg-primary-600 transition-all duration-500"
                                style={{ width: `${(steps.findIndex(x => x.id === step) / (steps.length - 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {step === 'shipping' && (
                            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                                    <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
                                    <p className="text-gray-500">Provide your delivery details</p>
                                </div>
                                <form onSubmit={handleShippingSubmit} className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-700 px-1">First Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="John"
                                                className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                                value={shippingDetails.firstName}
                                                onChange={e => setShippingDetails({ ...shippingDetails, firstName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-700 px-1">Last Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Doe"
                                                className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                                value={shippingDetails.lastName}
                                                onChange={e => setShippingDetails({ ...shippingDetails, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-gray-700 px-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                            value={shippingDetails.email}
                                            onChange={e => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-700 px-1">Street Address</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="123 Main St"
                                                className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                                value={shippingDetails.addressLine1}
                                                onChange={e => setShippingDetails({ ...shippingDetails, addressLine1: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-700 px-1">Apartment, suite, etc. (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="Suite 4B"
                                                className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                                value={shippingDetails.addressLine2}
                                                onChange={e => setShippingDetails({ ...shippingDetails, addressLine2: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1 space-y-1">
                                            <label className="text-sm font-bold text-gray-700 px-1">Postcode</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="E1 6AN"
                                                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all ${postcodeError ? 'border-red-500' : 'border-transparent'
                                                        }`}
                                                    value={shippingDetails.postcode}
                                                    onChange={e => setShippingDetails({ ...shippingDetails, postcode: e.target.value })}
                                                    onBlur={handlePostcodeBlur}
                                                />
                                                {isValidatingPostcode && (
                                                    <div className="absolute right-3 top-3.5">
                                                        <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                                                    </div>
                                                )}
                                            </div>
                                            {postcodeError && <p className="text-xs text-red-500 mt-1 px-1 font-medium">{postcodeError}</p>}
                                            {deliveryZone && <p className="text-xs text-green-600 mt-1 px-1 font-medium italic">✅ We deliver here! ({deliveryZone.name})</p>}
                                        </div>
                                        <div className="md:col-span-1 space-y-1">
                                            <label className="text-sm font-bold text-gray-700 px-1">City</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="London"
                                                className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                                value={shippingDetails.city}
                                                onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-1 space-y-1">
                                            <label className="text-sm font-bold text-gray-700 px-1">Phone</label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="07123 456789"
                                                className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                                value={shippingDetails.phone}
                                                onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={isLoading || !!postcodeError || !shippingDetails.postcode}
                                            className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-50 disabled:shadow-none"
                                        >
                                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 'Continue to Delivery Options'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {step === 'delivery' && (
                            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                                    <h2 className="text-2xl font-bold text-gray-900">Select Delivery Slot</h2>
                                    <p className="text-gray-500">Pick a time that works best for you</p>
                                </div>
                                <form onSubmit={handleDeliverySubmit} className="p-8 space-y-8">
                                    {Object.keys(slotsByDate).length > 0 ? (
                                        Object.entries(slotsByDate).map(([date, slots]) => (
                                            <div key={date} className="space-y-4">
                                                <h4 className="font-bold text-gray-900 px-1">{new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {slots.map(slot => (
                                                        <label
                                                            key={slot.id}
                                                            className={`
                                                                relative p-4 rounded-2xl border-2 cursor-pointer transition-all
                                                                ${selectedSlotId === slot.id ? 'border-primary-600 bg-primary-50/50 shadow-md ring-1 ring-primary-100' : 'border-gray-100 hover:border-primary-200 bg-white'}
                                                                ${slot.available === 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                                                            `}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="deliverySlot"
                                                                className="hidden"
                                                                disabled={slot.available === 0}
                                                                onChange={() => setSelectedSlotId(slot.id)}
                                                                checked={selectedSlotId === slot.id}
                                                            />
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{slot.startTime} - {slot.endTime}</p>
                                                                    <p className="text-xs text-gray-500">{slot.available} slots left</p>
                                                                </div>
                                                                {selectedSlotId === slot.id && <CheckCircle className="h-6 w-6 text-primary-600" />}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 font-medium">No delivery slots available for the next 7 days.</p>
                                        </div>
                                    )}

                                    <div className="pt-6 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setStep('shipping')}
                                            className="w-1/3 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!selectedSlotId}
                                            className="flex-1 bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-50 disabled:shadow-none"
                                        >
                                            Continue to Payment
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {step === 'payment' && clientSecret && (
                            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                                    <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                                    <p className="text-gray-500">Secure checkout via Stripe</p>
                                </div>
                                <div className="p-8 space-y-8">
                                    <div className="p-6 bg-primary-50/50 rounded-2xl border border-primary-100 flex gap-4">
                                        <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                                            <MapPin className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Delivery to {shippingDetails.city}</p>
                                            <p className="text-sm text-gray-600 truncate max-w-xs">{shippingDetails.addressLine1}, {shippingDetails.postcode}</p>
                                            <button onClick={() => setStep('shipping')} className="text-xs text-primary-600 font-bold hover:underline mt-1">Change Address</button>
                                        </div>
                                    </div>

                                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                        <CheckoutPayment
                                            amount={finalTotal}
                                            onSuccess={handlePaymentSuccess}
                                        />
                                    </Elements>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sticky top-28 space-y-8">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Order Summary</h2>

                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.product.id} className="flex gap-4 group">
                                        <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-primary-100 transition-colors">
                                            {item.product.imageUrls[0] && (
                                                <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 py-1">
                                            <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{item.product.name}</p>
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs font-medium text-gray-400">Qty: {item.quantity}</p>
                                                <p className="text-sm font-bold text-gray-900">£{(item.product.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-gray-100 space-y-4">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900">£{total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Delivery Fee</span>
                                    <span className={deliveryFee === 0 ? 'text-green-600 font-bold' : 'text-gray-900'}>
                                        {deliveryFee === 0 ? 'FREE' : `£${deliveryFee.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total to Pay</p>
                                        <p className="text-3xl font-black text-gray-900 leading-none">£{finalTotal.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-medium">Inc. VAT</p>
                                    </div>
                                </div>
                            </div>

                            {total < 20 && (
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <p className="text-xs text-orange-700 leading-relaxed font-medium">
                                        💡 Tip: Add £{(20 - total).toFixed(2)} more to reach our recommended minimum for bulk savings!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
