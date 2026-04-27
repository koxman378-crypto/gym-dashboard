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

export type GymFee = GymPriceGroup;

// ===== GYM FEE RECORDS (flat backend model) =====
export interface GymFeeRecord {
  _id: string;
  name: string;
  gymId?: string | null;
  amount: number;
  duration: number;
  durationUnit: DurationUnit;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateGymFeeRecordDto {
  name: string;
  amount: number;
  duration: number;
  durationUnit: DurationUnit;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  isActive?: boolean;
}

export interface UpdateGymFeeRecordDto {
  name?: string;
  amount?: number;
  duration?: number;
  durationUnit?: DurationUnit;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  isActive?: boolean;
}

export interface CreateGymPriceDto {
  name: string;
  prices: Array<{
    duration: number;
    durationUnit: DurationUnit;
    amount: number;
    promotionType?: PromotionType;
    promotionValue?: number | null;
    isActive?: boolean;
  }>;
  isActive?: boolean;
}

export interface UpdateGymPriceDto {
  name?: string;
  prices?: Array<{
    duration: number;
    durationUnit: DurationUnit;
    amount: number;
    promotionType?: PromotionType;
    promotionValue?: number | null;
    isActive?: boolean;
  }>;
  isActive?: boolean;
}

export type CreateGymFeeDto = CreateGymPriceDto;
export type UpdateGymFeeDto = UpdateGymPriceDto;

// ===== OTHER SERVICE ITEMS =====
export interface OtherServiceItem {
  _id: string;
  name: string;
  gymId?: string | null;
  amountDays: number;
  amountMonths: number;
  amountYears: number;
  duration?: number;
  durationUnit?: DurationUnit;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ServiceItem = OtherServiceItem;

export interface CreateOtherServiceDto {
  name: string;
  amountDays: number | "";
  amountMonths: number | "";
  amountYears: number | "";
  isActive?: boolean;
}

export interface UpdateOtherServiceDto {
  name?: string;
  amountDays?: number | "";
  amountMonths?: number | "";
  amountYears?: number | "";
  isActive?: boolean;
}

export type CreateServiceItemDto = CreateOtherServiceDto;
export type UpdateServiceItemDto = UpdateOtherServiceDto;

// ===== SUBSCRIPTION SNAPSHOTS (matching backend schema) =====
export interface GymFeeSnapshot {
  feeId: string;
  name: string;
  amount: number;
  duration: number;
  durationUnit: DurationUnit;
  totalAmount: number;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  discountAmount: number;
  finalAmount: number;
  endDate: Date | string;
  priceRowId?: string;
  finalPrice: number;
}

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

export interface ServiceSnapshot {
  serviceId: string;
  name: string;
  amount: number;
  duration: number;
  durationUnit: DurationUnit;
  totalAmount: number;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  discountAmount: number;
  finalAmount: number;
  endDate: Date | string;
  serviceRowId?: string;
  price?: number;
  finalPrice: number;
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
  amount: number;
  isActive: boolean;
}

export interface CreateTrainerFeeItemDto {
  amount: number;
  isActive?: boolean;
}

export interface UpdateTrainerFeesDto {
  trainerFees: CreateTrainerFeeItemDto[];
}

export interface TrainerSnapshot {
  trainerId: string;
  trainerName: string;
  // enriched client-side from trainers list
  trainerEmail?: string;
  trainerAvatar?: string | null;
  feeId: string;
  duration: number;
  durationUnit: DurationUnit;
  amount: number;
  totalAmount: number;
  promotionType?: PromotionType;
  promotionValue?: number | null;
  discountAmount: number;
  finalAmount: number;
  endDate: Date | string;
  feeRowId?: string;
  finalPrice: number;
}

// ===== SUBSCRIPTION STRUCTURE (matching backend schema) =====
export interface Subscription {
  _id: string;
  customer: any; // User object or ObjectId
  gymId?: string | null;
  startDate: Date | string;
  gymFee: GymFeeSnapshot | null;
  services: ServiceSnapshot[];
  trainer: TrainerSnapshot | null;
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  endDate: Date | string;
  status: "active" | "expired" | "cancelled";
  paymentStatus: "paid" | "pending" | "partial";
  paidAmount: number;
  notes?: string | null;
  createdBy?: any; // User object or ObjectId
  createdAt?: Date | string;
  updatedAt?: Date | string;
  gymPriceGroup?: GymPriceGroupSnapshot | null;
  otherServiceGroups?: OtherServiceGroupSnapshot[];
  gymPriceTotal: number;
  otherServiceTotal: number;
  trainerFeeTotal: number;
}

export interface CreateSubscriptionDto {
  customer: string;
  gymId?: string | null;
  startDate: string | Date;
  services?: Array<{
    serviceId: string;
    duration: number;
    durationUnit: string;
    promotionType?: string | null;
    promotionValue?: number | null;
  }>;
  gymFee?: { feeId: string };
  trainer?: {
    trainerId: string;
    trainerFeeId?: string;
    duration: number;
    durationUnit: string;
    promotionType?: string | null;
    promotionValue?: number | null;
  };
  paymentStatus?: "paid" | "pending" | "partial";
  paidAmount?: number;
  notes?: string;
}

export interface UpdateSubscriptionDto {
  startDate?: string | Date;
  gymFee?: { feeId: string } | null;
  services?: Array<{
    serviceId: string;
    duration: number;
    durationUnit: string;
    promotionType?: string | null;
    promotionValue?: number | null;
  }>;
  trainer?: {
    trainerId: string;
    trainerFeeId?: string;
    duration: number;
    durationUnit: string;
    promotionType?: string | null;
    promotionValue?: number | null;
  } | null;
  paymentStatus?: "paid" | "pending" | "partial";
  paidAmount?: number;
  notes?: string;
  status?: "active" | "expired" | "cancelled";
}

// ==================== FAQS ====================

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFaqDto {
  question: string;
  answer: string;
}

export interface UpdateFaqDto {
  question?: string;
  answer?: string;
  isActive?: boolean;
}

// ==================== EXPIRY PRESETS ====================

export interface ExpiryPreset {
  _id: string;
  label: string;
  days: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpiryPresetDto {
  label: string;
  days: number;
}

export interface UpdateExpiryPresetDto {
  label?: string;
  days?: number;
  isActive?: boolean;
}
