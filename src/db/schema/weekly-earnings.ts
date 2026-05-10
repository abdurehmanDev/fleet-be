import { pgTable, uuid, date, decimal, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { drivers } from './drivers';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const weeklyEarnings = pgTable('weekly_earnings', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  driverId: uuid('driver_id').notNull().references(() => drivers.id, { onDelete: 'cascade' }),
  weekStartDate: date('week_start_date').notNull(),
  weekEndDate: date('week_end_date').notNull(),
  weeklyEarning: decimal('weekly_earning', { precision: 10, scale: 2 }).notNull().default('0'),
  cash: decimal('cash', { precision: 10, scale: 2 }).notNull().default('0'),
  tax: decimal('tax', { precision: 10, scale: 2 }).notNull().default('0'),
  toll: decimal('toll', { precision: 10, scale: 2 }).notNull().default('0'),
  rent: decimal('rent', { precision: 10, scale: 2 }).notNull().default('0'),
  uberSubscription: decimal('uber_subscription', { precision: 10, scale: 2 }).notNull().default('0'),
  adjustment: decimal('adjustment', { precision: 10, scale: 2 }).notNull().default('0'),
  other: decimal('other', { precision: 10, scale: 2 }).notNull().default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  driverWeekIdx: uniqueIndex('idx_weekly_earnings_driver_week').on(table.driverId, table.weekStartDate),
  ownerIdIdx: index('idx_weekly_earnings_owner_id').on(table.ownerId),
  driverIdIdx: index('idx_weekly_earnings_driver_id').on(table.driverId),
  weekStartIdx: index('idx_weekly_earnings_week_start').on(table.weekStartDate),
  totalAmountIdx: index('idx_weekly_earnings_total_amount').on(table.totalAmount),
}));

export const insertWeeklyEarningSchema = createInsertSchema(weeklyEarnings);
export const selectWeeklyEarningSchema = createSelectSchema(weeklyEarnings);

export type WeeklyEarning = typeof weeklyEarnings.$inferSelect;
export type NewWeeklyEarning = typeof weeklyEarnings.$inferInsert;
