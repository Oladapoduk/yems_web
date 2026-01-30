import prisma from '../prisma';
import { VoucherType } from '@prisma/client';

interface ValidateVoucherParams {
  code: string;
  userId?: string;
  guestEmail?: string;
  subtotal: number;
}

interface VoucherValidationResult {
  isValid: boolean;
  voucher?: any;
  discountAmount?: number;
  message?: string;
}

export class VoucherService {
  /**
   * Validate voucher and calculate discount
   */
  async validateVoucher(params: ValidateVoucherParams): Promise<VoucherValidationResult> {
    const { code, userId, guestEmail, subtotal } = params;

    // Find voucher by code (case-insensitive)
    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
      include: { voucherUsages: true }
    });

    if (!voucher) {
      return { isValid: false, message: 'Invalid voucher code' };
    }

    // Check if active
    if (!voucher.isActive) {
      return { isValid: false, message: 'This voucher is no longer active' };
    }

    // Check date validity
    const now = new Date();
    if (now < voucher.validFrom) {
      return { isValid: false, message: 'This voucher is not yet valid' };
    }
    if (now > voucher.validUntil) {
      return { isValid: false, message: 'This voucher has expired' };
    }

    // Check maximum uses
    if (voucher.maxUses !== null && voucher.currentUses >= voucher.maxUses) {
      return { isValid: false, message: 'This voucher has reached its usage limit' };
    }

    // Check minimum order
    if (subtotal < Number(voucher.minimumOrder)) {
      return {
        isValid: false,
        message: `Minimum order of £${Number(voucher.minimumOrder).toFixed(2)} required for this voucher`
      };
    }

    // Check one-time per user
    if (voucher.oneTimePerUser) {
      const existingUsage = voucher.voucherUsages.find(usage =>
        (userId && usage.userId === userId) ||
        (guestEmail && usage.guestEmail === guestEmail)
      );

      if (existingUsage) {
        return { isValid: false, message: 'You have already used this voucher' };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.type === VoucherType.FIXED) {
      discountAmount = Number(voucher.value);
      // Don't let discount exceed subtotal
      discountAmount = Math.min(discountAmount, subtotal);
    } else if (voucher.type === VoucherType.PERCENTAGE) {
      discountAmount = (subtotal * Number(voucher.value)) / 100;
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      isValid: true,
      voucher,
      discountAmount
    };
  }

  /**
   * Record voucher usage
   */
  async recordUsage(voucherId: string, userId?: string, guestEmail?: string, orderId?: string) {
    await prisma.$transaction([
      // Create usage record
      prisma.voucherUsage.create({
        data: {
          voucherId,
          userId,
          guestEmail,
          orderId
        }
      }),
      // Increment usage count
      prisma.voucher.update({
        where: { id: voucherId },
        data: { currentUses: { increment: 1 } }
      })
    ]);
  }

  /**
   * Get all vouchers (admin)
   */
  async getAllVouchers() {
    return prisma.voucher.findMany({
      include: {
        _count: {
          select: { voucherUsages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get single voucher by ID (admin)
   */
  async getVoucherById(id: string) {
    return prisma.voucher.findUnique({
      where: { id },
      include: {
        _count: {
          select: { voucherUsages: true }
        }
      }
    });
  }

  /**
   * Create voucher (admin)
   */
  async createVoucher(data: any) {
    return prisma.voucher.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil)
      }
    });
  }

  /**
   * Update voucher (admin)
   */
  async updateVoucher(id: string, data: any) {
    const updateData: any = { ...data };

    // Convert dates if provided
    if (data.validFrom) {
      updateData.validFrom = new Date(data.validFrom);
    }
    if (data.validUntil) {
      updateData.validUntil = new Date(data.validUntil);
    }

    // Uppercase code if provided
    if (data.code) {
      updateData.code = data.code.toUpperCase();
    }

    return prisma.voucher.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Delete voucher (admin)
   */
  async deleteVoucher(id: string) {
    return prisma.voucher.delete({
      where: { id }
    });
  }

  /**
   * Get voucher usage history (admin)
   */
  async getVoucherUsageHistory(voucherId: string) {
    return prisma.voucherUsage.findMany({
      where: { voucherId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { usedAt: 'desc' }
    });
  }

  /**
   * Get voucher statistics (admin)
   */
  async getVoucherStats(voucherId: string) {
    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId },
      include: {
        voucherUsages: true,
        orders: {
          select: {
            discountAmount: true
          }
        }
      }
    });

    if (!voucher) {
      return null;
    }

    const totalDiscountGiven = voucher.orders.reduce(
      (sum, order) => sum + Number(order.discountAmount),
      0
    );

    return {
      totalUses: voucher.currentUses,
      maxUses: voucher.maxUses,
      remainingUses: voucher.maxUses ? voucher.maxUses - voucher.currentUses : null,
      totalDiscountGiven,
      isActive: voucher.isActive,
      isExpired: new Date() > voucher.validUntil
    };
  }
}

export const voucherService = new VoucherService();
