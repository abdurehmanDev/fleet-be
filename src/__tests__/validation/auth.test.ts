import { describe, it, expect } from '@jest/globals';
import { registerSchema, loginSchema, changePasswordSchema } from '../../modules/auth/validation/auth.validation';

describe('Auth Validation', () => {
  it('registerSchema - should validate correct input', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Test@123456',
      full_name: 'Test User',
      role: 'OWNER',
    });
    expect(result.success).toBe(true);
  });

  it('registerSchema - should reject invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'invalid-email',
      password: 'Test@123456',
      full_name: 'Test User',
    });
    expect(result.success).toBe(false);
  });

  it('registerSchema - should reject weak password', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: '123456',
      full_name: 'Test User',
    });
    expect(result.success).toBe(false);
  });

  it('loginSchema - should validate correct input', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'somepassword',
    });
    expect(result.success).toBe(true);
  });

  it('loginSchema - should reject empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('changePasswordSchema - should validate correct input', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'Old@123456',
      newPassword: 'New@123456',
    });
    expect(result.success).toBe(true);
  });
});
