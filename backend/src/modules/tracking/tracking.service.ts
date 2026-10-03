import prisma from '../../config/database';

export async function getTrackingHistory(orderId: string) {
  return prisma.trackingHistory.findMany({
    where: { orderId },
    include: {
      actor: { select: { name: true, role: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getTrackingByTrackingId(trackingId: string) {
  const order = await prisma.order.findUnique({
    where: { trackingId },
    select: { id: true },
  });

  if (!order) throw new Error('Order not found');
  return getTrackingHistory(order.id);
}