import http from 'http';
import app from './app';
import env from './config/env';
import logger from './config/logger';
import { initSocketIO } from './config/socket';
import { pool } from './config/db';

const PORT = env.PORT;

const server = http.createServer(app);

// Initialize Socket.IO
initSocketIO(server);

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await pool.end();
      logger.info('Database pool closed');
    } catch (err) {
      logger.error({ err }, 'Error closing database pool');
    }

    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception');
  process.exit(1);
});

server.listen(PORT, () => {
  const baseUrl = env.NODE_ENV === 'production' 
    ? 'https://fleet-be-zidi.onrender.com' 
    : `http://localhost:${PORT}`;
  
  logger.info(`🚀 Rangrej Fleet Backend running on port ${PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`📚 API Docs: ${baseUrl}/api-docs`);
  logger.info(`🔌 Socket.IO enabled`);
});

export default server;
