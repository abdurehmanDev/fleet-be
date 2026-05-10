import { pgTable, uuid, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { roles } from './roles';
import { permissions } from './permissions';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const rolePermissions = pgTable('role_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueIdx: uniqueIndex('idx_role_permissions_unique').on(table.roleId, table.permissionId),
  roleIdIdx: index('idx_role_permissions_role_id').on(table.roleId),
  permIdIdx: index('idx_role_permissions_permission_id').on(table.permissionId),
}));

export const insertRolePermissionSchema = createInsertSchema(rolePermissions);
export const selectRolePermissionSchema = createSelectSchema(rolePermissions);

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
