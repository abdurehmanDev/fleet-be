import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { roleMiddleware } from '../../../middlewares/role.middleware';
import { validateQuery, validateParams } from '../../../middlewares/validate.middleware';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import { z } from 'zod';
import { uuidSchema, paginationSchema } from '../../../common/validators';
import { ROLES } from '../../../common/enums';
import db from '../../../config/db';
import { auditLogs } from '../../../db/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { parsePagination, createPaginatedResponse } from '../../../common/utils';

const router = Router();
router.use(authMiddleware);

// GET /api/v1/audit-logs
router.get('/', roleMiddleware(ROLES.OWNER, ROLES.SUPER_ADMIN), validateQuery(paginationSchema.extend({
  action: z.string().optional(),
  entity_type: z.string().optional(),
})), asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query as any);
  const { action, entity_type } = req.query as any;

  let whereCondition = sql`1=1`;
  if (action) whereCondition = sql`${auditLogs.action} = ${action}`;
  if (entity_type) whereCondition = sql`${auditLogs.entityType} = ${entity_type}`;

  const [list, countResult] = await Promise.all([
    db.select().from(auditLogs).where(whereCondition).orderBy(desc(auditLogs.created_at)).limit(limit).offset(offset),
    db.select({ count: count() }).from(auditLogs).where(whereCondition),
  ]);

  const total = Number(countResult[0]?.count || 0);
  const result = createPaginatedResponse(list, total, page, limit);
  res.json(ApiResponse.success('Audit logs fetched', result.data, result.meta));
}));

// GET /api/v1/audit-logs/:id
router.get('/:id', roleMiddleware(ROLES.OWNER, ROLES.SUPER_ADMIN), validateParams(z.object({ id: uuidSchema })), asyncHandler(async (req, res) => {
  const [log] = await db.select().from(auditLogs).where(eq(auditLogs.id, req.params.id)).limit(1);
  if (!log) return res.status(404).json(ApiResponse.error('Audit log not found', 'NOT_FOUND'));
  res.json(ApiResponse.success('Audit log fetched', log));
}));

export default router;
