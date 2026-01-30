import api from './api';

export interface CreateOrderData {
    userId?: string;
    guestEmail?: string;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    deliveryAddress: {
        firstName: string;
        lastName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        postcode: string;
    };
    deliveryPostcode: string;
    deliveryZoneId: string;
    deliverySlotId: string;
    isBusinessOrder?: boolean;
    vatNumber?: string;
    purchaseOrderNumber?: string;
    notes?: string;
}

export const orderService = {
    createOrder: async (orderData: CreateOrderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data;
    },

    getOrderByNumber: async (orderNumber: string) => {
        const response = await api.get(`/orders/${orderNumber}`);
        return response.data;
    },

    respondToSubstitution: async (orderNumber: string, itemId: string, status: 'ACCEPTED' | 'REFUNDED') => {
        const response = await api.post(`/orders/substitution/${orderNumber}/${itemId}/respond`, { status });
        return response.data;
    }
};
