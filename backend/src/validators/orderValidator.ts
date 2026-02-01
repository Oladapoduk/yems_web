import { z } from 'zod';

// UK phone number regex (supports +44, 07, etc.)
const ukPhoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;

// UK postcode regex
const ukPostcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;

export const deliveryAddressSchema = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name must be less than 50 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),

    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be less than 50 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),

    phone: z.string()
        .regex(ukPhoneRegex, 'Please enter a valid UK phone number'),

    addressLine1: z.string()
        .min(5, 'Address line 1 must be at least 5 characters')
        .max(100, 'Address line 1 must be less than 100 characters'),

    addressLine2: z.string()
        .max(100, 'Address line 2 must be less than 100 characters')
        .optional(),

    city: z.string()
        .min(2, 'City is required')
        .max(50, 'City must be less than 50 characters'),

    postcode: z.string()
        .regex(ukPostcodeRegex, 'Please enter a valid UK postcode')
        .transform(val => val.replace(/\s/g, '').toUpperCase())
});

export const orderItemSchema = z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number()
        .int('Quantity must be a whole number')
        .positive('Quantity must be positive')
        .max(100, 'Maximum quantity per item is 100')
});

export const createOrderSchema = z.object({
    userId: z.string().uuid().optional().nullable(),

    guestEmail: z.string()
        .email('Please enter a valid email address')
        .optional()
        .nullable(),

    deliveryAddress: deliveryAddressSchema,

    deliveryPostcode: z.string()
        .regex(ukPostcodeRegex, 'Please enter a valid UK postcode')
        .transform(val => val.replace(/\s/g, '').toUpperCase()),

    deliveryZoneId: z.string().uuid('Invalid delivery zone'),

    deliverySlotId: z.string().uuid('Invalid delivery slot'),

    orderItems: z.array(orderItemSchema)
        .min(1, 'Order must contain at least one item')
        .max(50, 'Maximum 50 items per order'),

    isBusinessOrder: z.boolean().default(false),

    vatNumber: z.string()
        .regex(/^GB\d{9}$/, 'VAT number must be in format GB123456789')
        .optional()
        .nullable(),

    purchaseOrderNumber: z.string()
        .max(50, 'Purchase order number must be less than 50 characters')
        .optional()
        .nullable(),

    notes: z.string()
        .max(500, 'Notes must be less than 500 characters')
        .optional()
        .nullable(),

    voucherCode: z.string()
        .min(3)
        .max(50)
        .regex(/^[A-Z0-9-_]+/)
        .transform(val => val.toUpperCase())
        .optional()
        .nullable()
}).refine(
    data => data.userId || data.guestEmail,
    { message: 'Either userId or guestEmail must be provided' }
);

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        'PENDING',
        'CONFIRMED',
        'PACKED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED'
    ])
});

export const substitutionResponseSchema = z.object({
    status: z.enum(['ACCEPTED', 'REFUNDED'])
});

export const createSubstitutionSchema = z.object({
    substitutionProductId: z.string().uuid('Invalid substitution product ID')
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type SubstitutionResponseInput = z.infer<typeof substitutionResponseSchema>;
export type CreateSubstitutionInput = z.infer<typeof createSubstitutionSchema>;
