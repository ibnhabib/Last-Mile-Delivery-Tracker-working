import prisma from '../../config/database';
import { OrderStatus, OrderType, PaymentType, Role } from '@prisma/client';
import { calculateCharge } from '../../engine/rateEngine';
import { findNearestAvailableAgent, assignAgentToOrder, releaseAgent } from '../../engine/assignmentsengine';
import { VALID_STATUS_TRANSITIONS, generateTrackingId } from '../../utils/constants';
import { sendOrderNotification } from '../notification/notification.service';
import { ChargeBreakdown } from '../../types';

/**
 * Calculate order charge (preview only, no order created).
 * Called before order confirmation to show the customer the cost.
 */
export async function calculateOrderCharge(input: {
  pickupArea: string;
  pickupPincode: string;
  dropArea: string;
  dropPincode: string;
  length: number;
  breadth: number;
  height: number;
  actualWeight: number;
  orderType: OrderType;
  paymentType: PaymentType;
}): Promise<ChargeBreakdown> {
  return calculateCharge(input);
}

/**
 * Create a confirmed order with auto-calculated charges.
 * Creates order + initial tracking history entry atomically.
 */
export async function createOrder(
  input: {
    pickupAddress: string;
    pickupArea: string;
    pickupPincode: string;
    dropAddress: string;
    dropArea: string;
    dropPincode: string;
    length: number;
    breadth: number;
    height: number;
    actualWeight: number;
    orderType: OrderType;
    paymentType: PaymentType;
    scheduledDate?: string;
    customerId?: string;
  },
  userId: string,
  userRole: Role
) {
  // Calculate charges via the rate engine
  const charges = await calculateCharge({
    pickupArea: input.pickupArea,
    pickupPincode: input.pickupPincode,
    dropArea: input.dropArea,
    dropPincode: input.dropPincode,
    length: input.length,
    breadth: input.breadth,
    height: input.height,
    actualWeight: input.actualWeight,
    orderType: input.orderType,
    paymentType: input.paymentType,
  });

  // Admin can create on behalf of customer
  const customerId = (userRole === 'ADMIN' && input.customerId) ? input.customerId : userId;
  const trackingId = generateTrackingId();

  // Atomic creation: order + initial tracking entry
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        trackingId,
        customerId,
        pickupAddress: input.pickupAddress,
        pickupArea: input.pickupArea,
        pickupPincode: input.pickupPincode,
        dropAddress: input.dropAddress,
        dropArea: input.dropArea,
        dropPincode: input.dropPincode,
        packageLength: input.length,
        packageBreadth: input.breadth,
        packageHeight: input.height,
        actualWeight: input.actualWeight,
        volumetricWeight: charges.volumetricWeight,
        billableWeight: charges.billableWeight,
        orderType: input.orderType,
        paymentType: input.paymentType,
        baseCharge: charges.baseCharge,
        weightCharge: charges.weightCharge,
        codSurcharge: charges.codSurcharge,
        totalCharge: charges.totalCharge,
        status: OrderStatus.PENDING,
        pickupZoneId: charges.pickupZoneId,
        dropZoneId: charges.dropZoneId,
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : null,
        createdBy: userId,
      },
    });

    await tx.trackingHistory.create({
      data: {
        orderId: newOrder.id,
        status: OrderStatus.PENDING,
        notes: 'Order created',
        changedBy: userId,
      },
    });

    return newOrder;
  });

  // Non-blocking notification
  sendOrderNotification(order.id, OrderStatus.PENDING).catch(() => {});

  return order;
}

/**
 * Get orders with role-based filtering and pagination.
 */
