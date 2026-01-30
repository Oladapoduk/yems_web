import { CheckCircle, Package, Truck, ShoppingBag, Clock } from 'lucide-react';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

interface OrderStatusStepperProps {
    status: OrderStatus;
    updatedAt: string;
}

const steps = [
    { key: 'PENDING', label: 'Order Received', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { key: 'CONFIRMED', label: 'Confirmed', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { key: 'PACKED', label: 'Being Packed', icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
    { key: 'OUT_FOR_DELIVERY', label: 'On Its Way', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
];

export default function OrderStatusStepper({ status, updatedAt }: OrderStatusStepperProps) {
    if (status === 'CANCELLED') {
        return (
            <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100 flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                    <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-red-900 uppercase">Order Cancelled</h3>
                    <p className="text-red-700 font-medium">This order was cancelled on {new Date(updatedAt).toLocaleDateString()}</p>
                </div>
            </div>
        );
    }

    const currentStepIndex = steps.findIndex(s => s.key === status);

    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary-600 animate-pulse"></div>
                Live Order Status
            </h2>

            <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-100 md:left-0 md:right-0 md:top-6 md:h-1 md:w-full"></div>

                {/* Active Progress Bar */}
                <div
                    className="absolute left-6 top-0 w-1 bg-primary-600 transition-all duration-1000 ease-out md:left-0 md:top-6 md:h-1 md:w-full"
                    style={{
                        height: typeof window !== 'undefined' && window.innerWidth < 768 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : 'auto',
                        width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : 'auto'
                    }}
                ></div>

                <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <div key={step.key} className="flex md:flex-col items-center gap-4 md:text-center group relative">
                                <div
                                    className={`relative z-10 p-3 rounded-2xl transition-all duration-500 border-2 ${isCompleted
                                            ? `${step.bg} ${step.color} border-white shadow-lg scale-110`
                                            : 'bg-white text-gray-300 border-gray-100'
                                        }`}
                                >
                                    <Icon className={`h-6 w-6 ${isCurrent ? 'animate-bounce' : ''}`} />
                                    {isCurrent && (
                                        <div className="absolute inset-0 rounded-2xl bg-current opacity-20 animate-ping"></div>
                                    )}
                                </div>
                                <div className="flex flex-col md:items-center">
                                    <span className={`text-sm font-black uppercase tracking-wider transition-colors duration-500 ${isCompleted ? 'text-gray-900' : 'text-gray-400'
                                        }`}>
                                        {step.label}
                                    </span>
                                    {isCurrent && (
                                        <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full mt-1">
                                            Current Status
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <p className="mt-8 pt-8 border-t border-gray-50 text-center text-xs text-gray-400 font-medium italic">
                Last updated: {new Date(updatedAt).toLocaleString()}
            </p>
        </div>
    );
}

import { XCircle } from 'lucide-react';
