import jwt from 'jsonwebtoken';
import env from '../../config/env';
import { IJwtPayload, IAuthTokens } from '../interfaces';

export function generateAccessToken(payload: IJwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
  });
}

export function generateRefreshToken(payload: IJwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as any,
  });
}

export function generateTokenPair(payload: IJwtPayload): IAuthTokens {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export function verifyAccessToken(token: string): IJwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as IJwtPayload;
}

export function verifyRefreshToken(token: string): IJwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as IJwtPayload;
}
