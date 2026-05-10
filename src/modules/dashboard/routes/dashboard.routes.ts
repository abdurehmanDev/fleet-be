import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import db from '../../../config/db';
import { drivers, vehicles, weeklyEarnings, companyEarnings } from '../../../db/schema';
import { eq, and, isNull, count, sql, desc } from 'drizzle-orm';
import { getCurrentWeekRange, formatDateISO } from '../../../common/utils';

const router = Router();
router.use(authMiddleware);

// GET /api/v1/dashboard/summary
router.get('/summary', asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const weekRange = getCurrentWeekRange();

  const [driverCount, vehicleCount, earningsCount] = await Promise.all([
    db.select({ count: count() }).from(drivers).where(and(eq(drivers.ownerId, ownerId), isNull(drivers.deleted_at))),
    db.select({ count: count() }).from(vehicles).where(and(eq(vehicles.ownerId, ownerId), isNull(vehicles.deleted_at))),
    db.select({ count: count() }).from(weeklyEarnings).where(and(eq(weeklyEarnings.ownerId, ownerId), eq(weeklyEarnings.weekStartDate, formatDateISO(weekRange.weekStartDate)), isNull(weeklyEarnings.deleted_at))),
  ]);

  res.json(ApiResponse.success('Dashboard summary', {
    total_drivers: Number(driverCount[0]?.count || 0),
    total_vehicles: Number(vehicleCount[0]?.count || 0),
    weekly_earnings_count: Number(earningsCount[0]?.count || 0),
    selected_week: {
      start: formatDateISO(weekRange.weekStartDate),
      end: formatDateISO(weekRange.weekEndDate),
      label: weekRange.label,
    },
  }));
}));

// GET /api/v1/dashboard/weekly-overview
router.get('/weekly-overview', asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const weekRange = getCurrentWeekRange();

  const [companyEarning] = await db.select().from(companyEarnings)
    .where(and(eq(companyEarnings.ownerId, ownerId), eq(companyEarnings.weekStartDate, formatDateISO(weekRange.weekStartDate)), isNull(companyEarnings.deleted_at)))
    .limit(1);

  const driverEarnings = await db.select().from(weeklyEarnings)
    .where(and(eq(weeklyEarnings.ownerId, ownerId), eq(weeklyEarnings.weekStartDate, formatDateISO(weekRange.weekStartDate)), isNull(weeklyEarnings.deleted_at)));

  const totalDriverPayouts = driverEarnings.reduce((sum, e) => sum + Number(e.totalAmount), 0);

  res.json(ApiResponse.success('Weekly overview', {
    week: weekRange.label,
    companyEarning: companyEarning ? Number(companyEarning.totalCompanyEarning) : 0,
    totalDriverPayouts,
    ownerEarning: companyEarning ? Number(companyEarning.ownerEarning) : 0,
    driverEarningsCount: driverEarnings.length,
    activeVehicles: Number((await db.select({ count: count() }).from(vehicles).where(and(eq(vehicles.ownerId, ownerId), eq(vehicles.status, 'ACTIVE'), isNull(vehicles.deleted_at))))[0]?.count || 0),
  }));
}));

// GET /api/v1/dashboard/stats
router.get('/stats', asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;

  const [totalEarnings, avgEarnings, topDriver] = await Promise.all([
    db.select({ total: sql<string>`COALESCE(SUM(CAST(${weeklyEarnings.totalAmount} AS DECIMAL)), 0)` })
      .from(weeklyEarnings).where(and(eq(weeklyEarnings.ownerId, ownerId), isNull(weeklyEarnings.deleted_at))),
    db.select({ avg: sql<string>`COALESCE(AVG(CAST(${weeklyEarnings.totalAmount} AS DECIMAL)), 0)` })
      .from(weeklyEarnings).where(and(eq(weeklyEarnings.ownerId, ownerId), isNull(weeklyEarnings.deleted_at))),
    db.select({ driverId: weeklyEarnings.driverId, total: sql<string>`SUM(CAST(${weeklyEarnings.totalAmount} AS DECIMAL))` })
      .from(weeklyEarnings).where(and(eq(weeklyEarnings.ownerId, ownerId), isNull(weeklyEarnings.deleted_at)))
      .groupBy(weeklyEarnings.driverId).orderBy(desc(sql`SUM(CAST(${weeklyEarnings.totalAmount} AS DECIMAL))`)).limit(1),
  ]);

  let topDriverName = null;
  if (topDriver[0]?.driverId) {
    const [d] = await db.select({ name: drivers.name }).from(drivers).where(eq(drivers.id, topDriver[0].driverId)).limit(1);
    topDriverName = d?.name || null;
  }

  res.json(ApiResponse.success('Dashboard stats', {
    totalEarnings: Number(totalEarnings[0]?.total || 0),
    avgWeeklyEarnings: Math.round(Number(avgEarnings[0]?.avg || 0) * 100) / 100,
    topDriver: topDriverName ? { name: topDriverName, totalEarnings: Number(topDriver[0]?.total || 0) } : null,
  }));
}));

export default router;
