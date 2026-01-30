import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '../types';

interface AppliedVoucher {
    code: string;
    type: 'FIXED' | 'PERCENTAGE';
    value: number;
    discountAmount: number;
}

interface CartState {
    items: CartItem[];
    appliedVoucher: AppliedVoucher | null;
    addItem: (product: Product, quantity: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
    applyVoucher: (voucher: AppliedVoucher) => void;
    removeVoucher: () => void;
    getSubtotal: () => number;
    getDiscountAmount: () => number;
    getFinalTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            appliedVoucher: null,

            addItem: (product, quantity) => {
                const items = get().items;
                const existingItem = items.find((item) => item.product.id === product.id);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.product.id === product.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...items, { product, quantity }] });
                }
            },

            removeItem: (productId) => {
                set({ items: get().items.filter((item) => item.product.id !== productId) });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                } else {
                    set({
                        items: get().items.map((item) =>
                            item.product.id === productId ? { ...item, quantity } : item
                        ),
                    });
                }
            },

            clearCart: () => set({ items: [], appliedVoucher: null }),

            getSubtotal: () => {
                return get().items.reduce(
                    (total, item) => total + (Number(item.product.price) * item.quantity),
                    0
                );
            },

            getTotal: () => {
                return get().items.reduce(
                    (total, item) => total + (Number(item.product.price) * item.quantity),
                    0
                );
            },

            getDiscountAmount: () => {
                return get().appliedVoucher?.discountAmount || 0;
            },

            getFinalTotal: () => {
                const subtotal = get().getSubtotal();
                const discount = get().getDiscountAmount();
                return Math.max(0, subtotal - discount);
            },

            applyVoucher: (voucher) => {
                set({ appliedVoucher: voucher });
            },

            removeVoucher: () => {
                set({ appliedVoucher: null });
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
