// Shared types for the application

export interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    priceType: 'FIXED' | 'PER_KG';
    weightMin?: number;
    weightMax?: number;
    stockQuantity: number;
    isAvailable: boolean;
    imageUrls: string[];
    allergens?: string[];
    nutritionalInfo?: any;
    storageInstructions?: string;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    parentId?: string;
    sortOrder: number;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'CUSTOMER' | 'BUSINESS' | 'ADMIN';
    isVerified: boolean;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface DeliveryZone {
    id: string;
    name: string;
    postcodePrefixes: string[];
    deliveryFee: number;
    minimumOrder: number;
    isActive: boolean;
}

export interface DeliverySlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    maxOrders: number;
    currentBookings: number;
    isAvailable: boolean;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId?: string;
    guestEmail?: string;
    status: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
    subtotal: number;
    deliveryFee: number;
    total: number;
    deliveryAddress: any;
    deliveryPostcode: string;
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    createdAt: string;
    updatedAt: string;
}
