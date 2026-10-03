import { OrderStatus } from '@prisma/client';
import crypto from 'crypto';

// ─── Status Transition Map ──────────────────────────────────────────────────
// Defines which OrderStatus values a given status is allowed to transition to.
// DELIVERED is terminal. FAILED can only go back to PENDING (reschedule).

export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PICKED_UP],
  [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.FAILED],
  [OrderStatus.FAILED]: [OrderStatus.PENDING], // reschedule only
  [OrderStatus.DELIVERED]: [],                  // terminal – no transitions allowed
};

// ─── Tracking ID ─────────────────────────────────────────────────────────────

export const TRACKING_ID_PREFIX = 'LMD';

/**
 * Generate a unique tracking ID of the form `LMD-XXXXXX`
 * where X is an uppercase alphanumeric character.
 */
export function generateTrackingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(6);
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[bytes[i] % chars.length];
  }
  return `${TRACKING_ID_PREFIX}-${suffix}`;
}

// ─── Volumetric Weight ───────────────────────────────────────────────────────

export const VOLUMETRIC_DIVISOR = 5000;

/**
 * Calculate volumetric weight using the industry-standard formula.
 * volumetric = (L × B × H) / 5000
 */
export function calculateVolumetricWeight(
  lengthCm: number,
  breadthCm: number,
  heightCm: number,
): number {
  return (lengthCm * breadthCm * heightCm) / VOLUMETRIC_DIVISOR;
}

/**
 * Billable weight is the greater of actual weight and volumetric weight.
 */
export function calculateBillableWeight(
  actualWeight: number,
  volumetricWeight: number,
): number {
  return Math.max(actualWeight, volumetricWeight);
}