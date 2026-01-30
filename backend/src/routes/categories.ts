import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Get all categories
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Create category (Admin only)
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, slug, description, imageUrl, parentId, sortOrder } = req.body;

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                description,
                imageUrl,
                parentId,
                sortOrder: sortOrder || 0
            }
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Update category (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, slug, description, imageUrl, parentId, sortOrder } = req.body;

        const category = await prisma.category.update({
            where: { id },
            data: {
                name,
                slug,
                description,
                imageUrl,
                parentId,
                sortOrder
            }
        });

        res.json(category);
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Delete category (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if category has products
        const productsCount = await prisma.product.count({
            where: { categoryId: id }
        });

        if (productsCount > 0) {
            res.status(400).json({ error: 'Cannot delete category with associated products' });
            return;
        }

        await prisma.category.delete({
            where: { id }
        });

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// Get single category
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;

        const category = await prisma.category.findUnique({
            where: { slug },
            include: {
                products: {
                    where: { isAvailable: true },
                    take: 20
                },
                _count: {
                    select: { products: true }
                }
            }
        });

        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }

        res.json({ category });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

export default router;
