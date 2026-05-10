import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { validateBody, validateParams } from '../../../middlewares/validate.middleware';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import { z } from 'zod';
import { uuidSchema } from '../../../common/validators';
import db from '../../../config/db';
import { profiles, users } from '../../../db/schema';
import { eq, isNull, and } from 'drizzle-orm';

const router = Router();
router.use(authMiddleware);

// GET /api/v1/profiles/me
router.get('/me', asyncHandler(async (req, res) => {
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, req.user!.userId)).limit(1);
  if (!profile) return res.status(404).json(ApiResponse.error('Profile not found', 'NOT_FOUND'));
  res.json(ApiResponse.success('Profile fetched', profile));
}));

// PATCH /api/v1/profiles/me
router.patch('/me', validateBody(z.object({
  full_name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
})), asyncHandler(async (req, res) => {
  const [updated] = await db.update(profiles).set({ ...req.body, updated_at: new Date() }).where(eq(profiles.id, req.user!.userId)).returning();
  res.json(ApiResponse.success('Profile updated', updated));
}));

export default router;
