import { Response } from 'express';

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: Record<string, string[]> | null;
}

// Named exports for convenience
export const success = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
) => res.status(statusCode).json({ success: true, message, data });

export const error = (
  res: Response,
  message: string = 'Something went wrong',
  statusCode: number = 400,
  errors: Record<string, string[]> | null = null,
) => res.status(statusCode).json({ success: false, message, errors });

export const ApiResponse = {
  /**
   * Send a successful JSON response.
   */
  success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
  ): Response<ApiSuccessResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  /**
   * Send an error JSON response.
   */
  error(
    res: Response,
    message: string = 'Something went wrong',
    statusCode: number = 400,
    errors: Record<string, string[]> | null = null,
  ): Response<ApiErrorResponse> {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  },
};