import { pgTable, uuid, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const drivers = pgTable('drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  mobile: text('mobile').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  ownerMobileIdx: uniqueIndex('idx_driver_owner_mobile').on(table.ownerId, table.mobile),
  ownerIdIdx: index('idx_drivers_owner_id').on(table.ownerId),
  mobileIdx: index('idx_drivers_mobile').on(table.mobile),
  createdAtIdx: index('idx_drivers_created_at').on(table.created_at),
}));

export const insertDriverSchema = createInsertSchema(drivers);
export const selectDriverSchema = createSelectSchema(drivers);

export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;
