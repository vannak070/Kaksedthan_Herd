import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    role: string;
    userLevel?: string;
    permissions?: string[];
  };
}

/**
 * Express Middleware: Require specific permission
 * Returns 403 Forbidden if user lacks required permission
 */
export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    // Super Admin & Admin bypass check
    if (user?.role === 'Super Admin' || user?.role === 'Admin') {
      return next();
    }

    const userPermissions = user?.permissions || [];
    if (!userPermissions.includes(permission) && !userPermissions.includes('*')) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: `403 Forbidden: You do not have permission (${permission}) to perform this action.`
      });
    }

    next();
  };
}

/**
 * Express Middleware: Require specific operational role
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || (!allowedRoles.includes(userRole) && userRole !== 'Super Admin')) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: `403 Forbidden: Access denied for role '${userRole || 'Guest'}'. Required: ${allowedRoles.join(', ')}.`
      });
    }
    next();
  };
}
