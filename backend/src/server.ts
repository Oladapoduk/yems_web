import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import deliveryZonesRoutes from './routes/deliveryZones';
import deliverySlotsRoutes from './routes/deliverySlots';
import ordersRoutes from './routes/orders';
import searchRoutes from './routes/search';
import businessRoutes from './routes/business';
import cartRoutes from './routes/cart';
import uploadRoutes from './routes/upload';
import analyticsRoutes from './routes/analytics';
import voucherRoutes from './routes/vouchers';
import emailTrackingRoutes from './routes/emailTracking';

dotenv.config();

const app: Express = express();
app.get('/', (req: Request, res: Response) => {
    res.send('Backend is running ✅');
});

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITEST;
const PORT = isTest ? 0 : (process.env.PORT || 3000);

// Middleware
const allowedOrigins: string[] = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Capture raw body for Stripe webhooks
app.use(express.json({
    verify: (req: any, _res, buf) => {
        if (req.originalUrl.includes('/webhook/stripe')) {
            req.rawBody = buf;
        }
    }
}));
app.use(express.urlencoded({ extended: true }));

// Health check routes
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'E-commerce API is running' });
});
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'E-commerce API is running', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (req: Request, res: Response) => {
    res.json({
        message: 'E-commerce API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            products: '/api/products',
            categories: '/api/categories',
            deliveryZones: '/api/delivery-zones',
            deliverySlots: '/api/delivery-slots',
            orders: '/api/orders',
            search: '/api/search'
        }
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/delivery-zones', deliveryZonesRoutes);
app.use('/api/delivery-slots', deliverySlotsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/email-tracking', emailTrackingRoutes);

// Start server
if (!isTest) {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📦 Environment: ${process.env.NODE_ENV}`);
    });
}

export default app;
