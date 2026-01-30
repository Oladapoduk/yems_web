import api from './api';

export interface DeliveryZone {
    id: string;
    name: string;
    deliveryFee: number;
    minimumOrder: number;
}

export interface PostcodeValidationResponse {
    isValid: boolean;
    zone?: DeliveryZone;
    message?: string;
}

export interface DeliverySlot {
    id: string;
    startTime: string;
    endTime: string;
    available: number;
    maxOrders: number;
}

export interface SlotsByDate {
    [date: string]: DeliverySlot[];
}

export const deliveryService = {
    validatePostcode: async (postcode: string): Promise<PostcodeValidationResponse> => {
        const response = await api.post('/delivery-zones/validate-postcode', { postcode });
        return response.data;
    },

    getDeliverySlots: async (startDate: string, endDate?: string): Promise<SlotsByDate> => {
        const response = await api.get('/delivery-slots', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    getSlotDetails: async (id: string): Promise<any> => {
        const response = await api.get(`/delivery-slots/${id}`);
        return response.data;
    }
};
