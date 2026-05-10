import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { permissionMiddleware } from '../../../middlewares/permission.middleware';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import { PERMISSIONS } from '../../../common/enums';
import db from '../../../config/db';
import { weeklyEarnings, companyEarnings, drivers, vehicles } from '../../../db/schema';
import { eq, and, isNull, sql, count, desc } from 'drizzle-orm';
import { getCurrentWeekRange, getPreviousWeek, formatDateISO } from '../../../common/utils';

const router = Router();
router.use(authMiddleware);

// GET /api/v1/analytics/overview
router.get('/overview', permissionMiddleware(PERMISSIONS.VIEW_ANALYTICS), asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const currentWeek = getCurrentWeekRange();
  const prevWeek = getPreviousWeek();

  const [currentCompanyEarning, prevCompanyEarning] = await Promise.all([
    db.select().from(companyEarnings)
      .where(and(eq(companyEarnings.ownerId, ownerId), eq(companyEarnings.weekStartDate, formatDateISO(currentWeek.weekStartDate)), isNull(companyEarnings.deleted_at))).limit(1),
    db.select().from(companyEarnings)
      .where(and(eq(companyEarnings.ownerId, ownerId), eq(companyEarnings.weekStartDate, formatDateISO(prevWeek.weekStartDate)), isNull(companyEarnings.deleted_at))).limit(1),
  ]);

  const currentRevenue = Number(currentCompanyEarning[0]?.totalCompanyEarning || 0);
  const prevRevenue = Number(prevCompanyEarning[0]?.totalCompanyEarning || 0);
  const revenueChange = prevRevenue > 0 ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 10000) / 100 : 0;

  res.json(ApiResponse.success('Analytics overview', {
    currentWeek: { label: currentWeek.label, revenue: currentRevenue },
    previousWeek: { label: prevWeek.label, revenue: prevRevenue },
    revenueChangePercent: revenueChange,
  }));
}));

// GET /api/v1/analytics/trend
router.get('/trend', permissionMiddleware(PERMISSIONS.VIEW_ANALYTICS), asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const weeks = Number((req.query as any).weeks || 12);

  const data = await db.select({
    weekStartDate: companyEarnings.weekStartDate,
    companyEarning: companyEarnings.totalCompanyEarning,
    driverPayouts: companyEarnings.totalDriverPayouts,
    ownerEarning: companyEarnings.ownerEarning,
  }).from(companyEarnings)
    .where(and(eq(companyEarnings.ownerId, ownerId), isNull(companyEarnings.deleted_at)))
    .orderBy(desc(companyEarnings.weekStartDate)).limit(weeks);

  const trend = data.map((d) => ({
    week: d.weekStartDate,
    companyEarning: Number(d.companyEarning),
    driverPayouts: Number(d.driverPayouts),
    ownerEarning: Number(d.ownerEarning),
  })).reverse();

  res.json(ApiResponse.success('Earnings trend', trend));
}));

// GET /api/v1/analytics/driver-rankings
router.get('/driver-rankings', permissionMiddleware(PERMISSIONS.VIEW_ANALYTICS), asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const limit = Number((req.query as any).limit || 10);

  const rankings = await db.select({
    driverId: weeklyEarnings.driverId,
    totalEarnings: sql<string>`SUM(CAST(${weeklyEarnings.totalAmount} AS DECIMAL))`,
  }).from(weeklyEarnings)
    .where(and(eq(weeklyEarnings.ownerId, ownerId), isNull(weeklyEarnings.deleted_at)))
    .groupBy(weeklyEarnings.driverId)
    .orderBy(desc(sql`SUM(CAST(${weeklyEarnings.totalAmount} AS DECIMAL))`))
    .limit(limit);

  // Enrich with driver names
  const enriched = await Promise.all(rankings.map(async (r) => {
    const [driver] = await db.select({ name: drivers.name, mobile: drivers.mobile }).from(drivers).where(eq(drivers.id, r.driverId)).limit(1);
    return {
      driverId: r.driverId,
      name: driver?.name || 'Unknown',
      mobile: driver?.mobile || '',
      totalEarnings: Number(r.totalEarnings),
    };
  }));

  res.json(ApiResponse.success('Driver rankings', enriched));
}));

// GET /api/v1/analytics/vehicle-stats
router.get('/vehicle-stats', permissionMiddleware(PERMISSIONS.VIEW_ANALYTICS), asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;

  const [active, inactive, maintenance] = await Promise.all([
    db.select({ count: count() }).from(vehicles).where(and(eq(vehicles.ownerId, ownerId), eq(vehicles.status, 'ACTIVE'), isNull(vehicles.deleted_at))),
    db.select({ count: count() }).from(vehicles).where(and(eq(vehicles.ownerId, ownerId), eq(vehicles.status, 'INACTIVE'), isNull(vehicles.deleted_at))),
    db.select({ count: count() }).from(vehicles).where(and(eq(vehicles.ownerId, ownerId), eq(vehicles.status, 'MAINTENANCE'), isNull(vehicles.deleted_at))),
  ]);

  res.json(ApiResponse.success('Vehicle stats', {
    active: Number(active[0]?.count || 0),
    inactive: Number(inactive[0]?.count || 0),
    maintenance: Number(maintenance[0]?.count || 0),
  }));
}));

export default router;
