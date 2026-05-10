import { z } from 'zod';
import { emailSchema, passwordSchema } from '../../../common/validators';

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().min(2, { message: 'Full name must be at least 2 characters' }).max(100),
  role: z.enum(['OWNER', 'MANAGER']).default('OWNER'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required' }),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: passwordSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: 'Refresh token is required' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
