import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Get all active delivery zones
router.get('/', async (req: Request, res: Response) => {
    try {
        const zones = await prisma.deliveryZone.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });

        res.json(zones);
    } catch (error) {
        console.error('Error fetching delivery zones:', error);
        res.status(500).json({ message: 'Failed to fetch delivery zones' });
    }
});

// Validate postcode and get delivery zone
router.post('/validate-postcode', async (req: Request, res: Response) => {
    try {
        const { postcode } = req.body;

        if (!postcode) {
            return res.status(400).json({ message: 'Postcode is required' });
        }

        // Normalize postcode (remove spaces, convert to uppercase)
        const normalizedPostcode = postcode.replace(/\s/g, '').toUpperCase();

        // Extract prefix (first 2-4 characters)
        const postcodePrefix = normalizedPostcode.substring(0, normalizedPostcode.length >= 4 ? 4 : 2);

        // Find matching delivery zone
        const zone = await prisma.deliveryZone.findFirst({
            where: {
                isActive: true,
                postcodePrefixes: {
                    hasSome: [postcodePrefix.substring(0, 2), postcodePrefix.substring(0, 3), postcodePrefix.substring(0, 4)]
                }
            }
        });

        if (!zone) {
            return res.status(404).json({
                message: 'Sorry, we do not deliver to this postcode yet.',
                isValid: false
            });
        }

        res.json({
            isValid: true,
            zone: {
                id: zone.id,
                name: zone.name,
                deliveryFee: zone.deliveryFee,
                minimumOrder: zone.minimumOrder
            }
        });
    } catch (error) {
        console.error('Error validating postcode:', error);
        res.status(500).json({ message: 'Failed to validate postcode' });
    }
});

// Admin: Create delivery zone
router.post('/admin', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { name, postcodePrefixes, deliveryFee, minimumOrder } = req.body;

        const zone = await prisma.deliveryZone.create({
            data: {
                name,
                postcodePrefixes,
                deliveryFee,
                minimumOrder
            }
        });

        res.status(201).json(zone);
    } catch (error) {
        console.error('Error creating delivery zone:', error);
        res.status(500).json({ message: 'Failed to create delivery zone' });
    }
});

// Admin: Update delivery zone
router.put('/admin/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, postcodePrefixes, deliveryFee, minimumOrder, isActive } = req.body;

        const zone = await prisma.deliveryZone.update({
            where: { id },
            data: {
                name,
                postcodePrefixes,
                deliveryFee,
                minimumOrder,
                isActive
            }
        });

        res.json(zone);
    } catch (error) {
        console.error('Error updating delivery zone:', error);
        res.status(500).json({ message: 'Failed to update delivery zone' });
    }
});

export default router;
