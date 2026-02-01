// import { Router, Request, Response } from 'express';
// import prisma from '../prisma';
// import { authenticateToken } from '../middleware/auth';
// import Stripe from 'stripe';

// const router = Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//     apiVersion: '2024-12-18.acacia'
// });

import 'dotenv/config';                  // 👈 add this as FIRST import

import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken } from '../middleware/auth';
import Stripe from 'stripe';
import { emailService } from '../services/emailService';
import { voucherService } from '../services/voucherService';
import { hubspotService } from '../services/hubspotService';
import { validateBody } from '../middleware/validate';
import {
    createOrderSchema,
    updateOrderStatusSchema,
    substitutionResponseSchema,
    createSubstitutionSchema
} from '../validators/orderValidator';

const router = Router();

interface DeliveryAddress {
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postcode: string;
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia',
});

// Create order with payment intent
router.post('/', validateBody(createOrderSchema), async (req: Request, res: Response) => {
    try {
        const {
            userId,
            guestEmail,
            orderItems: items,
            deliveryAddress,
            deliveryPostcode,
            deliveryZoneId,
            deliverySlotId,
            isBusinessOrder,
            vatNumber,
            purchaseOrderNumber,
            notes,
            voucherCode
        } = req.body;

        // ... (rest of the creation logic seems fine)

        // Validate delivery slot availability
        const slot = await prisma.deliverySlot.findUnique({
            where: { id: deliverySlotId }
        });

        if (!slot || !slot.isAvailable || slot.currentBookings >= slot.maxOrders) {
            return res.status(400).json({ message: 'Selected delivery slot is no longer available' });
        }

        // Get delivery zone
        const zone = await prisma.deliveryZone.findUnique({
            where: { id: deliveryZoneId }
        });

        if (!zone) {
            return res.status(400).json({ message: 'Invalid delivery zone' });
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId }
            });

            if (!product || !product.isAvailable) {
                return res.status(400).json({ message: `Product ${item.productId} is not available` });
            }

            const itemTotal = Number(product.price) * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                productId: product.id,
                productName: product.name,
                productPrice: product.price,
                quantity: item.quantity,
                finalPrice: itemTotal
            });
        }

        // Check minimum order
        if (subtotal < Number(zone.minimumOrder)) {
            return res.status(400).json({
                message: `Minimum order amount for your area is £${zone.minimumOrder}`
            });
        }

        // Validate and apply voucher if provided
        let discountAmount = 0;
        let finalSubtotal = subtotal;
        let voucherId: string | null = null;

        if (voucherCode) {
            const validation = await voucherService.validateVoucher({
                code: voucherCode,
                userId,
                guestEmail,
                subtotal
            });

            if (!validation.isValid) {
                return res.status(400).json({ message: validation.message });
            }

            discountAmount = validation.discountAmount!;
            finalSubtotal = subtotal - discountAmount;
            voucherId = validation.voucher!.id;
        }

        const deliveryFee = Number(zone.deliveryFee);
        const total = finalSubtotal + deliveryFee;

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), // Convert to cents
            currency: 'gbp',
            metadata: {
                orderNumber,
                deliveryPostcode
            }
        });

        // Create order in database
        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: userId || null,
                guestEmail: !userId ? guestEmail : null,
                subtotal,
                voucherId,
                discountAmount,
                finalSubtotal,
                deliveryFee,
                total,
                deliveryAddress,
                deliveryPostcode,
                deliveryZoneId,
                deliverySlotId,
                paymentIntentId: paymentIntent.id,
                isBusinessOrder: isBusinessOrder || false,
                vatNumber,
                purchaseOrderNumber,
                notes,
                orderItems: {
                    create: orderItems
                }
            },
            include: {
                orderItems: true,
                deliverySlot: true,
                deliveryZone: true,
                voucher: true
            }
        });

        // Increment slot booking count
        await prisma.deliverySlot.update({
            where: { id: deliverySlotId },
            data: {
                currentBookings: {
                    increment: 1
                }
            }
        });

        // Record voucher usage if voucher was applied
        if (voucherId) {
            await voucherService.recordUsage(voucherId, userId, guestEmail, order.id);
        }

        // Sync order to HubSpot (async, don't wait)
        hubspotService.syncOrder(order.id).catch(err => {
            console.error('HubSpot sync failed:', err);
            // Don't fail the order creation if HubSpot sync fails
        });

        res.status(201).json({
            order,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Failed to create order' });
    }
});

