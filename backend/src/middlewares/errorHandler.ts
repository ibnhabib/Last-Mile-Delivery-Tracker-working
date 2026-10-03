import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ApiResponse } from '../utils/apiResponse';

/**
 * Global error-handling middleware.
 * Must be registered AFTER all routes in Express.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ── Prisma: Unique constraint violation ────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      const fields = target.join(', ');
      ApiResponse.error(
        res,
        `A record with this ${fields || 'value'} already exists.`,
        409,
      );
      return;
    }

    // ── Prisma: Record not found ───────────────────────────────────────
    if (err.code === 'P2025') {
      ApiResponse.error(
        res,
        (err.meta?.cause as string) || 'The requested record was not found.',
        404,
      );
      return;
    }

    // Generic Prisma known error
    ApiResponse.error(res, err.message, 400);
    return;
  }

  // ── Prisma: Validation error (bad data types, etc.) ────────────────────
  if (err instanceof Prisma.PrismaClientValidationError) {
    ApiResponse.error(res, 'Invalid data provided.', 400);
    return;
  }

  // ── Zod validation errors ──────────────────────────────────────────────
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.') || '_root';
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }
    ApiResponse.error(res, 'Validation failed.', 400, fieldErrors);
    return;
  }

  // ── JWT: Token expired ─────────────────────────────────────────────────
  if (err instanceof TokenExpiredError) {
    ApiResponse.error(res, 'Token has expired. Please login again.', 401);
    return;
  }

  // ── JWT: Invalid / malformed token ─────────────────────────────────────
  if (err instanceof JsonWebTokenError) {
    ApiResponse.error(res, 'Invalid or malformed token.', 401);
    return;
  }

  // ── Generic / Unknown errors ───────────────────────────────────────────
  console.error('[ErrorHandler] Unhandled error:', err);

  const statusCode = (err as any).statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message || 'Internal server error.';

  ApiResponse.error(res, message, statusCode);
}