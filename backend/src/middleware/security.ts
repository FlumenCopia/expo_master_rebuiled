import { z } from 'zod';

export const VisitorRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().min(7, 'Phone number must be at least 7 digits').max(20),
  company: z.string().optional(),
  designation: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().default('Kerala'),
  pincode: z.string().optional(),
  address: z.string().optional(),
  post: z.string().optional(),
  landmark: z.string().optional(),
  country: z.string().optional().default('India'),
  countryCode: z.string().optional().default('91'),
  category: z.enum(['VISITOR', 'DELEGATE', 'VIP', 'EXHIBITOR', 'PRESS', 'SPEAKER']).default('VISITOR'),
  subEvents: z.array(z.string()).optional().default([]),
  honeypot: z.string().optional(),
});

export const ExhibitorRegistrationSchema = z.object({
  companyName: z.string().min(2, 'Company Name is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(8, 'Valid phone number required'),
  website: z.string().optional(),
  productCategory: z.string().optional(),
  stallSize: z.string().optional(),
  notes: z.string().optional(),
});

export const AdminLoginSchema = z.object({
  email: z.string().email('Valid admin email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const CheckInVerificationSchema = z.object({
  badgeCode: z.string().min(3, 'Badge code is required').max(30),
  gateName: z.string().optional().default('Main Entrance'),
  mode: z.enum(['IN', 'OUT', 'BREAK', 'RE_ENTRY', 'ENTRY', 'EXIT']).optional().default('IN'),
});

export const ExhibitorUpdateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  stallNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export function generateBadgeCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EXPO26-${random}`;
}

/**
 * Sanitizes input string to prevent CSV Formula Injection attacks.
 * Neutralizes leading '=', '+', '-', '@', '\t', '\r' characters.
 */
export function sanitizeCsvCell(value: string | null | undefined): string {
  if (!value) return '""';
  let clean = String(value).replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(clean)) {
    clean = `'` + clean; // Prepend single quote to force text rendering in Excel/Sheets
  }
  return `"${clean}"`;
}

