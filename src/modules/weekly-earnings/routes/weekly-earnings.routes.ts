import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { permissionMiddleware } from '../../../middlewares/permission.middleware';
import { validateBody, validateQuery, validateParams } from '../../../middlewares/validate.middleware';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import { z } from 'zod';
import { uuidSchema, decimalSchema, paginationSchema } from '../../../common/validators';
import { PERMISSIONS, AUDIT_ACTIONS, SOCKET_EVENTS } from '../../../common/enums';
import db from '../../../config/db';
import { weeklyEarnings, drivers, auditLogs } from '../../../db/schema';
import { eq, and, isNull, desc, count, sql } from 'drizzle-orm';
import { parsePagination, createPaginatedResponse, calculateDriverTotalAmount, getCurrentWeekRange, getWeekRangeForDate, formatDateISO } from '../../../common/utils';
import { emitToOwner } from '../../../config/socket';
import { ConflictError, NotFoundError, BadRequestError } from '../../../common/exceptions';

const router = Router();
router.use(authMiddleware);

const saveWeeklyEarningSchema = z.object({
  driver_id: uuidSchema,
  week_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  week_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  weekly_earning: decimalSchema,
  cash: decimalSchema,
  tax: decimalSchema,
  toll: decimalSchema,
  rent: decimalSchema,
  uber_subscription: decimalSchema,
  adjustment: decimalSchema,
  other: decimalSchema,
});

const updateWeeklyEarningSchema = saveWeeklyEarningSchema.partial().omit({ driver_id: true });

// POST /api/v1/weekly-earnings - Save weekly earnings
router.post(
  '/',
  permissionMiddleware(PERMISSIONS.MANAGE_EARNINGS),
  validateBody(saveWeeklyEarningSchema),
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.userId;
    const data = req.body;

    // Verify driver belongs to owner
    const [driver] = await db.select().from(drivers)
      .where(and(eq(drivers.id, data.driver_id), eq(drivers.ownerId, ownerId), isNull(drivers.deleted_at))).limit(1);
    if (!driver) throw new NotFoundError('Driver');

    // Check duplicate (driver_id + week_start_date)
    const [existing] = await db.select().from(weeklyEarnings)
      .where(and(eq(weeklyEarnings.driverId, data.driver_id), eq(weeklyEarnings.weekStartDate, data.week_start_date), isNull(weeklyEarnings.deleted_at)))
      .limit(1);
    if (existing) throw new ConflictError('Weekly earnings already exist for this driver and week. Use PATCH to update.');

    // Calculate total_amount using formula
    const totalAmount = calculateDriverTotalAmount({
      weekly_earning: data.weekly_earning,
      cash: data.cash,
      tax: data.tax,
      toll: data.toll,
      rent: data.rent,
      uber_subscription: data.uber_subscription,
      adjustment: data.adjustment,
      other: data.other,
    });

    const [earning] = await db.insert(weeklyEarnings).values({
      ownerId,
      driverId: data.driver_id,
      weekStartDate: data.week_start_date,
      weekEndDate: data.week_end_date,
      weeklyEarning: String(data.weekly_earning),
      cash: String(data.cash),
      tax: String(data.tax),
      toll: String(data.toll),
      rent: String(data.rent),
      uberSubscription: String(data.uber_subscription),
      adjustment: String(data.adjustment),
      other: String(data.other),
      totalAmount: String(totalAmount),
    }).returning();

    // Audit log
    await db.insert(auditLogs).values({
      userId: ownerId,
      action: AUDIT_ACTIONS.EARNINGS_UPDATE,
      entityType: 'weekly_earning',
      entityId: earning.id,
      afterData: earning,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    emitToOwner(ownerId, SOCKET_EVENTS.EARNINGS_SAVED, earning);

    res.status(201).json(ApiResponse.success('Weekly earnings saved successfully', {
      id: earning.id,
      total_amount: totalAmount,
    }));
  })
);

