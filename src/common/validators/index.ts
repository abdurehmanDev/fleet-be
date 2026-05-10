import { z } from 'zod';

export const uuidSchema = z.string().uuid({ message: 'Invalid UUID format' });

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export const indianMobileSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, { message: 'Invalid Indian mobile number' });

export const dateSchema = z.string().date();

export const vehicleNumberSchema = z
  .string()
  .min(1, { message: 'Vehicle number is required' })
  .max(20, { message: 'Vehicle number too long' });

export const emailSchema = z
  .string()
  .email({ message: 'Invalid email format' })
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' });

export const decimalSchema = z
  .number()
  .min(0, { message: 'Amount cannot be negative' })
  .max(99999999.99, { message: 'Amount exceeds maximum value' })
  .default(0);

export const vehicleStatusSchema = z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']);
