import { Router } from 'express';
import * as rateController from './reate.controller';
import { authenticate, roleGuard } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { z } from 'zod';

const router = Router();

const createRateCardSchema = z.object({
  orderType: z.enum(['B2B', 'B2C']),
  zoneType: z.enum(['INTRA_ZONE', 'INTER_ZONE']),
  baseRate: z.number().positive('Base rate must be positive'),
  perKgRate: z.number().positive('Per kg rate must be positive'),
  codSurcharge: z.number().min(0).optional(),
});

const updateRateCardSchema = z.object({
  baseRate: z.number().positive().optional(),
  perKgRate: z.number().positive().optional(),
  codSurcharge: z.number().min(0).optional(),
});

router.post('/', authenticate, roleGuard('ADMIN'), validate(createRateCardSchema), rateController.createRateCard);
router.get('/', authenticate, rateController.getAllRateCards);
router.put('/:id', authenticate, roleGuard('ADMIN'), validate(updateRateCardSchema), rateController.updateRateCard);
router.delete('/:id', authenticate, roleGuard('ADMIN'), rateController.deleteRateCard);

export default router;