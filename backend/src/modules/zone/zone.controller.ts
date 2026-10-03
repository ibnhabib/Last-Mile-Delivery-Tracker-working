import { Request, Response, NextFunction } from 'express';
import * as zoneService from './zone.service';
import { ApiResponse } from '../../utils/apiResponse';

export async function createZone(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description } = req.body;
    const zone = await zoneService.createZone(name, description);
    return ApiResponse.success(res, zone, 'Zone created', 201);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return ApiResponse.error(res, 'Zone with this name already exists', 409);
    }
    next(err);
  }
}

export async function getAllZones(req: Request, res: Response, next: NextFunction) {
  try {
    const zones = await zoneService.getAllZones();
    return ApiResponse.success(res, zones, 'Zones retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getZoneById(req: Request, res: Response, next: NextFunction) {
  try {
    const zone = await zoneService.getZoneById(req.params.id);
    if (!zone) return ApiResponse.error(res, 'Zone not found', 404);
    return ApiResponse.success(res, zone, 'Zone retrieved');
  } catch (err) {
    next(err);
  }
}

export async function createArea(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, pincode, zoneId } = req.body;
    const area = await zoneService.createArea(name, pincode, zoneId);
    return ApiResponse.success(res, area, 'Area created', 201);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return ApiResponse.error(res, 'Area with this name and pincode already exists', 409);
    }
    if (err.message === 'Zone not found') {
      return ApiResponse.error(res, err.message, 404);
    }
    next(err);
  }
}

export async function getAllAreas(req: Request, res: Response, next: NextFunction) {
  try {
    const { zoneId } = req.query;
    const areas = await zoneService.getAllAreas(zoneId as string);
    return ApiResponse.success(res, areas, 'Areas retrieved');
  } catch (err) {
    next(err);
  }
}

export async function deleteZone(req: Request, res: Response, next: NextFunction) {
  try {
    await zoneService.deleteZone(req.params.id);
    return ApiResponse.success(res, null, 'Zone deleted');
  } catch (err) {
    next(err);
  }
}

export async function deleteArea(req: Request, res: Response, next: NextFunction) {
  try {
    await zoneService.deleteArea(req.params.id);
    return ApiResponse.success(res, null, 'Area deleted');
  } catch (err) {
    next(err);
  }
}