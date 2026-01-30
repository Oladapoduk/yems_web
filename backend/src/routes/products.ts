import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Search suggestions endpoint (autocomplete)
router.get('/suggestions', async (req: Request, res: Response): Promise<void> => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string' || q.length < 2) {
            res.json({ suggestions: [] });
            return;
        }

        const searchTerm = q.toLowerCase();

        // Get matching products (limit to 8 suggestions)
        const products = await prisma.product.findMany({
            where: {
                AND: [
                    { isAvailable: true },
                    {
                        OR: [
                            { name: { contains: searchTerm, mode: 'insensitive' } },
                            { description: { contains: searchTerm, mode: 'insensitive' } }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                priceType: true,
                imageUrls: true,
                category: {
                    select: {
                        name: true
                    }
                }
            },
            take: 8,
            orderBy: {
                name: 'asc'
            }
        });

        // Get matching categories
        const categories = await prisma.category.findMany({
            where: {
                name: { contains: searchTerm, mode: 'insensitive' }
            },
            select: {
                id: true,
                name: true,
                slug: true
            },
            take: 3
        });

        // Check search synonyms
        const synonyms = await prisma.searchSynonym.findMany({
            where: {
                OR: [
                    { term: { contains: searchTerm, mode: 'insensitive' } },
                    { synonyms: { has: searchTerm } }
                ]
            },
            select: {
                term: true,
                synonyms: true
            },
            take: 2
        });

        res.json({
            suggestions: {
                products,
                categories,
                synonyms: synonyms.map(s => ({
                    term: s.term,
                    alternatives: s.synonyms
                }))
            }
        });
    } catch (error) {
        console.error('Search suggestions error:', error);
        res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
});

// Get all products with filters
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            inStock,
            page = '1',
            limit = '20',
            sort = 'createdAt'
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const where: any = {};

        if (category) {
            where.category = {
                slug: category
            };
        }

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice as string);
            if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
        }

        if (inStock === 'true') {
            where.isAvailable = true;
            where.stockQuantity = { gt: 0 };
        }

        // Get products
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true
                },
                skip,
                take: limitNum,
                orderBy: { [sort as string]: 'desc' }
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            products,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true
            }
        });

        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        res.json({ product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create product (Admin only)
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            name,
            slug,
            description,
            categoryId,
            price,
            priceType,
            weightMin,
            weightMax,
            stockQuantity,
            isAvailable,
            allergens,
            nutritionalInfo,
            storageInstructions,
            imageUrls
        } = req.body;

        // Validate required fields
        if (!name || !slug || !categoryId || !price) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                categoryId,
                price,
                priceType: priceType || 'FIXED',
                weightMin,
                weightMax,
                stockQuantity: stockQuantity || 0,
                isAvailable: isAvailable !== undefined ? isAvailable : true,
                allergens: allergens || [],
                nutritionalInfo,
                storageInstructions,
                imageUrls: imageUrls || []
            },
            include: {
                category: true
            }
        });

        res.status(201).json({ product });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                category: true
            }
        });

        res.json({ product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        await prisma.product.delete({
            where: { id }
        });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;
