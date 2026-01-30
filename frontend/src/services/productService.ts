import api from './api';
import type { Product } from '../types';

export type { Product };

export interface ProductsResponse {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
}

export interface ProductFilters {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
}

export const productService = {
    getProducts: async (filters: ProductFilters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) params.append(key, value.toString());
        });

        const response = await api.get<ProductsResponse>(`/products?${params.toString()}`);
        return response.data;
    },

    getProduct: async (id: string) => {
        const response = await api.get<{ product: Product }>(`/products/${id}`);
        return response.data.product;
    },

    getCategories: async () => {
        const response = await api.get<{ categories: any[] }>('/categories');
        return response.data.categories;
    }
};
