import { Request, Response, NextFunction } from 'express';
import * as trackingService from './tracking.service';
import { success, error } from '../../utils/apiResponse';

export async function getTracking(req: Request, res: Response, next: NextFunction) {
  try {
    const history = await trackingService.getTrackingByTrackingId(req.params.trackingId);
    return success(res, history, 'Tracking history retrieved');
  } catch (err: any) {
    if (err.message === 'Order not found') return error(res, err.message, 404);
    next(err);
  }
}