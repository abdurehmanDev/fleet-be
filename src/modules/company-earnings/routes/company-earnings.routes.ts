import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { permissionMiddleware } from '../../../middlewares/permission.middleware';
import { validateBody, validateQuery } from '../../../middlewares/validate.middleware';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import { z } from 'zod';
import { decimalSchema } from '../../../common/validators';
import { PERMISSIONS, AUDIT_ACTIONS, SOCKET_EVENTS } from '../../../common/enums';
import db from '../../../config/db';
import { companyEarnings, weeklyEarnings, auditLogs } from '../../../db/schema';
import { eq, and, isNull, desc, count, sql } from 'drizzle-orm';
import { calculateCompanyEarnings, getCurrentWeekRange, getWeekRangeForDate, formatDateISO } from '../../../common/utils';
import { emitToOwner } from '../../../config/socket';
import { ConflictError, BadRequestError } from '../../../common/exceptions';

const router = Router();
router.use(authMiddleware);

const saveCompanyEarningSchema = z.object({
  week_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  week_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  total_company_earning: decimalSchema,
});

// POST /api/v1/company-earnings
router.post('/', permissionMiddleware(PERMISSIONS.MANAGE_EARNINGS), validateBody(saveCompanyEarningSchema), asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const { week_start_date, week_end_date, total_company_earning } = req.body;

  // Check duplicate
  const [existing] = await db.select().from(companyEarnings)
    .where(and(eq(companyEarnings.ownerId, ownerId), eq(companyEarnings.weekStartDate, week_start_date), isNull(companyEarnings.deleted_at))).limit(1);
  if (existing) throw new ConflictError('Company earnings already exist for this week. Use PATCH to update.');

  // Calculate total_driver_payouts from weekly earnings
  const driverPayouts = await db.select({
    total: sql<string>`COALESCE(SUM(CAST(${weeklyEarnings.totalAmount} AS DECIMAL)), 0)`,
  }).from(weeklyEarnings)
    .where(and(eq(weeklyEarnings.ownerId, ownerId), eq(weeklyEarnings.weekStartDate, week_start_date), isNull(weeklyEarnings.deleted_at)));

  const totalDriverPayouts = Number(driverPayouts[0]?.total || 0);

  // Validate
  if (total_company_earning < totalDriverPayouts) {
    throw new BadRequestError('Total company earning must be >= total driver payouts');
  }

  const result = calculateCompanyEarnings(total_company_earning, totalDriverPayouts);

  const [earning] = await db.insert(companyEarnings).values({
    ownerId,
    weekStartDate: week_start_date,
    weekEndDate: week_end_date,
    totalCompanyEarning: String(result.total_company_earning),
    totalDriverPayouts: String(result.total_driver_payouts),
    ownerEarning: String(result.owner_earning),
  }).returning();

  await db.insert(auditLogs).values({
    userId: ownerId, action: AUDIT_ACTIONS.EARNINGS_UPDATE, entityType: 'company_earning', entityId: earning.id,
    afterData: earning, ipAddress: req.ip, userAgent: req.get('user-agent'),
  });

  emitToOwner(ownerId, SOCKET_EVENTS.ANALYTICS_UPDATED, earning);

  res.status(201).json(ApiResponse.success('Company earnings saved', {
    total_company_earning: result.total_company_earning,
    total_driver_payouts: result.total_driver_payouts,
    owner_earning: result.owner_earning,
  }));
}));

// GET /api/v1/company-earnings
router.get('/', validateQuery(z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().positive().max(100).default(10) })), asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const { page, limit } = req.query as any;
  const offset = (page - 1) * limit;

  const [list, countResult] = await Promise.all([
    db.select().from(companyEarnings).where(and(eq(companyEarnings.ownerId, ownerId), isNull(companyEarnings.deleted_at))).orderBy(desc(companyEarnings.weekStartDate)).limit(limit).offset(offset),
    db.select({ count: count() }).from(companyEarnings).where(and(eq(companyEarnings.ownerId, ownerId), isNull(companyEarnings.deleted_at))),
  ]);

  const total = Number(countResult[0]?.count || 0);
  res.json(ApiResponse.success('Company earnings fetched', list, { page, limit, total, totalPages: Math.ceil(total / limit) }));
}));

// GET /api/v1/company-earnings/week
router.get('/week', asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const weekDate = (req.query as any).date as string;
  const weekRange = weekDate ? getWeekRangeForDate(new Date(weekDate)) : getCurrentWeekRange();

  const [earning] = await db.select().from(companyEarnings)
    .where(and(eq(companyEarnings.ownerId, ownerId), eq(companyEarnings.weekStartDate, formatDateISO(weekRange.weekStartDate)), isNull(companyEarnings.deleted_at))).limit(1);

  res.json(ApiResponse.success('Week company earnings', {
    week: weekRange.label,
    weekStartDate: formatDateISO(weekRange.weekStartDate),
    weekEndDate: formatDateISO(weekRange.weekEndDate),
    earning: earning || null,
  }));
}));

// GET /api/v1/company-earnings/analytics
router.get('/analytics', permissionMiddleware(PERMISSIONS.VIEW_ANALYTICS), asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const weeks = Number((req.query as any).weeks || 8);

  const data = await db.select().from(companyEarnings)
    .where(and(eq(companyEarnings.ownerId, ownerId), isNull(companyEarnings.deleted_at)))
    .orderBy(desc(companyEarnings.weekStartDate)).limit(weeks);

  // Bar chart data
  const barChart = data.map((d) => ({
    week: d.weekStartDate,
    companyRevenue: Number(d.totalCompanyEarning),
    driverPayouts: Number(d.totalDriverPayouts),
    ownerEarnings: Number(d.ownerEarning),
  }));

  // Pie chart data (latest week)
  const latest = data[0];
  const pieChart = latest ? [
    { label: 'Owner Earnings', value: Number(latest.ownerEarning) },
    { label: 'Driver Payouts', value: Number(latest.totalDriverPayouts) },
  ] : [];

  res.json(ApiResponse.success('Company analytics', { barChart, pieChart }));
}));

export default router;
