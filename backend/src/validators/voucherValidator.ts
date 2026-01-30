import { z } from 'zod';

export const voucherCodeSchema = z.object({
  code: z.string()
    .min(3, 'Voucher code must be at least 3 characters')
    .max(50, 'Voucher code must be less than 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Voucher code can only contain uppercase letters, numbers, hyphens, and underscores')
    .transform(val => val.toUpperCase())
});

export const createVoucherSchema = z.object({
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(50, 'Code must be less than 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Code can only contain uppercase letters, numbers, hyphens, and underscores'),

  type: z.enum(['FIXED', 'PERCENTAGE']),

  value: z.number()
    .positive('Value must be positive'),

  description: z.string().max(500, 'Description must be less than 500 characters').optional(),

  minimumOrder: z.number().min(0, 'Minimum order must be non-negative').default(0),

  maxUses: z.number().int('Max uses must be an integer').positive('Max uses must be positive').optional().nullable(),

  oneTimePerUser: z.boolean().default(true),

  validFrom: z.string().datetime('Invalid date format for validFrom'),

  validUntil: z.string().datetime('Invalid date format for validUntil'),

  isActive: z.boolean().default(true)
}).refine(
  data => new Date(data.validFrom) < new Date(data.validUntil),
  { message: 'validFrom must be before validUntil', path: ['validFrom'] }
).refine(
  data => !(data.type === 'PERCENTAGE' && data.value > 100),
  { message: 'Percentage cannot exceed 100', path: ['value'] }
);

export const updateVoucherSchema = z.object({
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(50, 'Code must be less than 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Code can only contain uppercase letters, numbers, hyphens, and underscores')
    .optional(),

  type: z.enum(['FIXED', 'PERCENTAGE']).optional(),

  value: z.number()
    .positive('Value must be positive')
    .optional(),

  description: z.string().max(500, 'Description must be less than 500 characters').optional(),

  minimumOrder: z.number().min(0, 'Minimum order must be non-negative').optional(),

  maxUses: z.number().int('Max uses must be an integer').positive('Max uses must be positive').optional().nullable(),

  oneTimePerUser: z.boolean().optional(),

  validFrom: z.string().datetime('Invalid date format for validFrom').optional(),

  validUntil: z.string().datetime('Invalid date format for validUntil').optional(),

  isActive: z.boolean().optional()
});

export const validateVoucherSchema = z.object({
  code: z.string().min(1, 'Voucher code is required'),
  userId: z.string().uuid('Invalid user ID format').optional().nullable(),
  guestEmail: z.string().email('Invalid email format').optional().nullable(),
  subtotal: z.number().positive('Subtotal must be positive')
});

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;
export type ValidateVoucherInput = z.infer<typeof validateVoucherSchema>;
