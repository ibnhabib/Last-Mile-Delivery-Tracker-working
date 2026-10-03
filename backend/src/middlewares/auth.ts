import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { JwtPayload } from '../types';
import { ApiResponse } from '../utils/apiResponse';

/**
 * Authentication middleware.
 * Extracts the JWT from the `Authorization: Bearer <token>` header,
 * verifies it, and attaches the decoded payload to `req.user`.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ApiResponse.error(res, 'Authentication required. Please provide a valid token.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    ApiResponse.error(res, 'Authentication required. Token is missing.', 401);
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    // Let the global error handler deal with JWT-specific errors
    next(error);
  }
}

/**
 * Role-based authorisation guard.
 * Must be used AFTER `authenticate` so that `req.user` is populated.
 *
 * @example
 * router.get('/admin', authenticate, roleGuard('ADMIN'), handler);
 * router.get('/staff', authenticate, roleGuard('ADMIN', 'AGENT'), handler);
 */
export function roleGuard(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required.', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      ApiResponse.error(
        res,
        `Access denied. Required role(s): ${roles.join(', ')}`,
        403,
      );
      return;
    }

    next();
  };
}