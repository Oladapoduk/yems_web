import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Admin analytics dashboard
router.get('/dashboard', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { range = '30d' } = req.query;

        // Calculate date range
        const now = new Date();
        const daysAgo = range === '7d' ? 7 : range === '90d' ? 90 : 30;
        const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        // Get orders in date range
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate
                },
                paymentStatus: 'PAID'
            },
            include: {
                orderItems: true
            }
        });

        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate growth (compare to previous period)
        const previousStartDate = new Date(startDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const previousOrders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: previousStartDate,
                    lt: startDate
                },
                paymentStatus: 'PAID'
            }
        });

        const previousRevenue = previousOrders.reduce((sum, order) => sum + Number(order.total), 0);
        const revenueGrowth = previousRevenue > 0
            ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        const ordersGrowth = previousOrders.length > 0
            ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100
            : 0;

        // Top selling products
        const productSales = orders.reduce((acc, order) => {
            order.orderItems.forEach(item => {
                if (!acc[item.productName]) {
                    acc[item.productName] = {
                        productName: item.productName,
                        totalSold: 0,
                        revenue: 0
                    };
                }
                acc[item.productName].totalSold += item.quantity;
                acc[item.productName].revenue += Number(item.finalPrice);
            });
            return acc;
        }, {} as Record<string, { productName: string; totalSold: number; revenue: number }>);

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Low stock products (less than 10 items)
        const lowStockProducts = await prisma.product.findMany({
            where: {
                stockQuantity: {
                    lte: 10
                },
                isAvailable: true
            },
            select: {
                id: true,
                name: true,
                stockQuantity: true,
                category: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                stockQuantity: 'asc'
            },
            take: 10
        });

        // Recent orders
        const recentOrders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            select: {
                orderNumber: true,
                total: true,
                status: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        // Orders by status
        const ordersByStatus = await prisma.order.groupBy({
            by: ['status'],
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            _count: {
                status: true
            }
        });

        const statusCounts = ordersByStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {} as Record<string, number>);

        res.json({
            totalRevenue: Number(totalRevenue.toFixed(2)),
            totalOrders,
            averageOrderValue: Number(averageOrderValue.toFixed(2)),
            revenueGrowth: Number(revenueGrowth.toFixed(1)),
            ordersGrowth: Number(ordersGrowth.toFixed(1)),
            topProducts,
            lowStockProducts,
            recentOrders,
            ordersByStatus: statusCounts
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;
