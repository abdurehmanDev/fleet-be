import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import logger from '../config/logger';

export interface ISocketUser {
  userId: string;
  email: string;
  roles: string[];
}

export async function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void): Promise<void> {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as ISocketUser;

    socket.data.user = {
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
    };

    next();
  } catch (err) {
    logger.warn({ err }, 'Socket authentication failed');
    next(new Error('Authentication error: Invalid token'));
  }
}
