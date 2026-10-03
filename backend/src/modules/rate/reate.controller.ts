import { Request, Response, NextFunction } from 'express';
import * as rateService from './rate.service';
import { ApiResponse } from '../../utils/apiResponse';

export async function createRateCard(req: Request, res: Response, next: NextFunction) {
  try {
    const rateCard = await rateService.createRateCard(req.body);
    return ApiResponse.success(res, rateCard, 'Rate card created', 201);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return ApiResponse.error(res, 'Rate card for this order type and zone type already exists', 409);
    }
    next(err);
  }
}

export async function getAllRateCards(req: Request, res: Response, next: NextFunction) {
  try {
    const rateCards = await rateService.getAllRateCards();
    return ApiResponse.success(res, rateCards, 'Rate cards retrieved');
  } catch (err) {
    next(err);
  }
}

export async function updateRateCard(req: Request, res: Response, next: NextFunction) {
  try {
    const rateCard = await rateService.updateRateCard(req.params.id, req.body);
    return ApiResponse.success(res, rateCard, 'Rate card updated');
  } catch (err: any) {
    if (err.code === 'P2025') {
      return ApiResponse.error(res, 'Rate card not found', 404);
    }
    next(err);
  }
}

export async function deleteRateCard(req: Request, res: Response, next: NextFunction) {
  try {
    await rateService.deleteRateCard(req.params.id);
    return ApiResponse.success(res, null, 'Rate card deleted');
  } catch (err) {
    next(err);
  }
}