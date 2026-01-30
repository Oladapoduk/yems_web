import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Voucher {
  id: string;
  code: string;
  type: 'FIXED' | 'PERCENTAGE';
  value: number;
  description: string | null;
  minimumOrder: number;
  maxUses: number | null;
  currentUses: number;
  oneTimePerUser: boolean;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherValidationResult {
  valid: boolean;
  discountAmount?: number;
  message?: string;
  voucher?: {
    code: string;
    type: 'FIXED' | 'PERCENTAGE';
    value: number;
    description: string | null;
  };
}

export interface CreateVoucherInput {
  code: string;
  type: 'FIXED' | 'PERCENTAGE';
  value: number;
  description?: string;
  minimumOrder?: number;
  maxUses?: number | null;
  oneTimePerUser?: boolean;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
}

export interface UpdateVoucherInput {
  code?: string;
  type?: 'FIXED' | 'PERCENTAGE';
  value?: number;
  description?: string;
  minimumOrder?: number;
  maxUses?: number | null;
  oneTimePerUser?: boolean;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
}

export interface VoucherUsage {
  id: string;
  voucherId: string;
  userId: string | null;
  guestEmail: string | null;
  orderId: string | null;
  usedAt: string;
}

export interface VoucherStats {
  totalUses: number;
  uniqueUsers: number;
  totalDiscountGiven: number;
  averageDiscountPerUse: number;
}

// Public endpoint - validate voucher
export async function validateVoucher(
  code: string,
  subtotal: number,
  userId?: string | null,
  guestEmail?: string | null
): Promise<VoucherValidationResult> {
  const response = await axios.post(`${API_URL}/vouchers/validate`, {
    code: code.trim().toUpperCase(),
    subtotal,
    userId,
    guestEmail
  });
  return response.data;
}

// Admin endpoints
export async function getAllVouchers(token: string): Promise<Voucher[]> {
  const response = await axios.get(`${API_URL}/vouchers/admin/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.vouchers;
}

export async function getVoucher(id: string, token: string): Promise<Voucher> {
  const response = await axios.get(`${API_URL}/vouchers/admin/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.voucher;
}

export async function createVoucher(data: CreateVoucherInput, token: string): Promise<Voucher> {
  const response = await axios.post(`${API_URL}/vouchers/admin`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.voucher;
}

export async function updateVoucher(
  id: string,
  data: UpdateVoucherInput,
  token: string
): Promise<Voucher> {
  const response = await axios.patch(`${API_URL}/vouchers/admin/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.voucher;
}

export async function deleteVoucher(id: string, token: string): Promise<void> {
  await axios.delete(`${API_URL}/vouchers/admin/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getVoucherUsage(id: string, token: string): Promise<VoucherUsage[]> {
  const response = await axios.get(`${API_URL}/vouchers/admin/${id}/usage`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.usages;
}

export async function getVoucherStats(id: string, token: string): Promise<VoucherStats> {
  const response = await axios.get(`${API_URL}/vouchers/admin/${id}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.stats;
}
