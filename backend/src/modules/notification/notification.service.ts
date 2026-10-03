import prisma from '../../config/database';
import { OrderStatus, NotificationStatus } from '@prisma/client';
import { sendEmail } from './email.service';

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  PENDING: 'Your order has been placed and is pending pickup.',
  PICKED_UP: 'Your package has been picked up by our delivery agent.',
  IN_TRANSIT: 'Your package is in transit to the destination.',
  OUT_FOR_DELIVERY: 'Your package is out for delivery! It will arrive soon.',
  DELIVERED: 'Your package has been successfully delivered. Thank you!',
  FAILED: 'Delivery attempt failed. You can reschedule the delivery from your dashboard.',
};

/**
 * Send notification to customer on order status change.
 * This function NEVER throws — notification failure must not break the status update flow.
 */
export async function sendOrderNotification(
  orderId: string,
  status: OrderStatus,
  notes?: string
): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) return;

    const subject = `Order ${order.trackingId} - ${status.replace(/_/g, ' ')}`;
    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #09090b; color: #f4f4f5; border: 1px solid #333; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #f97316 50%, #eab308 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: black; margin: 0; font-size: 24px;">🚀 LastMileUS Update</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Hi <strong>${order.customer.name}</strong>,</p>
          <p style="font-size: 16px;">${STATUS_MESSAGES[status]}</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
            <p><strong>Status:</strong> ${status.replace(/_/g, ' ')}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            <p><strong>Drop Address:</strong> ${order.dropAddress}</p>
          </div>
          ${status === 'FAILED' ? '<p style="color: #e74c3c; font-weight: bold;">You can reschedule this delivery from your dashboard.</p>' : ''}
          <p style="color: #666; font-size: 14px;">Thank you for using LastMileUS.</p>
        </div>
      </div>
    `;

    const emailSent = await sendEmail(order.customer.email, subject, html);

    // Log notification
    await prisma.notification.create({
      data: {
        orderId: order.id,
        userId: order.customer.id,
        type: 'EMAIL',
        subject,
        content: html,
        status: emailSent ? NotificationStatus.SENT : NotificationStatus.FAILED,
      },
    });
  } catch (error) {
    console.error('[NOTIFICATION ERROR]', error);
    // Never throw — notification failure must not break the status update
  }
}