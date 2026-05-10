import { pgTable, uuid, text, timestamp, index, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  number: text('number').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  ownerNumberIdx: uniqueIndex('idx_vehicle_owner_number').on(table.ownerId, table.number),
  ownerIdIdx: index('idx_vehicles_owner_id').on(table.ownerId),
  numberIdx: index('idx_vehicles_number').on(table.number),
  statusIdx: index('idx_vehicles_status').on(table.status),
}));

export const insertVehicleSchema = createInsertSchema(vehicles);
export const selectVehicleSchema = createSelectSchema(vehicles);

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
