import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { permissionMiddleware } from '../../../middlewares/permission.middleware';
import { validateBody, validateQuery, validateParams } from '../../../middlewares/validate.middleware';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import { z } from 'zod';
import { uuidSchema, vehicleNumberSchema, vehicleStatusSchema, paginationSchema } from '../../../common/validators';
import { PERMISSIONS, AUDIT_ACTIONS, SOCKET_EVENTS } from '../../../common/enums';
import db from '../../../config/db';
import { vehicles, auditLogs } from '../../../db/schema';
import { eq, and, isNull, ilike, or, count, desc } from 'drizzle-orm';
import { parsePagination, createPaginatedResponse } from '../../../common/utils';
import { emitToOwner } from '../../../config/socket';

const router = Router();
router.use(authMiddleware);

const createVehicleSchema = z.object({
  number: vehicleNumberSchema,
  status: vehicleStatusSchema.default('ACTIVE'),
});

const updateVehicleSchema = z.object({
  number: vehicleNumberSchema.optional(),
  status: vehicleStatusSchema.optional(),
});

// POST /api/v1/vehicles
router.post('/', permissionMiddleware(PERMISSIONS.CREATE_VEHICLE), validateBody(createVehicleSchema), asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const [existing] = await db.select().from(vehicles)
    .where(and(eq(vehicles.ownerId, ownerId), eq(vehicles.number, req.body.number), isNull(vehicles.deleted_at))).limit(1);
  if (existing) return res.status(409).json(ApiResponse.error('Vehicle number already exists', 'DUPLICATE_NUMBER'));

  const [vehicle] = await db.insert(vehicles).values({ ownerId, ...req.body }).returning();

  await db.insert(auditLogs).values({ userId: ownerId, action: AUDIT_ACTIONS.CREATE, entityType: 'vehicle', entityId: vehicle.id, afterData: vehicle, ipAddress: req.ip, userAgent: req.get('user-agent') });
  emitToOwner(ownerId, SOCKET_EVENTS.VEHICLE_CREATED, vehicle);
  res.status(201).json(ApiResponse.success('Vehicle created', vehicle));
}));

// GET /api/v1/vehicles
router.get('/', validateQuery(paginationSchema), asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const { page, limit, offset } = parsePagination(req.query as any);
  const status = (req.query as any).status as string;

  let whereCondition = and(eq(vehicles.ownerId, ownerId), isNull(vehicles.deleted_at));
  if (status) whereCondition = and(eq(vehicles.ownerId, ownerId), eq(vehicles.status, status), isNull(vehicles.deleted_at));

  const [vehicleList, countResult] = await Promise.all([
    db.select().from(vehicles).where(whereCondition).orderBy(desc(vehicles.created_at)).limit(limit).offset(offset),
    db.select({ count: count() }).from(vehicles).where(whereCondition),
  ]);

  const total = Number(countResult[0]?.count || 0);
  const result = createPaginatedResponse(vehicleList, total, page, limit);
  res.json(ApiResponse.success('Vehicles fetched', result.data, result.meta));
}));

// GET /api/v1/vehicles/search
router.get('/search', asyncHandler(async (req, res) => {
  const ownerId = req.user!.userId;
  const q = (req.query as any).q as string;
  if (!q) return res.json(ApiResponse.success('Vehicles fetched', []));

  const results = await db.select().from(vehicles)
    .where(and(eq(vehicles.ownerId, ownerId), isNull(vehicles.deleted_at), ilike(vehicles.number, `%${q}%`))).limit(20);
  res.json(ApiResponse.success('Search results', results));
}));

// GET /api/v1/vehicles/:id
router.get('/:id', validateParams(z.object({ id: uuidSchema })), asyncHandler(async (req, res) => {
  const [vehicle] = await db.select().from(vehicles)
    .where(and(eq(vehicles.id, req.params.id), eq(vehicles.ownerId, req.user!.userId), isNull(vehicles.deleted_at))).limit(1);
  if (!vehicle) return res.status(404).json(ApiResponse.error('Vehicle not found', 'NOT_FOUND'));
  res.json(ApiResponse.success('Vehicle fetched', vehicle));
}));

// PATCH /api/v1/vehicles/:id
router.patch('/:id', permissionMiddleware(PERMISSIONS.UPDATE_VEHICLE), validateParams(z.object({ id: uuidSchema })), validateBody(updateVehicleSchema), asyncHandler(async (req, res) => {
  const [before] = await db.select().from(vehicles)
    .where(and(eq(vehicles.id, req.params.id), eq(vehicles.ownerId, req.user!.userId), isNull(vehicles.deleted_at))).limit(1);
  if (!before) return res.status(404).json(ApiResponse.error('Vehicle not found', 'NOT_FOUND'));

  const [updated] = await db.update(vehicles).set({ ...req.body, updated_at: new Date() }).where(eq(vehicles.id, req.params.id)).returning();
  await db.insert(auditLogs).values({ userId: req.user!.userId, action: AUDIT_ACTIONS.UPDATE, entityType: 'vehicle', entityId: req.params.id, beforeData: before, afterData: updated, ipAddress: req.ip, userAgent: req.get('user-agent') });
  emitToOwner(req.user!.userId, SOCKET_EVENTS.VEHICLE_UPDATED, updated);
  res.json(ApiResponse.success('Vehicle updated', updated));
}));

// PATCH /api/v1/vehicles/:id/status
router.patch('/:id/status', permissionMiddleware(PERMISSIONS.UPDATE_VEHICLE), validateParams(z.object({ id: uuidSchema })), validateBody(z.object({ status: vehicleStatusSchema })), asyncHandler(async (req, res) => {
  const [updated] = await db.update(vehicles).set({ status: req.body.status, updated_at: new Date() })
    .where(and(eq(vehicles.id, req.params.id), eq(vehicles.ownerId, req.user!.userId), isNull(vehicles.deleted_at))).returning();
  if (!updated) return res.status(404).json(ApiResponse.error('Vehicle not found', 'NOT_FOUND'));
  emitToOwner(req.user!.userId, SOCKET_EVENTS.VEHICLE_UPDATED, updated);
  res.json(ApiResponse.success('Vehicle status updated', updated));
}));

// DELETE /api/v1/vehicles/:id
router.delete('/:id', permissionMiddleware(PERMISSIONS.DELETE_VEHICLE), validateParams(z.object({ id: uuidSchema })), asyncHandler(async (req, res) => {
  const [vehicle] = await db.select().from(vehicles)
    .where(and(eq(vehicles.id, req.params.id), eq(vehicles.ownerId, req.user!.userId), isNull(vehicles.deleted_at))).limit(1);
  if (!vehicle) return res.status(404).json(ApiResponse.error('Vehicle not found', 'NOT_FOUND'));

  await db.update(vehicles).set({ deleted_at: new Date() }).where(eq(vehicles.id, req.params.id));
  await db.insert(auditLogs).values({ userId: req.user!.userId, action: AUDIT_ACTIONS.DELETE, entityType: 'vehicle', entityId: req.params.id, beforeData: vehicle, ipAddress: req.ip, userAgent: req.get('user-agent') });
  emitToOwner(req.user!.userId, SOCKET_EVENTS.VEHICLE_DELETED, { id: req.params.id });
  res.json(ApiResponse.success('Vehicle deleted', null));
}));

export default router;
