import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  nameIdx: index('idx_permissions_name').on(table.name),
}));

export const insertPermissionSchema = createInsertSchema(permissions);
export const selectPermissionSchema = createSelectSchema(permissions);

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
