import { describe, it, expect } from '@jest/globals';
import { hashPassword, comparePassword } from '../../common/utils/hash.utils';

describe('Hash Utils', () => {
  it('should hash a password', async () => {
    const hash = await hashPassword('Test@123456');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('Test@123456');
  });

  it('should verify correct password', async () => {
    const hash = await hashPassword('Test@123456');
    const isValid = await comparePassword('Test@123456', hash);
    expect(isValid).toBe(true);
  });

  it('should reject wrong password', async () => {
    const hash = await hashPassword('Test@123456');
    const isValid = await comparePassword('WrongPassword', hash);
    expect(isValid).toBe(false);
  });
});
