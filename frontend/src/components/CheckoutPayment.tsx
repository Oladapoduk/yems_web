import { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';

interface CheckoutPaymentProps {
    onSuccess: (orderNumber: string) => void;
    amount: number;
}

export default function CheckoutPayment({ onSuccess, amount }: CheckoutPaymentProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "An unexpected error occurred.");
            } else {
                setMessage("An unexpected error occurred.");
            }
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id); // In a real app, we'd wait for webhook or poll
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
            </div>

            {message && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                    {message}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                className="w-full flex items-center justify-center bg-primary-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 disabled:opacity-50"
            >
                {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    `PAY £${amount.toFixed(2)} NOW`
                )}
            </button>

            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" /> Encrypted & Secure Payment
            </p>
        </form>
    );
}
