import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { roleMiddleware } from '../../../middlewares/role.middleware';
import { permissionMiddleware } from '../../../middlewares/permission.middleware';
import { validateBody, validateQuery, validateParams } from '../../../middlewares/validate.middleware';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import { z } from 'zod';
import { uuidSchema, indianMobileSchema, paginationSchema } from '../../../common/validators';
import { ROLES, PERMISSIONS, AUDIT_ACTIONS, SOCKET_EVENTS } from '../../../common/enums';
import db from '../../../config/db';
import { drivers, auditLogs, weeklyEarnings } from '../../../db/schema';
import { eq, and, isNull, ilike, or, sql, count, desc } from 'drizzle-orm';
import { parsePagination, createPaginatedResponse } from '../../../common/utils';
import { emitToOwner } from '../../../config/socket';
import logger from '../../../config/logger';

const router = Router();
router.use(authMiddleware);

// Create driver validation schema
const createDriverSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  mobile: indianMobileSchema,
});

const updateDriverSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  mobile: indianMobileSchema.optional(),
});

/**
 * @swagger
 * tags:
 *   name: Drivers
 *   description: Driver management endpoints
 */

// POST /api/v1/drivers - Create driver
router.post(
  '/',
  permissionMiddleware(PERMISSIONS.CREATE_DRIVER),
  validateBody(createDriverSchema),
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.userId;
    const { name, mobile } = req.body;

    // Check duplicate mobile per owner
    const [existing] = await db.select().from(drivers)
      .where(and(eq(drivers.ownerId, ownerId), eq(drivers.mobile, mobile), isNull(drivers.deleted_at)))
      .limit(1);

    if (existing) {
      return res.status(409).json(ApiResponse.error('Driver with this mobile already exists', 'DUPLICATE_MOBILE'));
    }

    const [driver] = await db.insert(drivers).values({
      ownerId,
      name,
      mobile,
    }).returning();

    // Audit log
    await db.insert(auditLogs).values({
      userId: ownerId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'driver',
      entityId: driver.id,
      afterData: driver,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Realtime event
    emitToOwner(ownerId, SOCKET_EVENTS.DRIVER_CREATED, driver);

    logger.info({ driverId: driver.id, ownerId }, 'Driver created');
    res.status(201).json(ApiResponse.success('Driver created successfully', driver));
  })
);

// GET /api/v1/drivers - List drivers (paginated)
router.get(
  '/',
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.userId;
    const { page, limit, offset } = parsePagination(req.query as any);
    const search = (req.query as any).search as string;

    let whereCondition = and(eq(drivers.ownerId, ownerId), isNull(drivers.deleted_at));

    if (search) {
      whereCondition = and(
        eq(drivers.ownerId, ownerId),
        isNull(drivers.deleted_at),
        or(ilike(drivers.name, `%${search}%`), ilike(drivers.mobile, `%${search}%`))!
      );
    }

    const [driversList, countResult] = await Promise.all([
      db.select().from(drivers).where(whereCondition).orderBy(desc(drivers.created_at)).limit(limit).offset(offset),
      db.select({ count: count() }).from(drivers).where(whereCondition),
    ]);

    const total = Number(countResult[0]?.count || 0);
    const result = createPaginatedResponse(driversList, total, page, limit);

    res.json(ApiResponse.success('Drivers fetched', result.data, result.meta));
  })
);

// GET /api/v1/drivers/search - Search drivers
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.userId;
    const q = (req.query as any).q as string;

    if (!q) return res.json(ApiResponse.success('Drivers fetched', []));

    const results = await db.select().from(drivers)
      .where(and(
        eq(drivers.ownerId, ownerId),
        isNull(drivers.deleted_at),
        or(ilike(drivers.name, `%${q}%`), ilike(drivers.mobile, `%${q}%`))!
      ))
      .limit(20);

    res.json(ApiResponse.success('Search results', results));
  })
);

// GET /api/v1/drivers/:id - Get driver by ID
router.get(
  '/:id',
  validateParams(z.object({ id: uuidSchema })),
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.userId;
    const [driver] = await db.select().from(drivers)
      .where(and(eq(drivers.id, req.params.id), eq(drivers.ownerId, ownerId), isNull(drivers.deleted_at)))
      .limit(1);

    if (!driver) return res.status(404).json(ApiResponse.error('Driver not found', 'NOT_FOUND'));
    res.json(ApiResponse.success('Driver fetched', driver));
  })
);

