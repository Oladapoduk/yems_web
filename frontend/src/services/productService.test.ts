import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from '../services/productService';
import api from '../services/api';

// Mock the axios instance
vi.mock('../services/api', () => ({
    default: {
        get: vi.fn()
    }
}));

describe('productService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getProducts should call the correct API endpoint', async () => {
        const mockProducts = { products: [], total: 0 };
        (api.get as any).mockResolvedValueOnce({ data: mockProducts });

        const result = await productService.getProducts({ category: 'frozen' });

        expect(api.get).toHaveBeenCalledWith('/products?category=frozen');
        expect(result).toEqual(mockProducts);
    });
});
