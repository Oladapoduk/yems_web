import { Router, Request, Response } from 'express';
import { voucherService } from '../services/voucherService';
import { validateBody } from '../middleware/validate';
import {
  createVoucherSchema,
  updateVoucherSchema,
  validateVoucherSchema
} from '../validators/voucherValidator';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Validate voucher (public/authenticated)
router.post('/validate', validateBody(validateVoucherSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, userId, guestEmail, subtotal } = req.body;

    const result = await voucherService.validateVoucher({
      code,
      userId,
      guestEmail,
      subtotal
    });

    if (result.isValid) {
      res.json({
        valid: true,
        discountAmount: result.discountAmount,
        voucher: {
          code: result.voucher.code,
          type: result.voucher.type,
          value: result.voucher.value,
          description: result.voucher.description
        }
      });
    } else {
      res.status(400).json({
        valid: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error validating voucher:', error);
    res.status(500).json({ message: 'Failed to validate voucher' });
  }
});

// Admin: Get all vouchers
router.get('/admin/all', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const vouchers = await voucherService.getAllVouchers();
    res.json({ vouchers });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({ message: 'Failed to fetch vouchers' });
  }
});

// Admin: Get single voucher
router.get('/admin/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const voucher = await voucherService.getVoucherById(id);

    if (!voucher) {
      res.status(404).json({ message: 'Voucher not found' });
      return;
    }

    res.json({ voucher });
  } catch (error) {
    console.error('Error fetching voucher:', error);
    res.status(500).json({ message: 'Failed to fetch voucher' });
  }
});

// Admin: Create voucher
router.post('/admin', authenticate, requireAdmin, validateBody(createVoucherSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const voucher = await voucherService.createVoucher(req.body);
    res.status(201).json({ voucher });
  } catch (error: any) {
    console.error('Error creating voucher:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'Voucher code already exists' });
    } else {
      res.status(500).json({ message: 'Failed to create voucher' });
    }
  }
});

// Admin: Update voucher
router.patch('/admin/:id', authenticate, requireAdmin, validateBody(updateVoucherSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const voucher = await voucherService.updateVoucher(id, req.body);
    res.json({ voucher });
  } catch (error: any) {
    console.error('Error updating voucher:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Voucher not found' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ message: 'Voucher code already exists' });
    } else {
      res.status(500).json({ message: 'Failed to update voucher' });
    }
  }
});

// Admin: Delete voucher
router.delete('/admin/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await voucherService.deleteVoucher(id);
    res.json({ message: 'Voucher deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting voucher:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Voucher not found' });
    } else {
      res.status(500).json({ message: 'Failed to delete voucher' });
    }
  }
});

// Admin: Get voucher usage history
router.get('/admin/:id/usage', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usage = await voucherService.getVoucherUsageHistory(id);
    res.json({ usage });
  } catch (error) {
    console.error('Error fetching voucher usage:', error);
    res.status(500).json({ message: 'Failed to fetch usage history' });
  }
});

// Admin: Get voucher statistics
router.get('/admin/:id/stats', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const stats = await voucherService.getVoucherStats(id);

    if (!stats) {
      res.status(404).json({ message: 'Voucher not found' });
      return;
    }

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching voucher stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

export default router;