// PATCH /api/v1/weekly-earnings/:id - Update weekly earnings
router.patch(
  '/:id',
  permissionMiddleware(PERMISSIONS.MANAGE_EARNINGS),
  validateParams(z.object({ id: uuidSchema })),
  validateBody(updateWeeklyEarningSchema),
  asyncHandler(async (req, res) => {
    const ownerId = req.user!.userId;
    const earningId = req.params.id;

    const [before] = await db.select().from(weeklyEarnings)
      .where(and(eq(weeklyEarnings.id, earningId), eq(weeklyEarnings.ownerId, ownerId), isNull(weeklyEarnings.deleted_at))).limit(1);
    if (!before) throw new NotFoundError('Weekly earning');

    // Recalculate total_amount
    const updatedData = { ...req.body };
    const breakdown = {
      weekly_earning: Number(updatedData.weekly_earning ?? before.weeklyEarning),
      cash: Number(updatedData.cash ?? before.cash),
      tax: Number(updatedData.tax ?? before.tax),
      toll: Number(updatedData.toll ?? before.toll),
      rent: Number(updatedData.rent ?? before.rent),
      uber_subscription: Number(updatedData.uber_subscription ?? before.uberSubscription),
      adjustment: Number(updatedData.adjustment ?? before.adjustment),
      other: Number(updatedData.other ?? before.other),
    };
    const totalAmount = calculateDriverTotalAmount(breakdown);

    const dbUpdate: any = { updated_at: new Date() };
    if (updatedData.weekly_earning !== undefined) dbUpdate.weeklyEarning = String(updatedData.weekly_earning);
    if (updatedData.cash !== undefined) dbUpdate.cash = String(updatedData.cash);
    if (updatedData.tax !== undefined) dbUpdate.tax = String(updatedData.tax);
    if (updatedData.toll !== undefined) dbUpdate.toll = String(updatedData.toll);
    if (updatedData.rent !== undefined) dbUpdate.rent = String(updatedData.rent);
    if (updatedData.uber_subscription !== undefined) dbUpdate.uberSubscription = String(updatedData.uber_subscription);
    if (updatedData.adjustment !== undefined) dbUpdate.adjustment = String(updatedData.adjustment);
    if (updatedData.other !== undefined) dbUpdate.other = String(updatedData.other);
    dbUpdate.totalAmount = String(totalAmount);

    const [updated] = await db.update(weeklyEarnings).set(dbUpdate).where(eq(weeklyEarnings.id, earningId)).returning();

    await db.insert(auditLogs).values({
      userId: ownerId, action: AUDIT_ACTIONS.EARNINGS_UPDATE, entityType: 'weekly_earning', entityId: earningId,
      beforeData: before, afterData: updated, ipAddress: req.ip, userAgent: req.get('user-agent'),
    });

    emitToOwner(ownerId, SOCKET_EVENTS.EARNINGS_SAVED, updated);
    res.json(ApiResponse.success('Weekly earnings updated', { id: earningId, total_amount: totalAmount }));
  })
);

// GET /api/v1/weekly-earnings - List weekly earnings
router.get('/', validateQuery(paginationSchema), asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const { page, limit, offset } = parsePagination(req.query as any);
  const weekStartDate = (req.query as any).week_start_date as string;

  let whereCondition = and(eq(weeklyEarnings.ownerId, ownerId), isNull(weeklyEarnings.deleted_at));
  if (weekStartDate) whereCondition = and(eq(weeklyEarnings.ownerId, ownerId), eq(weeklyEarnings.weekStartDate, weekStartDate), isNull(weeklyEarnings.deleted_at));

  const [earningsList, countResult] = await Promise.all([
    db.select().from(weeklyEarnings).where(whereCondition).orderBy(desc(weeklyEarnings.created_at)).limit(limit).offset(offset),
    db.select({ count: count() }).from(weeklyEarnings).where(whereCondition),
  ]);

  const total = Number(countResult[0]?.count || 0);
  const result = createPaginatedResponse(earningsList, total, page, limit);
  res.json(ApiResponse.success('Weekly earnings fetched', result.data, result.meta));
}));

// GET /api/v1/weekly-earnings/driver/:driverId - Get earnings by driver
router.get('/driver/:driverId', validateParams(z.object({ driverId: uuidSchema })), asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const earnings = await db.select().from(weeklyEarnings)
    .where(and(eq(weeklyEarnings.driverId, req.params.driverId), eq(weeklyEarnings.ownerId, ownerId), isNull(weeklyEarnings.deleted_at)))
    .orderBy(desc(weeklyEarnings.weekStartDate));
  res.json(ApiResponse.success('Driver earnings fetched', earnings));
}));

// GET /api/v1/weekly-earnings/week - Get current week earnings
router.get('/week', asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const weekDate = (req.query as any).date as string;
  const weekRange = weekDate ? getWeekRangeForDate(new Date(weekDate)) : getCurrentWeekRange();

  const earnings = await db.select().from(weeklyEarnings)
    .where(and(eq(weeklyEarnings.ownerId, ownerId), eq(weeklyEarnings.weekStartDate, formatDateISO(weekRange.weekStartDate)), isNull(weeklyEarnings.deleted_at)));

  res.json(ApiResponse.success('Week earnings fetched', {
    week: weekRange.label,
    weekStartDate: formatDateISO(weekRange.weekStartDate),
    weekEndDate: formatDateISO(weekRange.weekEndDate),
    earnings,
  }));
}));

// GET /api/v1/weekly-earnings/analytics - Earnings analytics
router.get('/analytics', permissionMiddleware(PERMISSIONS.VIEW_ANALYTICS), asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const weeks = Number((req.query as any).weeks || 8);

  const trend = await db.select({
    weekStartDate: weeklyEarnings.weekStartDate,
    totalAmount: weeklyEarnings.totalAmount,
    driverId: weeklyEarnings.driverId,
  }).from(weeklyEarnings)
    .where(and(eq(weeklyEarnings.ownerId, ownerId), isNull(weeklyEarnings.deleted_at)))
    .orderBy(desc(weeklyEarnings.weekStartDate))
    .limit(weeks * 50);

  // Group by week for chart data
  const weekMap = new Map<string, { week: string; amount: number; count: number }>();
  for (const t of trend) {
    const key = t.weekStartDate;
    const existing = weekMap.get(key) || { week: key, amount: 0, count: 0 };
    existing.amount += Number(t.totalAmount);
    existing.count += 1;
    weekMap.set(key, existing);
  }

  const chartData = Array.from(weekMap.values()).slice(0, weeks).map((w) => ({
    week: w.week,
    amount: Math.round(w.amount * 100) / 100,
  }));

  res.json(ApiResponse.success('Earnings analytics', chartData));
}));

export default router;
