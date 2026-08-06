import { z } from 'zod';

// Zod Schema for Visitor Pre-Registration Form
export const VisitorRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').max(15),
  company: z.string().optional(),
  designation: z.string().optional(),
  city: z.string().optional(),
  state: z.string().default('Kerala'),
  category: z.enum(['VISITOR', 'DELEGATE', 'VIP', 'EXHIBITOR', 'PRESS', 'SPEAKER']).default('VISITOR'),
  subEvents: z.array(z.string()).optional().default([]),
  honeypot: z.string().optional(), // Anti-spam field (must be empty)
});

// Zod Schema for Exhibitor Booking Form
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

// Zod Schema for Admin Login
export const AdminLoginSchema = z.object({
  email: z.string().email('Valid admin email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Generate collision-proof badge code formatted like EXPO26-89A42
 */
export function generateBadgeCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EXPO26-${random}`;
}
