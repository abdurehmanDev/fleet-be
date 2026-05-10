import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { UnauthorizedError } from '../common/exceptions';
import logger from '../config/logger';

export interface IAuthPayload {
  userId: string;
  email: string;
  roles: string[];
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided. Access denied.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Invalid token format.');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as IAuthPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
      permissions: [],
    };

    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      next(err);
    } else if (err instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid or expired token'));
    } else {
      next(err);
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET) as IAuthPayload;
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        roles: decoded.roles,
        permissions: [],
      };
    }
  } catch {
    // Ignore - optional auth
  }
  next();
}
