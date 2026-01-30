import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
// We need to import the express app. Assuming it's in src/app.ts or similar.
// I'll check the backend structure.
import app from '../server';

describe('Product API', () => {
    it('GET /api/products should return a list of products', async () => {
        const response = await request(app).get('/api/products');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('products');
        expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('GET /api/products with search should filter products', async () => {
        const response = await request(app).get('/api/products?search=Tilapia');
        expect(response.status).toBe(200);
        expect(response.body.products.every((p: any) =>
            p.name.toLowerCase().includes('tilapia') ||
            p.description.toLowerCase().includes('tilapia')
        )).toBe(true);
    });

    it('GET /api/products/suggestions should return grouped results', async () => {
        const response = await request(app).get('/api/products/suggestions?q=frozen');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('suggestions');
        const { suggestions } = response.body;
        expect(suggestions).toHaveProperty('products');
        expect(suggestions).toHaveProperty('categories');
        expect(suggestions).toHaveProperty('synonyms');

        if (suggestions.products.length > 0) {
            const p = suggestions.products[0];
            expect(p).toHaveProperty('id');
            expect(p).toHaveProperty('name');
            expect(p).toHaveProperty('price');
            expect(p).toHaveProperty('category');
        }
    });
});
