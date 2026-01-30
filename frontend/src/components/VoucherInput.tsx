import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { validateVoucher } from '../api/vouchers';
import { Loader2, Tag, X, CheckCircle } from 'lucide-react';

export function VoucherInput() {
    const { user } = useAuthStore();
    const { appliedVoucher, applyVoucher, removeVoucher, getSubtotal } = useCartStore();
    const [voucherCode, setVoucherCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) {
            setError('Please enter a voucher code');
            return;
        }

        setIsValidating(true);
        setError('');

        try {
            const subtotal = getSubtotal();
            const result = await validateVoucher(
                voucherCode,
                subtotal,
                user?.id || null,
                user ? null : undefined // Will be set during checkout if guest
            );

            if (result.valid && result.voucher && result.discountAmount !== undefined) {
                applyVoucher({
                    code: result.voucher.code,
                    type: result.voucher.type,
                    value: result.voucher.value,
                    discountAmount: result.discountAmount
                });
                setVoucherCode('');
            } else {
                setError(result.message || 'Invalid voucher code');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to validate voucher');
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemoveVoucher = () => {
        removeVoucher();
        setError('');
    };

    if (appliedVoucher) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-green-900">
                                Voucher Applied: <span className="font-bold">{appliedVoucher.code}</span>
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                                {appliedVoucher.type === 'FIXED'
                                    ? `£${appliedVoucher.value.toFixed(2)} off`
                                    : `${appliedVoucher.value}% off`
                                }
                                {' '}- You save £{appliedVoucher.discountAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRemoveVoucher}
                        className="text-green-600 hover:text-green-800 p-1"
                        aria-label="Remove voucher"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <label htmlFor="voucher-code" className="text-sm font-medium text-gray-700">
                    Have a voucher code?
                </label>
            </div>

            <div className="flex gap-2">
                <input
                    id="voucher-code"
                    type="text"
                    placeholder="Enter code"
                    value={voucherCode}
                    onChange={(e) => {
                        setVoucherCode(e.target.value.toUpperCase());
                        setError('');
                    }}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyVoucher();
                        }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm uppercase"
                    disabled={isValidating}
                />
                <button
                    onClick={handleApplyVoucher}
                    disabled={isValidating || !voucherCode.trim()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                    {isValidating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        'Apply'
                    )}
                </button>
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
