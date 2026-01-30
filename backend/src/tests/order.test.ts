import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server';
import prisma from '../prisma';

// Mock authentication middleware
vi.mock('../middleware/auth', () => ({
    authenticateToken: (req: any, res: any, next: any) => {
        req.user = { userId: 'test-user-id' };
        next();
    },
    authenticate: (req: any, res: any, next: any) => {
        req.user = { userId: 'test-user-id' };
        next();
    },
    requireAdmin: (req: any, res: any, next: any) => {
        next();
    },
    optionalAuth: (req: any, res: any, next: any) => {
        next();
    }
}));

describe('Orders API', () => {
    it('GET /api/orders/my-orders should return user orders', async () => {
        // We assume there's a user with 'test-user-id' in the dev/test database
        // or we could use prisma to seed it here.
        const response = await request(app).get('/api/orders/my-orders');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/orders/substitution/INVALID/INVALID/respond should return 404', async () => {
        const response = await request(app)
            .post('/api/orders/substitution/ORD-123/ITEM-123/respond')
            .send({ status: 'ACCEPTED' });
        expect(response.status).toBe(404);
    });
});
