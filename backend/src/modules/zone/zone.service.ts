import { Router } from 'express';
import * as zoneController from './zone.controller';
import { authenticate, roleGuard } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { z } from 'zod';

const router = Router();

const createZoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required'),
  description: z.string().optional(),
});

const createAreaSchema = z.object({
  name: z.string().min(1, 'Area name is required'),
  pincode: z.string().min(4, 'Valid pincode is required'),
  zoneId: z.string().uuid('Valid zone ID is required'),
});

// Zone routes
router.post('/zones', authenticate, roleGuard('ADMIN'), validate(createZoneSchema), zoneController.createZone);
router.get('/zones', authenticate, zoneController.getAllZones);
router.get('/zones/:id', authenticate, zoneController.getZoneById);
router.delete('/zones/:id', authenticate, roleGuard('ADMIN'), zoneController.deleteZone);

// Area routes
router.post('/areas', authenticate, roleGuard('ADMIN'), validate(createAreaSchema), zoneController.createArea);
router.get('/areas', authenticate, zoneController.getAllAreas);
router.delete('/areas/:id', authenticate, roleGuard('ADMIN'), zoneController.deleteArea);

export default router;