import prisma from '../config/database';
import { ZoneType } from '@prisma/client';

/**
 * Resolve an area to its zone by area name and pincode.
 * Throws if area is not found (not serviceable).
 */
export async function resolveZone(areaName: string, pincode: string) {
  const area = await prisma.area.findFirst({
    where: {
      name: { contains: areaName, mode: 'insensitive' },
      pincode: pincode,
    },
    include: { zone: true },
  });

  if (!area) {
    throw new Error(`Area '${areaName}' with pincode '${pincode}' is not serviceable. No zone mapping found.`);
  }

  return area.zone;
}

/**
 * Determine if shipment is intra-zone or inter-zone.
 */
export function determineZoneType(pickupZoneId: string, dropZoneId: string): ZoneType {
  return pickupZoneId === dropZoneId ? 'INTRA_ZONE' : 'INTER_ZONE';
}