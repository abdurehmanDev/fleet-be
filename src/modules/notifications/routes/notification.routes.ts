import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { validateQuery, validateParams } from '../../../middlewares/validate.middleware';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import { z } from 'zod';
import { uuidSchema, paginationSchema } from '../../../common/validators';
import db from '../../../config/db';
import { notifications } from '../../../db/schema';
import { eq, and, isNull, desc, count } from 'drizzle-orm';
import { parsePagination, createPaginatedResponse } from '../../../common/utils';
import { emitToOwner } from '../../../config/socket';
import { SOCKET_EVENTS } from '../../../common/enums';

const router = Router();
router.use(authMiddleware);

// GET /api/v1/notifications
router.get('/', validateQuery(paginationSchema), asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const { page, limit, offset } = parsePagination(req.query as any);

  const [list, countResult] = await Promise.all([
    db.select().from(notifications).where(and(eq(notifications.userId, userId), isNull(notifications.deleted_at)))
      .orderBy(desc(notifications.created_at)).limit(limit).offset(offset),
    db.select({ count: count() }).from(notifications).where(and(eq(notifications.userId, userId), isNull(notifications.deleted_at))),
  ]);

  const total = Number(countResult[0]?.count || 0);
  const result = createPaginatedResponse(list, total, page, limit);
  res.json(ApiResponse.success('Notifications fetched', result.data, result.meta));
}));

// GET /api/v1/notifications/unread-count
router.get('/unread-count', asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const [result] = await db.select({ count: count() }).from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.is_read, false), isNull(notifications.deleted_at)));
  res.json(ApiResponse.success('Unread count', { count: Number(result?.count || 0) }));
}));

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', validateParams(z.object({ id: uuidSchema })), asyncHandler(async (req, res) => {
  await db.update(notifications).set({ is_read: true, updated_at: new Date() })
    .where(and(eq(notifications.id, req.params.id), eq(notifications.userId, req.user!.userId)));
  res.json(ApiResponse.success('Notification marked as read', null));
}));

// PATCH /api/v1/notifications/read-all
router.patch('/read-all', asyncHandler(async (req, res) => {
  await db.update(notifications).set({ is_read: true, updated_at: new Date() })
    .where(and(eq(notifications.userId, req.user!.userId), eq(notifications.is_read, false)));
  res.json(ApiResponse.success('All notifications marked as read', null));
}));

// DELETE /api/v1/notifications/:id
router.delete('/:id', validateParams(z.object({ id: uuidSchema })), asyncHandler(async (req, res) => {
  await db.update(notifications).set({ deleted_at: new Date() })
    .where(and(eq(notifications.id, req.params.id), eq(notifications.userId, req.user!.userId)));
  res.json(ApiResponse.success('Notification deleted', null));
}));

export default router;
