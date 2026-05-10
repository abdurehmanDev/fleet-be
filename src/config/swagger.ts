import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerUiOptions } from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rangrej Fleet Management System API',
      version: '1.0.0',
      description:
        'Enterprise-grade Fleet & Wealth Management Platform API for taxi fleet owners. Manages drivers, vehicles, weekly earnings, company earnings, analytics, and realtime updates.',
      contact: {
        name: 'Rangrej Fleet Support',
        email: 'support@rangrejfleet.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT access token',
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refresh_token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errorCode: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
            meta: { type: 'object' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 10 },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/*/docs/*.ts', './src/modules/*/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerUiOptions: SwaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
};

export default swaggerSpec;
