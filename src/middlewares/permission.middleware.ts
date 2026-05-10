import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../common/exceptions';
import { ROLES, PERMISSIONS } from '../common/enums';
import db from '../config/db';
import { userRoles, rolePermissions, roles, permissions } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';

export function permissionMiddleware(...requiredPermissions: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new ForbiddenError('Authentication required'));
      }

      // Super admin bypasses permission checks
      if (req.user.roles.includes(ROLES.SUPER_ADMIN)) {
        return next();
      }

      // Fetch user's permissions from DB
      const userRolesRows = await db
        .select({ roleId: userRoles.roleId })
        .from(userRoles)
        .where(eq(userRoles.userId, req.user.userId));

      if (userRolesRows.length === 0) {
        return next(new ForbiddenError('No roles assigned'));
      }

      const roleIds = userRolesRows.map((r) => r.roleId);

      const permissionRows = await db
        .select({ name: permissions.name })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(inArray(rolePermissions.roleId, roleIds));

      const userPermissions = permissionRows.map((p) => p.name);

      // Attach permissions to request
      req.user.permissions = userPermissions;

      const hasPermission = requiredPermissions.some((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        return next(
          new ForbiddenError(
            `Insufficient permissions. Required: ${requiredPermissions.join(' or ')}`
          )
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
