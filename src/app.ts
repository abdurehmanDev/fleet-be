import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import env from './config/env';
import { globalErrorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { apiRateLimiter } from './middlewares/rateLimit.middleware';
import { notFoundHandler } from './middlewares/error.middleware';

// Route imports
import authRoutes from './modules/auth/routes/auth.routes';
import userRoutes from './modules/users/routes/user.routes';
import profileRoutes from './modules/profiles/routes/profile.routes';
import roleRoutes from './modules/roles/routes/role.routes';
import permissionRoutes from './modules/permissions/routes/permission.routes';
import driverRoutes from './modules/drivers/routes/driver.routes';
import vehicleRoutes from './modules/vehicles/routes/vehicle.routes';
import weeklyEarningRoutes from './modules/weekly-earnings/routes/weekly-earnings.routes';
import companyEarningRoutes from './modules/company-earnings/routes/company-earnings.routes';
import dashboardRoutes from './modules/dashboard/routes/dashboard.routes';
import analyticsRoutes from './modules/analytics/routes/analytics.routes';
import notificationRoutes from './modules/notifications/routes/notification.routes';
import auditLogRoutes from './modules/audit-logs/routes/audit-log.routes';
import uploadRoutes from './modules/uploads/routes/upload.routes';
import healthRoutes from './modules/health/routes/health.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN.split(','),
  credentials: true,
}));
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiRateLimiter);

// Request logging
app.use(requestLogger);

// API routes
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/profiles`, profileRoutes);
app.use(`${API_PREFIX}/roles`, roleRoutes);
app.use(`${API_PREFIX}/permissions`, permissionRoutes);
app.use(`${API_PREFIX}/drivers`, driverRoutes);
app.use(`${API_PREFIX}/vehicles`, vehicleRoutes);
app.use(`${API_PREFIX}/weekly-earnings`, weeklyEarningRoutes);
app.use(`${API_PREFIX}/company-earnings`, companyEarningRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/audit-logs`, auditLogRoutes);
app.use(`${API_PREFIX}/uploads`, uploadRoutes);
app.use(`${API_PREFIX}/health`, healthRoutes);

// Swagger documentation
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { swaggerUiOptions } from './config/swagger';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

export default app;
