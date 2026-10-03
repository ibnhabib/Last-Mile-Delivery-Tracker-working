import prisma from '../../config/database';
import { OrderType, ZoneType } from '@prisma/client';

export async function createRateCard(data: {
  orderType: OrderType;
  zoneType: ZoneType;
  baseRate: number;
  perKgRate: number;
  codSurcharge?: number;
}) {
  return prisma.rateCard.create({
    data: {
      orderType: data.orderType,
      zoneType: data.zoneType,
      baseRate: data.baseRate,
      perKgRate: data.perKgRate,
      codSurcharge: data.codSurcharge || 0,
    },
  });
}

export async function getAllRateCards() {
  return prisma.rateCard.findMany({
    orderBy: [{ orderType: 'asc' }, { zoneType: 'asc' }],
  });
}

export async function updateRateCard(
  id: string,
  data: { baseRate?: number; perKgRate?: number; codSurcharge?: number }
) {
  return prisma.rateCard.update({
    where: { id },
    data,
  });
}

export async function deleteRateCard(id: string) {
  return prisma.rateCard.delete({ where: { id } });
}