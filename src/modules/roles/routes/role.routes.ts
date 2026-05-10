import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { roleMiddleware } from '../../../middlewares/role.middleware';
import { validateBody, validateParams } from '../../../middlewares/validate.middleware';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import { z } from 'zod';
import { uuidSchema } from '../../../common/validators';
import { ROLES } from '../../../common/enums';
import db from '../../../config/db';
import { roles, rolePermissions, permissions } from '../../../db/schema';
import { eq, isNull } from 'drizzle-orm';

const router = Router();
router.use(authMiddleware);
router.use(roleMiddleware(ROLES.SUPER_ADMIN, ROLES.OWNER));

// GET /api/v1/roles
router.get('/', asyncHandler(async (_req, res) => {
  const list = await db.select().from(roles).where(isNull(roles.deleted_at));
  res.json(ApiResponse.success('Roles fetched', list));
}));

// POST /api/v1/roles
router.post('/', validateBody(z.object({ name: z.string().min(1), description: z.string().optional() })), asyncHandler(async (req, res) => {
  const [role] = await db.insert(roles).values(req.body).returning();
  res.status(201).json(ApiResponse.success('Role created', role));
}));

// GET /api/v1/roles/:id/permissions
router.get('/:id/permissions', validateParams(z.object({ id: uuidSchema })), asyncHandler(async (req, res) => {
  const perms = await db.select({ id: permissions.id, name: permissions.name, description: permissions.description })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, req.params.id));
  res.json(ApiResponse.success('Role permissions fetched', perms));
}));

export default router;
