import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  description: text('description'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_activity_logs_user_id').on(table.userId),
  actionIdx: index('idx_activity_logs_action').on(table.action),
  createdAtIdx: index('idx_activity_logs_created_at').on(table.created_at),
}));

export const insertActivityLogSchema = createInsertSchema(activityLogs);
export const selectActivityLogSchema = createSelectSchema(activityLogs);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
