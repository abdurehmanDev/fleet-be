import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { validateBody, validateQuery, validateParams } from '../../../middlewares/validate.middleware';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import { z } from 'zod';
import { paginationSchema, uuidSchema } from '../../../common/validators';
import db from '../../../config/db';
import { users, profiles, userRoles, roles } from '../../../db/schema';
import { eq, isNull, and, ilike, or } from 'drizzle-orm';
import { parsePagination, createPaginatedResponse } from '../../../common/utils';

const router = Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/v1/users - List users
router.get(
  '/',
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = parsePagination(req.query as any);
    const search = (req.query as any).search as string | undefined;

    let query = db.select().from(users).where(isNull(users.deleted_at));
    let countQuery = db.select().from(users).where(isNull(users.deleted_at));

    const [usersList, countResult] = await Promise.all([
      db.select({
        id: users.id,
        email: users.email,
        is_active: users.is_active,
        created_at: users.created_at,
      }).from(users).where(isNull(users.deleted_at)).limit(limit).offset(offset),
      db.select({ id: users.id }).from(users).where(isNull(users.deleted_at)),
    ]);

    const result = createPaginatedResponse(usersList, countResult.length, page, limit);
    res.json(ApiResponse.success('Users fetched', result.data, result.meta));
  })
);

// GET /api/v1/users/:id
router.get(
  '/:id',
  validateParams(z.object({ id: uuidSchema })),
  asyncHandler(async (req, res) => {
    const [user] = await db.select().from(users).where(and(eq(users.id, req.params.id), isNull(users.deleted_at))).limit(1);
    if (!user) return res.status(404).json(ApiResponse.error('User not found', 'NOT_FOUND'));
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
    res.json(ApiResponse.success('User fetched', { ...user, profile }));
  })
);

export default router;
