import { Router, Request, Response } from 'express';
import prisma from '../prisma';

const router = Router();

// Predictive search with autocomplete
router.get('/autocomplete', async (req: Request, res: Response) => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string' || q.length < 2) {
            return res.json([]);
        }

        const searchTerm = q.toLowerCase();

        // Search for synonym matches first
        const synonymMatches = await prisma.searchSynonym.findMany({
            where: {
                OR: [
                    { term: { contains: searchTerm, mode: 'insensitive' } },
                    { synonyms: { has: searchTerm } }
                ]
            }
        });

        // Build search terms including synonyms
        const searchTerms = [searchTerm];
        synonymMatches.forEach(synonym => {
            searchTerms.push(synonym.term.toLowerCase());
            searchTerms.push(...synonym.synonyms.map(s => s.toLowerCase()));
        });

        // Search products
        const products = await prisma.product.findMany({
            where: {
                isAvailable: true,
                OR: searchTerms.flatMap(term => [
                    { name: { contains: term, mode: 'insensitive' } },
                    { description: { contains: term, mode: 'insensitive' } }
                ])
            },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
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

        res.json(products);
    } catch (error) {
        console.error('Error in autocomplete search:', error);
        res.status(500).json({ message: 'Failed to perform search' });
    }
});

// Full search with filters
router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            q,
            category,
            minPrice,
            maxPrice,
            sort = 'name',
            page = '1',
            limit = '20'
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        let searchTerms: string[] = [];

        if (q && typeof q === 'string') {
            const searchTerm = q.toLowerCase();

            // Check for synonyms
            const synonymMatches = await prisma.searchSynonym.findMany({
                where: {
                    OR: [
                        { term: { contains: searchTerm, mode: 'insensitive' } },
                        { synonyms: { has: searchTerm } }
                    ]
                }
            });

            searchTerms = [searchTerm];
            synonymMatches.forEach(synonym => {
                searchTerms.push(synonym.term.toLowerCase());
                searchTerms.push(...synonym.synonyms.map(s => s.toLowerCase()));
            });
        }

        const where: any = {
            isAvailable: true
        };

        if (searchTerms.length > 0) {
            where.OR = searchTerms.flatMap(term => [
                { name: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } }
            ]);
        }

        if (category) {
            where.category = {
                slug: category as string
            };
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice as string);
            if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: {
                        select: {
                            name: true,
                            slug: true
                        }
                    }
                },
                orderBy: sort === 'price-asc'
                    ? { price: 'asc' }
                    : sort === 'price-desc'
                    ? { price: 'desc' }
                    : { name: 'asc' },
                skip,
                take: limitNum
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            products,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error in search:', error);
        res.status(500).json({ message: 'Failed to perform search' });
    }
});

// Admin: Manage synonyms
router.post('/admin/synonyms', async (req: Request, res: Response) => {
    try {
        const { term, synonyms } = req.body;

        const synonym = await prisma.searchSynonym.create({
            data: {
                term: term.toLowerCase(),
                synonyms: synonyms.map((s: string) => s.toLowerCase())
            }
        });

        res.status(201).json(synonym);
    } catch (error) {
        console.error('Error creating synonym:', error);
        res.status(500).json({ message: 'Failed to create synonym' });
    }
});

router.get('/admin/synonyms', async (req: Request, res: Response) => {
    try {
        const synonyms = await prisma.searchSynonym.findMany({
            orderBy: { term: 'asc' }
        });
        res.json(synonyms);
    } catch (error) {
        console.error('Error fetching synonyms:', error);
        res.status(500).json({ message: 'Failed to fetch synonyms' });
    }
});

export default router;
