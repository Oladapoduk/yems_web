import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Get cart (works for both authenticated and guest users)
router.get('/', optionalAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const sessionId = req.headers['x-session-id'] as string;

        if (!userId && !sessionId) {
            return res.json({ items: [], total: 0 });
        }

        const cartItems = await prisma.cartItem.findMany({
            where: userId
                ? { userId, sessionId: null }
                : { sessionId, userId: null },
            include: {
                product: {
                    include: {
                        category: true
                    }
                }
            }
        });

        const total = cartItems.reduce((sum, item) => {
            return sum + (Number(item.product.price) * item.quantity);
        }, 0);

        res.json({
            items: cartItems,
            total,
            itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Failed to fetch cart' });
    }
});

// Add item to cart
router.post('/add', optionalAuth, async (req: Request, res: Response) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = (req as any).user?.userId;
        const sessionId = req.headers['x-session-id'] as string;

        if (!userId && !sessionId) {
            return res.status(400).json({ message: 'Session ID required for guest users' });
        }

        // Verify product exists and is available
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product || !product.isAvailable) {
            return res.status(400).json({ message: 'Product not available' });
        }

        // Check if item already exists in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                productId,
                ...(userId ? { userId } : { sessionId })
            }
        });

        let cartItem;
        if (existingItem) {
            // Update quantity
            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + quantity
                },
                include: {
                    product: true
                }
            });
        } else {
            // Create new cart item
            cartItem = await prisma.cartItem.create({
                data: {
                    productId,
                    quantity,
                    userId: userId || null,
                    sessionId: sessionId || null
                },
                include: {
                    product: true
                }
            });
        }

        res.json(cartItem);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Failed to add to cart' });
    }
});

// Update cart item quantity
router.put('/items/:itemId', optionalAuth, async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const userId = (req as any).user?.userId;
        const sessionId = req.headers['x-session-id'] as string;

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        // Verify ownership
        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                ...(userId ? { userId } : { sessionId })
            }
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        const updated = await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
            include: {
                product: true
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Failed to update cart item' });
    }
});

// Remove item from cart
router.delete('/items/:itemId', optionalAuth, async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const userId = (req as any).user?.userId;
        const sessionId = req.headers['x-session-id'] as string;

        // Verify ownership
        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                ...(userId ? { userId } : { sessionId })
            }
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        await prisma.cartItem.delete({
            where: { id: itemId }
        });

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ message: 'Failed to remove cart item' });
    }
});

// Clear cart
router.delete('/clear', optionalAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const sessionId = req.headers['x-session-id'] as string;

        await prisma.cartItem.deleteMany({
            where: userId
                ? { userId }
                : { sessionId }
        });

        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Failed to clear cart' });
    }
});

// Merge guest cart with user cart (when user logs in)
router.post('/merge', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID required' });
        }

        // Get guest cart items
        const guestItems = await prisma.cartItem.findMany({
            where: { sessionId, userId: null }
        });

        // Merge with user's cart
        for (const guestItem of guestItems) {
            const existingUserItem = await prisma.cartItem.findFirst({
                where: {
                    userId,
                    productId: guestItem.productId
                }
            });

            if (existingUserItem) {
                // Update quantity
                await prisma.cartItem.update({
                    where: { id: existingUserItem.id },
                    data: {
                        quantity: existingUserItem.quantity + guestItem.quantity
                    }
                });
            } else {
                // Transfer to user
                await prisma.cartItem.update({
                    where: { id: guestItem.id },
                    data: {
                        userId,
                        sessionId: null
                    }
                });
            }
        }

        // Delete remaining guest items
        await prisma.cartItem.deleteMany({
            where: { sessionId }
        });

        res.json({ message: 'Cart merged successfully' });
    } catch (error) {
        console.error('Error merging cart:', error);
        res.status(500).json({ message: 'Failed to merge cart' });
    }
});

export default router;
