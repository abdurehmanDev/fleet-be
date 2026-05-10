import { pgTable, uuid, text, timestamp, varchar, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }),
  full_name: text('full_name'),
  role: text('role').default('owner'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  emailIdx: index('idx_profiles_email').on(table.email),
}));

export const insertProfileSchema = createInsertSchema(profiles);
export const selectProfileSchema = createSelectSchema(profiles);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
