import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { roleMiddleware } from '../../../middlewares/role.middleware';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import { ROLES } from '../../../common/enums';
import db from '../../../config/db';
import { permissions } from '../../../db/schema';
import { isNull } from 'drizzle-orm';

const router = Router();
router.use(authMiddleware);
router.use(roleMiddleware(ROLES.SUPER_ADMIN, ROLES.OWNER));

// GET /api/v1/permissions
router.get('/', asyncHandler(async (_req, res) => {
  const list = await db.select().from(permissions).where(isNull(permissions.deleted_at));
  res.json(ApiResponse.success('Permissions fetched', list));
}));

export default router;
