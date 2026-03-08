// ==================== ENUMS ====================

export enum SubscriptionStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PAID = "paid",
  PENDING = "pending",
  PARTIAL = "partial",
}

// ==================== CUSTOM FEES ====================

// Duration unit enum
export type DurationUnit = "days" | "months" | "years";

// Promotion type enum
export type PromotionType = "percentage" | "mmk" | null;

// ===== GYM PRICE GROUPS =====
export interface GymPriceItem {
  _id: string;
  duration: number;
  durationUnit: DurationUnit;
  amount: number;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  isActive: boolean;
}

export interface GymPriceGroup {
  _id: string;
  name: string;
  prices: GymPriceItem[];
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateGymPriceDto {
  name: string;
  prices: Omit<GymPriceItem, "_id">[];
  isActive?: boolean;
}

export interface UpdateGymPriceDto {
  name?: string;
  prices?: Omit<GymPriceItem, "_id">[];
  isActive?: boolean;
}

// ===== OTHER SERVICE GROUPS =====
export interface OtherServiceItem {
  _id: string;
  name: string;
  duration: number;
  durationUnit: DurationUnit;
  price: number;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  isActive: boolean;
}

export interface OtherServiceGroup {
  _id: string;
  name: string;
  services: OtherServiceItem[];
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateOtherServiceDto {
  name: string;
  services: Omit<OtherServiceItem, "_id">[];
  isActive?: boolean;
}

export interface UpdateOtherServiceDto {
  name?: string;
  services?: Omit<OtherServiceItem, "_id">[];
  isActive?: boolean;
}

// ===== SUBSCRIPTION SNAPSHOTS =====
export interface GymPriceRowSnapshot {
  priceRowId: string;
  duration: number;
  durationUnit: DurationUnit;
  amount: number;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  finalPrice: number;
}

export interface GymPriceGroupSnapshot {
  groupId: string;
  groupName: string;
  selectedPrice: GymPriceRowSnapshot;
}

export interface OtherServiceRowSnapshot {
  serviceRowId: string;
  name: string;
  duration: number;
  durationUnit: DurationUnit;
  price: number;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  finalPrice: number;
}

export interface OtherServiceGroupSnapshot {
  groupId: string;
  groupName: string;
  selectedServices: OtherServiceRowSnapshot[];
}

// ===== TRAINER FEE SYSTEM =====
export interface TrainerFeeItem {
  _id: string;
  duration: number;
  durationUnit: DurationUnit;
  amount: number;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  isActive: boolean;
}

export interface CreateTrainerFeeItemDto {
  duration: number;
  durationUnit: DurationUnit;
  amount: number;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  isActive?: boolean;
}

export interface UpdateTrainerFeesDto {
  trainerFees: CreateTrainerFeeItemDto[];
}

export interface TrainerSnapshot {
  trainerId: string;
  trainerName: string;
  feeRowId: string;
  duration: number;
  durationUnit: DurationUnit;
  amount: number;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  finalPrice: number;
}

// ===== SUBSCRIPTION STRUCTURE (Custom Fees System) =====
export interface Subscription {
  _id: string;
  trainerFeeRowId?: string;
  customer: any; // User object or ObjectId
  gymPriceGroup: GymPriceGroupSnapshot | null;
  otherServiceGroups: OtherServiceGroupSnapshot[];
  trainer: TrainerSnapshot | null;
  gymPriceTotal: number;
  otherServiceTotal: number;
  trainerFeeTotal: number;
  grandTotal: number;
  startDate: Date | string;
  endDate: Date | string;
  status: "active" | "expired" | "cancelled";
  paymentStatus: "paid" | "pending" | "partial";
  paidAmount: number;
  notes?: string | null;
  createdBy: any; // User object or ObjectId
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateSubscriptionDto {
  customer: string;
  gymPrice?: {
    groupId: string;
    priceRowId: string;
  };
  otherServices?: Array<{
    groupId: string;
    serviceRowIds: string[];
  }>;
  trainerId?: string;
  trainerFeeRowId?: string;
  startDate: string | Date;
  endDate: string | Date;
  paymentStatus?: "paid" | "pending" | "partial";
  paidAmount?: number;
  notes?: string;
}

export interface UpdateSubscriptionDto {
  paymentStatus?: "paid" | "pending" | "partial";
  paidAmount?: number;
  notes?: string;
  status?: "active" | "expired" | "cancelled";
}
