import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id?: string;
  email: string;
  role: string;
  name?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'expo26_super_secret_jwt_key_75k_scale';
}

/**
 * Route-Wise JWT Authentication Middleware
 * Supports Header: 'Authorization: Bearer <token>' OR Query Param: '?token=<token>'
 */
export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized. Authentication token missing or malformed.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Unauthorized. Session expired. Please log in again.' });
      return;
    }
    res.status(403).json({ error: 'Forbidden. Invalid or corrupted authentication token.' });
    return;
  }
}

/**
 * Role-Based Access Control (RBAC) Middleware
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized. User authentication required.' });
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden. Role '${req.user.role}' lacks sufficient privileges. Requires: [${allowedRoles.join(', ')}]`,
      });
      return;
    }

    next();
  };
}
