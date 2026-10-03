import prisma from '../config/database';
import { AgentStatus } from '@prisma/client';

/**
 * Find the nearest available agent in the given zone.
 * For this project, "nearest" = same zone + AVAILABLE status.
 * Returns null if no agent is available.
 */
export async function findNearestAvailableAgent(zoneId: string) {
  const agent = await prisma.deliveryAgent.findFirst({
    where: {
      zoneId: zoneId,
      status: AgentStatus.AVAILABLE,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  return agent;
}

/**
 * Assign an agent to an order.
 * Sets the order's agentId and marks the agent as BUSY.
 * Uses a transaction to prevent race conditions.
 */
export async function assignAgentToOrder(orderId: string, agentId: string) {
  return prisma.$transaction(async (tx) => {
    // Verify agent is available
    const agent = await tx.deliveryAgent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    if (agent.status !== AgentStatus.AVAILABLE) {
      throw new Error(`Agent is currently ${agent.status.toLowerCase()} and cannot be assigned`);
    }

    // Assign agent to order and mark as BUSY
    const [updatedOrder] = await Promise.all([
      tx.order.update({
        where: { id: orderId },
        data: { agentId: agentId },
      }),
      tx.deliveryAgent.update({
        where: { id: agentId },
        data: { status: AgentStatus.BUSY },
      }),
    ]);

    return updatedOrder;
  });
}

/**
 * Release an agent (set status back to AVAILABLE).
 * Called when an order is delivered or when agent is unassigned.
 */
export async function releaseAgent(agentId: string) {
  return prisma.deliveryAgent.update({
    where: { id: agentId },
    data: { status: AgentStatus.AVAILABLE },
  });
}