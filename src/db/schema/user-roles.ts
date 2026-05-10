import { pgTable, uuid, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { roles } from './roles';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueIdx: uniqueIndex('idx_user_roles_unique').on(table.userId, table.roleId),
  userIdIdx: index('idx_user_roles_user_id').on(table.userId),
  roleIdIdx: index('idx_user_roles_role_id').on(table.roleId),
}));

export const insertUserRoleSchema = createInsertSchema(userRoles);
export const selectUserRoleSchema = createSelectSchema(userRoles);

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
