import { Router } from 'express';
import authController from '../controller/auth.controller';
import { validateBody } from '../../../middlewares/validate.middleware';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, refreshTokenSchema } from '../validation/auth.validation';
import { authRateLimiter } from '../../../middlewares/rateLimit.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

// Public routes
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh-token', validateBody(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', authRateLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.patch('/change-password', authMiddleware, validateBody(changePasswordSchema), authController.changePassword);
router.get('/me', authMiddleware, authController.me);

export default router;