// PATCH /api/v1/drivers/:id - Update driver
router.patch(
  '/:id',
  permissionMiddleware(PERMISSIONS.UPDATE_DRIVER),
  validateParams(z.object({ id: uuidSchema })),
  validateBody(updateDriverSchema),
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.userId;
    const driverId = req.params.id;

    // Get before data
    const [before] = await db.select().from(drivers)
      .where(and(eq(drivers.id, driverId), eq(drivers.ownerId, ownerId), isNull(drivers.deleted_at)))
      .limit(1);

    if (!before) return res.status(404).json(ApiResponse.error('Driver not found', 'NOT_FOUND'));

    // Check mobile duplicate if changing
    if (req.body.mobile && req.body.mobile !== before.mobile) {
      const [dup] = await db.select().from(drivers)
        .where(and(eq(drivers.ownerId, ownerId), eq(drivers.mobile, req.body.mobile), isNull(drivers.deleted_at)))
        .limit(1);
      if (dup) return res.status(409).json(ApiResponse.error('Mobile already used by another driver', 'DUPLICATE_MOBILE'));
    }

    const [updated] = await db.update(drivers)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(drivers.id, driverId))
      .returning();

    // Audit log
    await db.insert(auditLogs).values({
      userId: ownerId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'driver',
      entityId: driverId,
      beforeData: before,
      afterData: updated,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    emitToOwner(ownerId, SOCKET_EVENTS.DRIVER_UPDATED, updated);

    res.json(ApiResponse.success('Driver updated', updated));
  })
);

// DELETE /api/v1/drivers/:id - Soft delete driver
router.delete(
  '/:id',
  permissionMiddleware(PERMISSIONS.DELETE_DRIVER),
  validateParams(z.object({ id: uuidSchema })),
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.userId;
    const driverId = req.params.id;

    const [driver] = await db.select().from(drivers)
      .where(and(eq(drivers.id, driverId), eq(drivers.ownerId, ownerId), isNull(drivers.deleted_at)))
      .limit(1);

    if (!driver) return res.status(404).json(ApiResponse.error('Driver not found', 'NOT_FOUND'));

    await db.update(drivers).set({ deleted_at: new Date() }).where(eq(drivers.id, driverId));

    // Audit log
    await db.insert(auditLogs).values({
      userId: ownerId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'driver',
      entityId: driverId,
      beforeData: driver,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    emitToOwner(ownerId, SOCKET_EVENTS.DRIVER_DELETED, { id: driverId });

    res.json(ApiResponse.success('Driver deleted', null));
  })
);

// GET /api/v1/drivers/:id/analytics - Driver analytics
router.get(
  '/:id/analytics',
  permissionMiddleware(PERMISSIONS.VIEW_ANALYTICS),
  validateParams(z.object({ id: uuidSchema })),
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.userId;
    const driverId = req.params.id;

    // Verify driver belongs to owner
    const [driver] = await db.select().from(drivers)
      .where(and(eq(drivers.id, driverId), eq(drivers.ownerId, ownerId), isNull(drivers.deleted_at)))
      .limit(1);

    if (!driver) return res.status(404).json(ApiResponse.error('Driver not found', 'NOT_FOUND'));

    // Get earnings stats
    const stats = await db.select({
      totalEarnings: sql<string>`COALESCE(SUM(CAST(${weeklyEarnings.totalAmount} AS DECIMAL)), 0)`,
      avgEarnings: sql<string>`COALESCE(AVG(CAST(${weeklyEarnings.totalAmount} AS DECIMAL)), 0)`,
      weekCount: sql<string>`COUNT(*)`,
      highestWeek: sql<string>`COALESCE(MAX(CAST(${weeklyEarnings.totalAmount} AS DECIMAL)), 0)`,
      lowestWeek: sql<string>`COALESCE(MIN(CAST(${weeklyEarnings.totalAmount} AS DECIMAL)), 0)`,
    }).from(weeklyEarnings)
      .where(and(eq(weeklyEarnings.driverId, driverId), eq(weeklyEarnings.ownerId, ownerId), isNull(weeklyEarnings.deleted_at)));

    // Get recent 8 weeks trend
    const trend = await db.select({
      weekStartDate: weeklyEarnings.weekStartDate,
      totalAmount: weeklyEarnings.totalAmount,
    }).from(weeklyEarnings)
      .where(and(eq(weeklyEarnings.driverId, driverId), eq(weeklyEarnings.ownerId, ownerId), isNull(weeklyEarnings.deleted_at)))
      .orderBy(desc(weeklyEarnings.weekStartDate))
      .limit(8);

    const analytics = {
      driver: { id: driver.id, name: driver.name, mobile: driver.mobile },
      stats: {
        totalEarnings: Number(stats[0]?.totalEarnings || 0),
        avgEarnings: Math.round(Number(stats[0]?.avgEarnings || 0) * 100) / 100,
        weekCount: Number(stats[0]?.weekCount || 0),
        highestWeek: Number(stats[0]?.highestWeek || 0),
        lowestWeek: Number(stats[0]?.lowestWeek || 0),
      },
      trend: trend.map((t) => ({
        week: t.weekStartDate,
        amount: Number(t.totalAmount),
      })),
    };

    res.json(ApiResponse.success('Driver analytics', analytics));
  })
);

export default router;
