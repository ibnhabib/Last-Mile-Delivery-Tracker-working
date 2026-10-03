import { Role, OrderStatus, OrderType, PaymentType, ZoneType } from '@prisma/client';

// ─── JWT ─────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

// ─── Rate Engine ─────────────────────────────────────────────────────────────

export interface ChargeBreakdown {
  pickupZoneId: string;
  pickupZoneName: string;
  dropZoneId: string;
  dropZoneName: string;
  zoneType: ZoneType;
  volumetricWeight: number;
  billableWeight: number;
  baseCharge: number;
  weightCharge: number;
  codSurcharge: number;
  totalCharge: number;
}

// ─── Order Creation ──────────────────────────────────────────────────────────

export interface OrderCreateInput {
  customerId: string;
  pickupAddress: string;
  pickupArea: string;
  pickupPincode: string;
  dropAddress: string;
  dropArea: string;
  dropPincode: string;
  packageLength: number;
  packageBreadth: number;
  packageHeight: number;
  actualWeight: number;
  orderType: OrderType;
  paymentType: PaymentType;
  scheduledDate?: string;
}

// ─── Order Filters ───────────────────────────────────────────────────────────

export interface OrderFilters {
  status?: OrderStatus;
  orderType?: OrderType;
  paymentType?: PaymentType;
  customerId?: string;
  agentId?: string;
  page: number;
  limit: number;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Express Augmentation ────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}