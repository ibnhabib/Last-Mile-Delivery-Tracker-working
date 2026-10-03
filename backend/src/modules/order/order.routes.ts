import { Router } from 'express';
import * as orderController from './order.controller';
import { authenticate, roleGuard } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { z } from 'zod';

const router = Router();

const calculateChargeSchema = z.object({
  pickupArea: z.string().min(1),
  pickupPincode: z.string().min(4),
  dropArea: z.string().min(1),
  dropPincode: z.string().min(4),
  length: z.number().positive('Length must be positive'),
  breadth: z.number().positive('Breadth must be positive'),
  height: z.number().positive('Height must be positive'),
  actualWeight: z.number().positive('Weight must be positive'),
  orderType: z.enum(['B2B', 'B2C']),
  paymentType: z.enum(['PREPAID', 'COD']),
});

const createOrderSchema = calculateChargeSchema.extend({
  pickupAddress: z.string().min(5, 'Pickup address is required'),
  dropAddress: z.string().min(5, 'Drop address is required'),
  scheduledDate: z.string().optional(),
  customerId: z.string().uuid().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED']),
  notes: z.string().optional(),
});

const rescheduleSchema = z.object({
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
});

const assignSchema = z.object({
  agentId: z.string().uuid('Valid agent ID is required'),
});

// Public tracking
router.get('/track/:trackingId', orderController.trackOrder);

// Charge preview
router.post('/calculate', authenticate, validate(calculateChargeSchema), orderController.calculateCharge);

// Order CRUD
router.post('/', authenticate, roleGuard('CUSTOMER', 'ADMIN'), validate(createOrderSchema), orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrderById);

// Status updates
router.patch('/:id/status', authenticate, roleGuard('AGENT', 'ADMIN'), validate(updateStatusSchema), orderController.updateStatus);

// Reschedule
router.post('/:id/reschedule', authenticate, roleGuard('CUSTOMER'), validate(rescheduleSchema), orderController.rescheduleOrder);

// Assignment
router.post('/:id/assign', authenticate, roleGuard('ADMIN'), validate(assignSchema), orderController.manualAssign);
router.post('/:id/auto-assign', authenticate, roleGuard('ADMIN'), orderController.autoAssign);

export default router;