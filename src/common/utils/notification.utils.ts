import db from '../../config/db';
import { notifications } from '../../db/schema';
import { emitToOwner } from '../../config/socket';
import { SOCKET_EVENTS } from '../../common/enums';
import logger from '../../config/logger';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
}

export async function createNotification(params: CreateNotificationParams) {
  const [notification] = await db.insert(notifications).values({
    userId: params.userId,
    title: params.title,
    message: params.message,
    type: params.type || 'INFO',
  }).returning();

  // Push via Socket.IO
  emitToOwner(params.userId, SOCKET_EVENTS.NOTIFICATION_NEW, notification);

  logger.info({ notificationId: notification.id, userId: params.userId }, 'Notification created');
  return notification;
}

export async function createBulkNotifications(userIds: string[], params: Omit<CreateNotificationParams, 'userId'>) {
  const values = userIds.map((userId) => ({
    userId,
    title: params.title,
    message: params.message,
    type: params.type || 'INFO',
  }));

  const result = await db.insert(notifications).values(values).returning();

  for (const userId of userIds) {
    emitToOwner(userId, SOCKET_EVENTS.NOTIFICATION_NEW, { title: params.title, message: params.message });
  }

  logger.info({ count: result.length }, 'Bulk notifications created');
  return result;
}
