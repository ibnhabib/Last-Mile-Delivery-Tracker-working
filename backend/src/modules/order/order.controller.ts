import { Request, Response, NextFunction } from 'express';
import * as orderService from './order.service';
import { success, error } from '../../utils/apiResponse';

export async function calculateCharge(req: Request, res: Response, next: NextFunction) {
  try {
    const charges = await orderService.calculateOrderCharge(req.body);
    return success(res, charges, 'Charge calculated');
  } catch (err: any) {
    return error(res, err.message, 400);
  }
}

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.createOrder(req.body, req.user!.userId, req.user!.role);
    return success(res, order, 'Order created successfully', 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
}

export async function getOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = {
      status: req.query.status as any,
      orderType: req.query.orderType as any,
      paymentType: req.query.paymentType as any,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      search: req.query.search as string,
    };
    const result = await orderService.getOrders(filters, req.user!.userId, req.user!.role);
    return success(res, result, 'Orders retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user!.userId, req.user!.role);
    return success(res, order, 'Order retrieved');
  } catch (err: any) {
    if (err.message === 'Order not found') return error(res, err.message, 404);
    if (err.message === 'Access denied') return error(res, err.message, 403);
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, notes } = req.body;
    const order = await orderService.updateOrderStatus(
      req.params.id, status, req.user!.userId, req.user!.role, notes
    );
    return success(res, order, 'Status updated');
  } catch (err: any) {
    if (err.message.includes('Invalid status transition')) return error(res, err.message, 400);
    if (err.message.includes('only update orders')) return error(res, err.message, 403);
    if (err.message === 'Order not found') return error(res, err.message, 404);
    next(err);
  }
}

export async function rescheduleOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { scheduledDate } = req.body;
    const order = await orderService.rescheduleOrder(req.params.id, scheduledDate, req.user!.userId);
    return success(res, order, 'Order rescheduled');
  } catch (err: any) {
    if (err.message.includes('Only failed')) return error(res, err.message, 400);
    if (err.message.includes('only reschedule your own')) return error(res, err.message, 403);
    if (err.message === 'Order not found') return error(res, err.message, 404);
    next(err);
  }
}

export async function manualAssign(req: Request, res: Response, next: NextFunction) {
  try {
    const { agentId } = req.body;
    const order = await orderService.manualAssignAgent(req.params.id, agentId);
    return success(res, order, 'Agent assigned');
  } catch (err: any) {
    if (err.message === 'Order not found') return error(res, err.message, 404);
    if (err.message.includes('not found') || err.message.includes('cannot be assigned')) {
      return error(res, err.message, 400);
    }
    next(err);
  }
}

export async function autoAssign(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.autoAssignAgent(req.params.id);
    return success(res, order, 'Agent auto-assigned');
  } catch (err: any) {
    if (err.message === 'Order not found') return error(res, err.message, 404);
    if (err.message.includes('No available')) return error(res, err.message, 400);
    next(err);
  }
}

export async function trackOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const tracking = await orderService.getOrderByTrackingId(req.params.trackingId);
    return success(res, tracking, 'Tracking info retrieved');
  } catch (err: any) {
    if (err.message === 'Order not found') return error(res, err.message, 404);
    next(err);
  }
}