import prisma from '../../config/database';
import { AgentStatus } from '@prisma/client';

export async function getAllAgents(zoneId?: string) {
  return prisma.deliveryAgent.findMany({
    where: zoneId ? { zoneId } : undefined,
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      zone: {
        select: { id: true, name: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function updateAgentStatus(agentId: string, status: AgentStatus) {
  return prisma.deliveryAgent.update({
    where: { id: agentId },
    data: { status },
    include: {
      user: { select: { name: true, email: true } },
      zone: { select: { id: true, name: true } },
    },
  });
}

export async function updateAgentLocation(agentId: string, zoneId: string, currentArea?: string) {
  // Verify zone exists
  const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
  if (!zone) throw new Error('Zone not found');

  return prisma.deliveryAgent.update({
    where: { id: agentId },
    data: { zoneId, currentArea },
    include: {
      user: { select: { name: true, email: true } },
      zone: { select: { id: true, name: true } },
    },
  });
}

export async function getAgentByUserId(userId: string) {
  return prisma.deliveryAgent.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      zone: { select: { id: true, name: true } },
    },
  });
}