import { Router } from 'express';
import * as agentController from './agentcontroller';
import { authenticate, roleGuard } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { z } from 'zod';

const router = Router();

const updateStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE']),
});

const updateLocationSchema = z.object({
  zoneId: z.string().uuid('Valid zone ID is required'),
  currentArea: z.string().optional(),
});

router.get('/', authenticate, roleGuard('ADMIN'), agentController.getAllAgents);
router.get('/me', authenticate, roleGuard('AGENT'), agentController.getMyProfile);
router.patch('/:id/status', authenticate, roleGuard('AGENT', 'ADMIN'), validate(updateStatusSchema), agentController.updateStatus);
router.patch('/:id/location', authenticate, roleGuard('AGENT', 'ADMIN'), validate(updateLocationSchema), agentController.updateLocation);

export default router;