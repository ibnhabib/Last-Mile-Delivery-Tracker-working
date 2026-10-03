import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../utils/apiResponse';

/**
 * Request-body validation middleware factory.
 *
 * Accepts a Zod schema and returns Express middleware that validates
 * `req.body` against it. On success the parsed (and potentially
 * transformed) body replaces `req.body`. On failure a 400 response
 * with field-level errors is returned.
 *
 * @example
 * router.post('/orders', validate(createOrderSchema), orderController.create);
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};

        for (const issue of error.issues) {
          const path = issue.path.join('.') || '_root';
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(issue.message);
        }

        ApiResponse.error(res, 'Validation failed.', 400, fieldErrors);
        return;
      }

      // Re-throw non-Zod errors so the global handler can catch them
      next(error);
    }
  };
}