// Get user's orders (authenticated)
router.get('/my-orders', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                },
                deliverySlot: true,
                deliveryZone: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// Get specific order
router.get('/:orderNumber', async (req: Request, res: Response) => {
    try {
        const { orderNumber } = req.params;

        const order = await prisma.order.findUnique({
            where: { orderNumber },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                },
                deliverySlot: true,
                deliveryZone: true,
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Failed to fetch order' });
    }
});

// Update payment status (webhook)
router.post('/webhook/stripe', async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            (req as any).rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update order status
        const updatedOrders = await prisma.order.updateMany({
            where: { paymentIntentId: paymentIntent.id },
            data: {
                paymentStatus: 'PAID',
                status: 'CONFIRMED'
            }
        });

        // Send order confirmation email
        if (updatedOrders.count > 0) {
            const order = await prisma.order.findFirst({
                where: { paymentIntentId: paymentIntent.id },
                select: {
                    orderNumber: true,
                    guestEmail: true,
                    deliveryAddress: true,
                    subtotal: true,
                    discountAmount: true,
                    finalSubtotal: true,
                    deliveryFee: true,
                    total: true,
                    user: {
                        select: {
                            email: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    voucher: {
                        select: {
                            code: true
                        }
                    },
                    orderItems: {
                        select: {
                            productName: true,
                            quantity: true,
                            productPrice: true
                        }
                    },
                    deliverySlot: {
                        select: {
                            date: true,
                            startTime: true,
                            endTime: true
                        }
                    }
                }
            });

            if (order) {
                const customerEmail = order.user?.email || order.guestEmail;
                const address = (order.deliveryAddress as unknown) as DeliveryAddress;
                const customerName = order.user
                    ? `${order.user.firstName} ${order.user.lastName}`
                    : address.firstName + ' ' + address.lastName;

                if (customerEmail && address) {
                    try {
                        await emailService.sendOrderConfirmation({
                            to: customerEmail,
                            orderNumber: order.orderNumber,
                            customerName,
                            orderItems: order.orderItems.map(item => ({
                                productName: item.productName,
                                quantity: item.quantity,
                                price: Number(item.productPrice)
                            })),
                            subtotal: Number(order.subtotal),
                            discountAmount: order.discountAmount ? Number(order.discountAmount) : undefined,
                            voucherCode: order.voucher?.code,
                            finalSubtotal: order.finalSubtotal ? Number(order.finalSubtotal) : undefined,
                            deliveryFee: Number(order.deliveryFee),
                            total: Number(order.total),
                            deliveryAddress: address,
                            deliverySlot: {
                                date: new Date(order.deliverySlot!.date),
                                startTime: order.deliverySlot!.startTime,
                                endTime: order.deliverySlot!.endTime
                            }
                        });
                    } catch (emailError) {
                        console.error('Failed to send order confirmation email:', emailError);
                        // Don't fail the webhook if email fails
                    }
                }
            }
        }
    }

    res.json({ received: true });
});

// Admin: Get all orders
router.get('/admin/all', async (req: Request, res: Response) => {
    try {
        const { status, date } = req.query;

        const orders = await prisma.order.findMany({
            where: {
                ...(status && { status: status as any }),
                ...(date && {
                    createdAt: {
                        gte: new Date(date as string),
                        lt: new Date(new Date(date as string).getTime() + 24 * 60 * 60 * 1000)
                    }
                })
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                },
                deliverySlot: true,
                deliveryZone: true,
                user: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// Admin: Update order status
router.patch('/admin/:orderNumber/status', validateBody(updateOrderStatusSchema), async (req: Request, res: Response) => {
    try {
        const { orderNumber } = req.params;
        const { status } = req.body;

        const order = await prisma.order.update({
            where: { orderNumber },
            data: { status },
            select: {
                id: true,
                orderNumber: true,
                status: true,
                deliveryAddress: true,
                guestEmail: true,
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                },
                deliverySlot: {
                    select: {
                        date: true,
                        startTime: true,
                        endTime: true
                    }
                },
                orderItems: {
                    select: {
                        id: true,
                        productName: true,
                        quantity: true
                    }
                }
            }
        });

        // Send email notifications based on status
        const customerEmail = order.user?.email || order.guestEmail;
        const address = (order.deliveryAddress as unknown) as DeliveryAddress;
        const customerName = order.user
            ? `${order.user.firstName} ${order.user.lastName}`
            : address.firstName + ' ' + address.lastName;

        if (customerEmail) {
            try {
                if (status === 'PACKED') {
                    await emailService.sendOrderPacked(customerEmail, orderNumber, customerName);
                } else if (status === 'OUT_FOR_DELIVERY') {
                    await emailService.sendOutForDelivery(
                        customerEmail,
                        orderNumber,
                        customerName,
                        {
                            date: new Date(order.deliverySlot!.date),
                            startTime: order.deliverySlot!.startTime,
                            endTime: order.deliverySlot!.endTime
                        }
                    );
                }
            } catch (emailError) {
                console.error('Failed to send status update email:', emailError);
                // Don't fail the request if email fails
            }
        }

        // Update HubSpot deal stage (async, don't wait)
        hubspotService.syncOrder(order.id).catch(err => {
            console.error('HubSpot status update failed:', err);
        });

        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Failed to update order status' });
    }
});

// Customer: Respond to substitution
router.post('/substitution/:orderNumber/:itemId/respond', validateBody(substitutionResponseSchema), async (req: Request, res: Response) => {
    try {
        const { orderNumber, itemId } = req.params;
        const { status } = req.body;

        if (!['ACCEPTED', 'REFUNDED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Get order item
        const orderItem = await prisma.orderItem.findUnique({
            where: { id: itemId },
            include: {
                order: {
                    include: {
                        user: true
                    }
                },
                product: true
            }
        });

        if (!orderItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }

        if (orderItem.substitutionStatus !== 'PENDING') {
            return res.status(400).json({ message: 'This substitution has already been processed' });
        }

        // Update substitution status
        const updatedItem = await prisma.orderItem.update({
            where: { id: itemId },
            data: {
                substitutionStatus: status
            }
        });

        // If refunded, process the refund via Stripe
        if (status === 'REFUNDED') {
            const order = orderItem.order;
            if (order.paymentIntentId && order.paymentStatus === 'PAID') {
                try {
                    const refundAmount = Math.round(Number(orderItem.finalPrice) * 100); // Stripe expects amount in cents
                    const refund = await stripe.refunds.create({
                        payment_intent: order.paymentIntentId,
                        amount: refundAmount,
                        reason: 'requested_by_customer',
                        metadata: {
                            orderNumber,
                            itemId,
                            reason: 'Substitution declined'
                        }
                    });

                    console.log(`Refund processed successfully: ${refund.id} for order ${orderNumber}`);

                    // Send refund confirmation email
                    const customerEmail = order.user?.email || order.guestEmail;
                    const address = (order.deliveryAddress as unknown) as DeliveryAddress;
                    const customerName = order.user
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : address.firstName + ' ' + address.lastName;

                    if (customerEmail) {
                        try {
                            await emailService.sendRefundProcessed(
                                customerEmail,
                                orderNumber,
                                customerName,
                                Number(orderItem.finalPrice)
                            );
                        } catch (emailError) {
                            console.error('Failed to send refund email:', emailError);
                        }
                    }
                } catch (stripeError: any) {
                    console.error('CRITICAL: Stripe refund failed:', stripeError);

                    // Update order item to keep as PENDING for manual review
                    await prisma.orderItem.update({
                        where: { id: itemId },
                        data: {
                            substitutionStatus: 'PENDING',
                        }
                    });

                    // Send admin alert email
                    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tantifoods.com';
                    try {
                        await emailService.sendAdminAlert({
                            to: adminEmail,
                            subject: `URGENT: Refund Failed - Order ${orderNumber}`,
                            orderNumber,
                            itemId,
                            itemName: orderItem.productName,
                            refundAmount: Number(orderItem.finalPrice),
                            error: stripeError.message || 'Unknown error'
                        });
                    } catch (emailErr) {
                        console.error('Failed to send admin alert email:', emailErr);
                    }

                    // Return error to customer
                    return res.status(500).json({
                        message: 'Refund processing failed. Our team has been notified and will process your refund manually within 24 hours.',
                        error: 'REFUND_FAILED'
                    });
                }
            } else {
                console.log(`Refund requested but no payment intent found or order not paid yet for ${orderNumber}`);
                return res.status(400).json({
                    message: 'Unable to process refund. Payment has not been completed yet.'
                });
            }
        } else if (status === 'ACCEPTED' && orderItem.substitutionProductId) {
            // Update the item with substitution product details
            const substitutionProduct = await prisma.product.findUnique({
                where: { id: orderItem.substitutionProductId }
            });

            if (substitutionProduct) {
                await prisma.orderItem.update({
                    where: { id: itemId },
                    data: {
                        productName: substitutionProduct.name,
                        productPrice: substitutionProduct.price,
                        finalPrice: Number(substitutionProduct.price) * orderItem.quantity
                    }
                });

                // Recalculate order total
                const allItems = await prisma.orderItem.findMany({
                    where: { orderId: orderItem.orderId }
                });

                const newSubtotal = allItems.reduce((sum, item) => sum + Number(item.finalPrice), 0);
                const order = orderItem.order;
                const newTotal = newSubtotal + Number(order.deliveryFee);

                await prisma.order.update({
                    where: { id: orderItem.orderId },
                    data: {
                        subtotal: newSubtotal,
                        total: newTotal
                    }
                });
            }
        }

        res.json({ message: 'Substitution response processed successfully', item: updatedItem });
    } catch (error) {
        console.error('Error processing substitution response:', error);
        res.status(500).json({ message: 'Failed to process substitution response' });
    }
});

// Admin: Handle substitution
router.post('/admin/:orderNumber/items/:itemId/substitute', validateBody(createSubstitutionSchema), async (req: Request, res: Response) => {
    try {
        const { orderNumber, itemId } = req.params;
        const { substitutionProductId } = req.body;

        // Get order item with product details
        const orderItem = await prisma.orderItem.findUnique({
            where: { id: itemId },
            include: {
                order: {
                    include: {
                        user: true
                    }
                },
                product: true
            }
        });

        if (!orderItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }

        // Get substitution product details
        const substitutionProduct = await prisma.product.findUnique({
            where: { id: substitutionProductId }
        });

        if (!substitutionProduct) {
            return res.status(404).json({ message: 'Substitution product not found' });
        }

        // Update order item
        const updatedItem = await prisma.orderItem.update({
            where: { id: itemId },
            data: {
                substitutionProductId,
                substitutionStatus: 'PENDING'
            }
        });

        // Send substitution email to customer
        const order = orderItem.order;
        const customerEmail = order.user?.email || order.guestEmail;
        const address = (order.deliveryAddress as unknown) as DeliveryAddress;
        const customerName = order.user
            ? `${order.user.firstName} ${order.user.lastName}`
            : address.firstName + ' ' + address.lastName;

        if (customerEmail) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const acceptUrl = `${frontendUrl}/substitution/${orderNumber}/${itemId}/accept`;
            const refundUrl = `${frontendUrl}/substitution/${orderNumber}/${itemId}/refund`;

            try {
                await emailService.sendSubstitutionAlert({
                    to: customerEmail,
                    orderNumber,
                    customerName,
                    originalProduct: orderItem.productName,
                    substitutionProduct: substitutionProduct.name,
                    acceptUrl,
                    refundUrl
                });
            } catch (emailError) {
                console.error('Failed to send substitution email:', emailError);
                // Don't fail the request if email fails
            }
        }

        res.json(updatedItem);
    } catch (error) {
        console.error('Error handling substitution:', error);
        res.status(500).json({ message: 'Failed to handle substitution' });
    }
});

export default router;
