import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Get available delivery slots for a date range
router.get('/', async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate) {
            return res.status(400).json({ message: 'Start date is required' });
        }

        const slots = await prisma.deliverySlot.findMany({
            where: {
                isAvailable: true,
                date: {
                    gte: new Date(startDate as string),
                    ...(endDate && { lte: new Date(endDate as string) })
                },
                currentBookings: {
                    lt: prisma.deliverySlot.fields.maxOrders
                }
            },
            orderBy: [
                { date: 'asc' },
                { startTime: 'asc' }
            ]
        });

        // Group by date
        const slotsByDate = slots.reduce((acc, slot) => {
            const dateKey = slot.date.toISOString().split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push({
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                available: slot.maxOrders - slot.currentBookings,
                maxOrders: slot.maxOrders
            });
            return acc;
        }, {} as Record<string, any[]>);

        res.json(slotsByDate);
    } catch (error) {
        console.error('Error fetching delivery slots:', error);
        res.status(500).json({ message: 'Failed to fetch delivery slots' });
    }
});

// Get specific slot details
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const slot = await prisma.deliverySlot.findUnique({
            where: { id }
        });

        if (!slot) {
            return res.status(404).json({ message: 'Delivery slot not found' });
        }

        res.json(slot);
    } catch (error) {
        console.error('Error fetching delivery slot:', error);
        res.status(500).json({ message: 'Failed to fetch delivery slot' });
    }
});

/**
 * Admin: Get all slots for a specific date (flat list)
 * Used by AdminDeliverySlots page
 */
router.get('/admin/list', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { date } = req.query;

        console.log('Admin fetching slots for date:', date);

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        // Use a date range for the specific day to avoid timezone issues
        const targetDate = new Date(date as string);
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);

        const slots = await prisma.deliverySlot.findMany({
            where: {
                date: {
                    gte: targetDate,
                    lt: nextDay
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        console.log(`Found ${slots.length} slots for ${date}`);

        res.json({ slots });
    } catch (error) {
        console.error('Error in /admin/list:', error);
        res.status(500).json({
            message: 'Failed to fetch admin delivery slots',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Admin: Create delivery slot
router.post('/admin', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { date, startTime, endTime, maxOrders } = req.body;

        const slot = await prisma.deliverySlot.create({
            data: {
                date: new Date(date),
                startTime,
                endTime,
                maxOrders
            }
        });

        res.status(201).json(slot);
    } catch (error) {
        console.error('Error creating delivery slot:', error);
        res.status(500).json({ message: 'Failed to create delivery slot' });
    }
});

// Admin: Create bulk delivery slots
router.post('/admin/bulk', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, timeSlots } = req.body;
        // timeSlots: [{ startTime: "09:00", endTime: "12:00", maxOrders: 20 }]

        console.log('Creating bulk slots:', { startDate, endDate, timeSlots });

        const start = new Date(startDate);
        const end = new Date(endDate);
        const slots = [];

        // Fix: Create new Date object for each iteration to avoid mutation
        let currentDate = new Date(start);
        while (currentDate <= end) {
            for (const timeSlot of timeSlots) {
                slots.push({
                    date: new Date(currentDate), // Create new Date object
                    startTime: timeSlot.startTime,
                    endTime: timeSlot.endTime,
                    maxOrders: timeSlot.maxOrders
                });
            }
            // Increment date
            currentDate = new Date(currentDate);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log(`Prepared ${slots.length} slots to create`);

        const created = await prisma.deliverySlot.createMany({
            data: slots,
            skipDuplicates: true
        });

        console.log(`Successfully created ${created.count} delivery slots`);

        res.status(201).json({
            message: 'Delivery slots created successfully',
            count: created.count
        });
    } catch (error) {
        console.error('Error creating bulk delivery slots:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({
            message: 'Failed to create delivery slots',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Admin: Update delivery slot
router.put('/admin/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, maxOrders, isAvailable } = req.body;

        const slot = await prisma.deliverySlot.update({
            where: { id },
            data: {
                startTime,
                endTime,
                maxOrders,
                isAvailable
            }
        });

        res.json(slot);
    } catch (error) {
        console.error('Error updating delivery slot:', error);
        res.status(500).json({ message: 'Failed to update delivery slot' });
    }
});

// Admin: Delete delivery slot
router.delete('/admin/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.deliverySlot.delete({
            where: { id }
        });

        res.json({ message: 'Delivery slot deleted successfully' });
    } catch (error) {
        console.error('Error deleting delivery slot:', error);
        res.status(500).json({ message: 'Failed to delete delivery slot' });
    }
});

// Admin: Patch delivery slot (for toggling status)
router.patch('/admin/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isAvailable } = req.body;

        const slot = await prisma.deliverySlot.update({
            where: { id },
            data: { isAvailable }
        });

        res.json(slot);
    } catch (error) {
        console.error('Error updating delivery slot:', error);
        res.status(500).json({ message: 'Failed to update delivery slot' });
    }
});

export default router;
