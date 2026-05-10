import { describe, it, expect, beforeAll } from '@jest/globals';
import { generateAccessToken, generateRefreshToken, generateTokenPair, verifyAccessToken, verifyRefreshToken } from '../../common/utils/jwt.utils';
import { IJwtPayload } from '../../common/interfaces';

describe('JWT Utils', () => {
  const testPayload: IJwtPayload = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    roles: ['OWNER'],
  };

  it('generateAccessToken - should return a valid JWT string', () => {
    const token = generateAccessToken(testPayload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('generateRefreshToken - should return a valid JWT string', () => {
    const token = generateRefreshToken(testPayload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('generateTokenPair - should return both access and refresh tokens', () => {
    const tokens = generateTokenPair(testPayload);
    expect(tokens).toHaveProperty('accessToken');
    expect(tokens).toHaveProperty('refreshToken');
    expect(tokens.accessToken.split('.').length).toBe(3);
    expect(tokens.refreshToken.split('.').length).toBe(3);
  });

  it('verifyAccessToken - should decode a valid access token', () => {
    const token = generateAccessToken(testPayload);
    const decoded = verifyAccessToken(token) as IJwtPayload;
    expect(decoded.userId).toBe(testPayload.userId);
    expect(decoded.email).toBe(testPayload.email);
    expect(decoded.roles).toEqual(testPayload.roles);
  });

  it('verifyRefreshToken - should decode a valid refresh token', () => {
    const token = generateRefreshToken(testPayload);
    const decoded = verifyRefreshToken(token) as IJwtPayload;
    expect(decoded.userId).toBe(testPayload.userId);
    expect(decoded.email).toBe(testPayload.email);
  });

  it('verifyAccessToken - should throw on invalid token', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });

  it('verifyRefreshToken - should throw on invalid token', () => {
    expect(() => verifyRefreshToken('invalid.token.here')).toThrow();
  });
});
