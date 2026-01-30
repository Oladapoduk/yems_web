import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Create business profile
router.post('/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { companyName, vatNumber, businessAddress, purchaseOrderPrefix } = req.body;

        // Update user role to BUSINESS
        await prisma.user.update({
            where: { id: userId },
            data: { role: 'BUSINESS' }
        });

        // Create business profile
        const profile = await prisma.businessProfile.create({
            data: {
                userId,
                companyName,
                vatNumber,
                businessAddress,
                purchaseOrderPrefix
            }
        });

        res.status(201).json(profile);
    } catch (error) {
        console.error('Error creating business profile:', error);
        res.status(500).json({ message: 'Failed to create business profile' });
    }
});

// Get business profile
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        const profile = await prisma.businessProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true
                    }
                }
            }
        });

        if (!profile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching business profile:', error);
        res.status(500).json({ message: 'Failed to fetch business profile' });
    }
});

// Update business profile
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { companyName, vatNumber, businessAddress, purchaseOrderPrefix } = req.body;

        const profile = await prisma.businessProfile.update({
            where: { userId },
            data: {
                companyName,
                vatNumber,
                businessAddress,
                purchaseOrderPrefix
            }
        });

        res.json(profile);
    } catch (error) {
        console.error('Error updating business profile:', error);
        res.status(500).json({ message: 'Failed to update business profile' });
    }
});

// Generate VAT invoice for an order
router.get('/invoice/:orderNumber', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { orderNumber } = req.params;
        const userId = (req as any).user.userId;

        const order = await prisma.order.findFirst({
            where: {
                orderNumber,
                userId,
                isBusinessOrder: true
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                },
                deliveryZone: true,
                deliverySlot: true,
                user: {
                    include: {
                        businessProfile: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found or not a business order' });
        }

        const invoiceData = {
            invoiceNumber: `INV-${order.orderNumber}`,
            invoiceDate: order.createdAt,
            orderNumber: order.orderNumber,
            company: {
                name: order.user?.businessProfile?.companyName,
                vatNumber: order.vatNumber,
                address: order.user?.businessProfile?.businessAddress
            },
            items: order.orderItems.map(item => ({
                description: item.productName,
                quantity: item.quantity,
                unitPrice: Number(item.productPrice),
                netAmount: Number(item.finalPrice),
                vatRate: 0, // Most food items are zero-rated for VAT in UK
                vatAmount: 0,
                grossAmount: Number(item.finalPrice)
            })),
            subtotal: Number(order.subtotal),
            deliveryFee: Number(order.deliveryFee),
            totalNet: Number(order.total),
            totalVAT: 0,
            totalGross: Number(order.total)
        };

        res.json(invoiceData);
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ message: 'Failed to generate invoice' });
    }
});

// Get order history for reordering
router.get('/reorder/:orderNumber', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { orderNumber } = req.params;
        const userId = (req as any).user.userId;

        const order = await prisma.order.findFirst({
            where: {
                orderNumber,
                userId
            },
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                price: true,
                                isAvailable: true,
                                stockQuantity: true
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Return items that are still available
        const availableItems = order.orderItems
            .filter(item => item.product.isAvailable && item.product.stockQuantity > 0)
            .map(item => ({
                product: item.product,
                quantity: item.quantity
            }));

        res.json({
            orderNumber: order.orderNumber,
            originalDate: order.createdAt,
            items: availableItems,
            unavailableCount: order.orderItems.length - availableItems.length
        });
    } catch (error) {
        console.error('Error fetching reorder data:', error);
        res.status(500).json({ message: 'Failed to fetch reorder data' });
    }
});

export default router;
