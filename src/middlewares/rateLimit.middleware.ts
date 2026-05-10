import rateLimit from 'express-rate-limit';
import env from '../config/env';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many auth attempts, please try again later',
    errorCode: 'AUTH_RATE_LIMIT',
  },
});
