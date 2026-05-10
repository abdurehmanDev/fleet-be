import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../common/exceptions';
import { ROLES } from '../common/enums';

export function roleMiddleware(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const userRoles = req.user.roles;

    if (userRoles.includes(ROLES.SUPER_ADMIN)) {
      return next();
    }

    const hasRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return next(
        new ForbiddenError(
          `Insufficient role. Required: ${allowedRoles.join(' or ')}`
        )
      );
    }

    next();
  };
}
