import { Router } from 'express';
import * as trackingController from './tracking.controller';

const router = Router();

// Public tracking endpoint — no auth required
router.get('/:trackingId', trackingController.getTracking);

export default router;