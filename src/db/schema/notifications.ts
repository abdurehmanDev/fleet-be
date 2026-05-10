import { pgTable, uuid, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('info'),
  is_read: boolean('is_read').default(false).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  userIdIdx: index('idx_notifications_user_id').on(table.userId),
  isReadIdx: index('idx_notifications_is_read').on(table.is_read),
  createdAtIdx: index('idx_notifications_created_at').on(table.created_at),
}));

export const insertNotificationSchema = createInsertSchema(notifications);
export const selectNotificationSchema = createSelectSchema(notifications);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
