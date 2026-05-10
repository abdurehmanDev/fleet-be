import { relations } from 'drizzle-orm';
import { users } from './users';
import { profiles } from './profiles';
import { roles } from './roles';
import { permissions } from './permissions';
import { userRoles } from './user-roles';
import { rolePermissions } from './role-permissions';
import { drivers } from './drivers';
import { vehicles } from './vehicles';
import { weeklyEarnings } from './weekly-earnings';
import { companyEarnings } from './company-earnings';
import { notifications } from './notifications';
import { auditLogs } from './audit-logs';
import { activityLogs } from './activity-logs';
import { refreshTokens } from './refresh-tokens';
import { uploadedFiles } from './uploaded-files';

// Users relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.id] }),
  drivers: many(drivers),
  vehicles: many(vehicles),
  weeklyEarnings: many(weeklyEarnings),
  companyEarnings: many(companyEarnings),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
  activityLogs: many(activityLogs),
  refreshTokens: many(refreshTokens),
  uploadedFiles: many(uploadedFiles),
  userRoles: many(userRoles),
}));

// Profiles relations
export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.id], references: [users.id] }),
}));

// Roles relations
export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));

// Permissions relations
export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

// UserRoles relations
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

// RolePermissions relations
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] }),
}));

// Drivers relations
export const driversRelations = relations(drivers, ({ one, many }) => ({
  owner: one(users, { fields: [drivers.ownerId], references: [users.id] }),
  weeklyEarnings: many(weeklyEarnings),
}));

// Vehicles relations
export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  owner: one(users, { fields: [vehicles.ownerId], references: [users.id] }),
}));

// WeeklyEarnings relations
export const weeklyEarningsRelations = relations(weeklyEarnings, ({ one }) => ({
  owner: one(users, { fields: [weeklyEarnings.ownerId], references: [users.id] }),
  driver: one(drivers, { fields: [weeklyEarnings.driverId], references: [drivers.id] }),
}));

// CompanyEarnings relations
export const companyEarningsRelations = relations(companyEarnings, ({ one }) => ({
  owner: one(users, { fields: [companyEarnings.ownerId], references: [users.id] }),
}));

// Notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// AuditLogs relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

// ActivityLogs relations
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));

// RefreshTokens relations
export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}));

// UploadedFiles relations
export const uploadedFilesRelations = relations(uploadedFiles, ({ one }) => ({
  user: one(users, { fields: [uploadedFiles.userId], references: [users.id] }),
}));
