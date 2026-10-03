import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { ApiResponse } from '../../utils/apiResponse';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, phone, role } = req.body;
    const result = await authService.register(name, email, password, phone, role);
    return ApiResponse.success(res, result, 'Registration successful', 201);
  } catch (err: any) {
    if (err.message === 'Email already registered') {
      return ApiResponse.error(res, err.message, 409);
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return ApiResponse.success(res, result, 'Login successful');
  } catch (err: any) {
    if (err.message === 'Invalid email or password') {
      return ApiResponse.error(res, err.message, 401);
    }
    if (err.message === 'VERIFICATION_REQUIRED') {
      return ApiResponse.error(res, 'Please verify your email to log in', 403);
    }
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOtp(email, otp);
    return ApiResponse.success(res, result, 'Account verified successfully', 200);
  } catch (err: any) {
    if (err.message.includes('Invalid') || err.message.includes('expired') || err.message.includes('not found')) {
      return ApiResponse.error(res, err.message, 400);
    }
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile(req.user!.userId);
    return ApiResponse.success(res, user, 'Profile retrieved');
  } catch (err) {
    next(err);
  }
}