import prisma from '../config/database';
import { OrderType, PaymentType } from '@prisma/client';
import { resolveZone, determineZoneType } from './zoneEngine';
import { ChargeBreakdown } from '../types';

/**
 * Calculate volumetric weight from dimensions (in cm).
 * Formula: (L × B × H) / 5000
 */
export function calculateVolumetricWeight(length: number, breadth: number, height: number): number {
  return (length * breadth * height) / 5000;
}

/**
 * Calculate billable weight = MAX(actual, volumetric)
 */
export function calculateBillableWeight(actualWeight: number, volumetricWeight: number): number {
  return Math.max(actualWeight, volumetricWeight);
}

/**
 * Full rate calculation engine.
 * Resolves zones, determines zone type, looks up rate card, calculates all charges.
 */
export async function calculateCharge(params: {
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
  // 1. Resolve zones
  const pickupZone = await resolveZone(params.pickupArea, params.pickupPincode);
  const dropZone = await resolveZone(params.dropArea, params.dropPincode);

  // 2. Determine zone type
  const zoneType = determineZoneType(pickupZone.id, dropZone.id);

  // 3. Calculate weights
  const volumetricWeight = calculateVolumetricWeight(params.length, params.breadth, params.height);
  const billableWeight = calculateBillableWeight(params.actualWeight, volumetricWeight);

  // 4. Lookup rate card
  // We match the rate card based on two primary dimensions:
  // - Order Type (e.g., B2B vs B2C) which might have different SLA requirements.
  // - Zone Type (INTRA_ZONE vs INTER_ZONE) which impacts transit logistics and costs.
  const rateCard = await prisma.rateCard.findUnique({
    where: {
      orderType_zoneType: {
        orderType: params.orderType,
        zoneType: zoneType,
      },
    },
  });

  if (!rateCard) {
    throw new Error(
      `No rate card configured for ${params.orderType} ${zoneType} shipments. Route not serviceable.`
    );
  }

  // 5. Calculate charges
  // Base charge covers the fixed operational cost of pickup and first-mile sorting.
  const baseCharge = Number(rateCard.baseRate);
  
  // Weight charge is calculated dynamically based on the higher of actual vs volumetric weight.
  const weightCharge = Number((billableWeight * Number(rateCard.perKgRate)).toFixed(2));
  
  // COD (Cash on Delivery) incurs additional risk and handling surcharges.
  const codSurcharge = params.paymentType === 'COD' ? Number(rateCard.codSurcharge) : 0;
  
  // Final total represents the sum of all computed logistics costs.
  const totalCharge = Number((baseCharge + weightCharge + codSurcharge).toFixed(2));

  return {
    pickupZoneId: pickupZone.id,
    pickupZoneName: pickupZone.name,
    dropZoneId: dropZone.id,
    dropZoneName: dropZone.name,
    zoneType,
    volumetricWeight: Number(volumetricWeight.toFixed(2)),
    billableWeight: Number(billableWeight.toFixed(2)),
    baseCharge,
    weightCharge,
    codSurcharge,
    totalCharge,
  };
}