export async function getOrders(
  filters: {
    status?: OrderStatus;
    orderType?: OrderType;
    paymentType?: PaymentType;
    page?: number;
    limit?: number;
    search?: string;
  },
  userId: string,
  userRole: Role
) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  // Role-based access control
  if (userRole === 'CUSTOMER') {
    where.customerId = userId;
  } else if (userRole === 'AGENT') {
    const agent = await prisma.deliveryAgent.findUnique({ where: { userId } });
    if (agent) where.agentId = agent.id;
  }
  // ADMIN sees all

  if (filters.status) where.status = filters.status;
  if (filters.orderType) where.orderType = filters.orderType;
  if (filters.paymentType) where.paymentType = filters.paymentType;
  if (filters.search) {
    where.OR = [
      { trackingId: { contains: filters.search, mode: 'insensitive' } },
      { pickupAddress: { contains: filters.search, mode: 'insensitive' } },
      { dropAddress: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        agent: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        pickupZone: { select: { name: true } },
        dropZone: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Get order by ID with full tracking history.
 */
export async function getOrderById(orderId: string, userId: string, userRole: Role) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      agent: {
        include: { user: { select: { name: true, email: true, phone: true } } },
      },
      pickupZone: { select: { id: true, name: true } },
      dropZone: { select: { id: true, name: true } },
      trackingHistory: {
        include: {
          user: { select: { name: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!order) throw new Error('Order not found');
  if (userRole === 'CUSTOMER' && order.customerId !== userId) {
    throw new Error('Access denied');
  }

  return order;
}

/**
 * Update order status with state machine validation.
 * Creates immutable tracking entry and triggers notification.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  actorId: string,
  actorRole: Role,
  notes?: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { agent: true },
  });

  if (!order) throw new Error('Order not found');

  // Validate state transition
  const allowed = VALID_STATUS_TRANSITIONS[order.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new Error(
      `Invalid status transition: ${order.status} → ${newStatus}. Allowed: ${allowed?.join(', ') || 'none'}`
    );
  }

  // Agents can only update their assigned orders
  if (actorRole === 'AGENT') {
    const agent = await prisma.deliveryAgent.findUnique({ where: { userId: actorId } });
    if (!agent || order.agentId !== agent.id) {
      throw new Error('You can only update orders assigned to you');
    }
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // Immutable tracking entry
    await tx.trackingHistory.create({
      data: { orderId, status: newStatus, notes, changedBy: actorId },
    });

    // Release agent on terminal statuses
    if ((newStatus === 'DELIVERED' || newStatus === 'FAILED') && order.agentId) {
      await tx.deliveryAgent.update({
        where: { id: order.agentId },
        data: { status: 'AVAILABLE' },
      });
    }

    return updated;
  });

  sendOrderNotification(orderId, newStatus, notes).catch(() => {});
  return updatedOrder;
}

/**
 * Reschedule a failed order.
 * Resets to PENDING, increments attempt, clears agent, tries auto-reassign.
 */
export async function rescheduleOrder(orderId: string, newDate: string, userId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) throw new Error('Order not found');
  if (order.status !== 'FAILED') throw new Error('Only failed orders can be rescheduled');
  if (order.customerId !== userId) throw new Error('You can only reschedule your own orders');

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PENDING,
        scheduledDate: new Date(newDate),
        attemptCount: { increment: 1 },
        agentId: null,
      },
    });

    await tx.trackingHistory.create({
      data: {
        orderId,
        status: OrderStatus.PENDING,
        notes: `Rescheduled for ${newDate}. Attempt #${order.attemptCount + 1}`,
        changedBy: userId,
      },
    });

    return updated;
  });

  // Try auto-assignment for rescheduled order
  if (order.pickupZoneId) {
    try {
      const agent = await findNearestAvailableAgent(order.pickupZoneId);
      if (agent) await assignAgentToOrder(orderId, agent.id);
    } catch {
      // Non-critical
    }
  }

  sendOrderNotification(orderId, OrderStatus.PENDING, `Rescheduled for ${newDate}`).catch(() => {});
  return updatedOrder;
}

/**
 * Manual agent assignment by admin.
 */
export async function manualAssignAgent(orderId: string, agentId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Order not found');

  if (order.agentId) await releaseAgent(order.agentId);
  return assignAgentToOrder(orderId, agentId);
}

/**
 * Auto-assign nearest available agent (admin trigger).
 */
export async function autoAssignAgent(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Order not found');
  if (!order.pickupZoneId) throw new Error('Order has no pickup zone — cannot auto-assign');

  const agent = await findNearestAvailableAgent(order.pickupZoneId);
  if (!agent) {
    throw new Error('No available agents in the pickup zone. Try again later or assign manually.');
  }

  return assignAgentToOrder(orderId, agent.id);
}

/**
 * Get order by tracking ID (for public tracking page).
 */
export async function getOrderByTrackingId(trackingId: string) {
  const order = await prisma.order.findUnique({
    where: { trackingId },
    include: {
      pickupZone: { select: { name: true } },
      dropZone: { select: { name: true } },
      trackingHistory: {
        select: { status: true, notes: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!order) throw new Error('Order not found');

  return {
    trackingId: order.trackingId,
    status: order.status,
    pickupArea: order.pickupArea,
    dropArea: order.dropArea,
    scheduledDate: order.scheduledDate,
    attemptCount: order.attemptCount,
    pickupZone: order.pickupZone?.name,
    dropZone: order.dropZone?.name,
    timeline: order.trackingHistory,
  };
}