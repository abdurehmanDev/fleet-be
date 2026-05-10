import { pgTable, uuid, date, decimal, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const companyEarnings = pgTable('company_earnings', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  weekStartDate: date('week_start_date').notNull(),
  weekEndDate: date('week_end_date').notNull(),
  totalCompanyEarning: decimal('total_company_earning', { precision: 10, scale: 2 }).notNull().default('0'),
  totalDriverPayouts: decimal('total_driver_payouts', { precision: 10, scale: 2 }).notNull().default('0'),
  ownerEarning: decimal('owner_earning', { precision: 10, scale: 2 }).notNull().default('0'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  ownerWeekIdx: uniqueIndex('idx_company_earnings_owner_week').on(table.ownerId, table.weekStartDate),
  ownerIdIdx: index('idx_company_earnings_owner_id').on(table.ownerId),
  weekStartIdx: index('idx_company_earnings_week_start').on(table.weekStartDate),
}));

export const insertCompanyEarningSchema = createInsertSchema(companyEarnings);
export const selectCompanyEarningSchema = createSelectSchema(companyEarnings);

export type CompanyEarning = typeof companyEarnings.$inferSelect;
export type NewCompanyEarning = typeof companyEarnings.$inferInsert;
