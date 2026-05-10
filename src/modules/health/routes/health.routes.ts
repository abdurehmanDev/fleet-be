import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import db from '../../../config/db';
import { sql } from 'drizzle-orm';

const router = Router();

// GET /api/v1/health
router.get('/', asyncHandler(async (_req, res) => {
  let dbStatus = 'connected';

  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    dbStatus = 'disconnected';
  }

  res.json(ApiResponse.success('Health check', {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
  }));
}));

export default router;
