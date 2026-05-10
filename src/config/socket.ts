import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import logger from './logger';
import { SOCKET_EVENTS } from './constants';

let io: SocketIOServer;

export function initSocketIO(httpServer: Server): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const jwt = require('jsonwebtoken');
      const env = require('./env').default;
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info({ userId: user?.userId }, 'Socket connected');

    // Join owner-specific room for data isolation
    if (user?.userId) {
      socket.join(`owner:${user.userId}`);
    }

    socket.on('disconnect', () => {
      logger.info({ userId: user?.userId }, 'Socket disconnected');
    });

    socket.on('error', (err) => {
      logger.error({ err, userId: user?.userId }, 'Socket error');
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function emitToOwner(ownerId: string, event: string, data: any): void {
  try {
    const socketIO = getIO();
    socketIO.to(`owner:${ownerId}`).emit(event, data);
    logger.debug({ ownerId, event }, 'Socket event emitted');
  } catch (err) {
    logger.error({ err, ownerId, event }, 'Failed to emit socket event');
  }
}

export { SOCKET_EVENTS };
