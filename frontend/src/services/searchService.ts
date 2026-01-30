import api from './api';

export interface SearchParams {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'name' | 'price-asc' | 'price-desc';
    page?: number;
    limit?: number;
}

export const searchService = {
    async autocomplete(query: string) {
        const response = await api.get('/search/autocomplete', {
            params: { q: query }
        });
        return response.data;
    },

    async search(params: SearchParams) {
        const response = await api.get('/search', { params });
        return response.data;
    }
};
