import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { upload, uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary } from '../services/uploadService';

const router = Router();

// Upload single image (Admin only)
router.post(
    '/image',
    authenticateToken,
    requireAdmin,
    upload.single('image'),
    async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const folder = (req.body.folder as string) || 'products';
            const imageUrl = await uploadToCloudinary(req.file, folder);

            res.json({
                success: true,
                url: imageUrl
            });
        } catch (error: any) {
            console.error('Upload error:', error);
            res.status(500).json({ message: error.message || 'Failed to upload image' });
        }
    }
);

// Upload multiple images (Admin only)
router.post(
    '/images',
    authenticateToken,
    requireAdmin,
    upload.array('images', 5), // Max 5 images
    async (req: Request, res: Response) => {
        try {
            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                return res.status(400).json({ message: 'No files uploaded' });
            }

            const folder = (req.body.folder as string) || 'products';
            const imageUrls = await uploadMultipleToCloudinary(files, folder);

            res.json({
                success: true,
                urls: imageUrls
            });
        } catch (error: any) {
            console.error('Upload error:', error);
            res.status(500).json({ message: error.message || 'Failed to upload images' });
        }
    }
);

// Delete image (Admin only)
router.delete(
    '/image',
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({ message: 'Image URL required' });
            }

            await deleteFromCloudinary(url);

            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        } catch (error: any) {
            console.error('Delete error:', error);
            res.status(500).json({ message: error.message || 'Failed to delete image' });
        }
    }
);

export default router;
