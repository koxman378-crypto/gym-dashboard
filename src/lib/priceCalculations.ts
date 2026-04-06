import type {
  GymPriceItem,
  OtherServiceItem,
  DurationUnit,
  PromotionType,
} from "@/src/types/extended-types";

/**
 * Calculate final price for a gym price item
 * Formula: (amount * duration) - discount
 */
export function calculateGymFinalPrice(
  item: {
    duration: number;
    durationUnit: DurationUnit;
    amount: number;
    promotionType?: PromotionType;
    promotionValue?: number | null;
    isActive?: boolean;
  },
): number {
  // Calculate base total (amount * duration)
  const baseTotal = item.amount * item.duration;

  // Apply promotions if any
  if (!item.promotionType || !item.promotionValue) {
    return baseTotal;
  }

  if (item.promotionType === "percentage") {
    return baseTotal - (baseTotal * item.promotionValue) / 100;
  }

  // Fixed MMK discount
  return baseTotal - item.promotionValue;
}

/**
 * Calculate final price for an other service item
 * Formula: (price * duration) - discount
 */
export function calculateServiceFinalPrice(
  item: Omit<OtherServiceItem, "_id"> | OtherServiceItem
): number {
  // Calculate base total (price * duration)
  const baseTotal = item.amount * (item.duration ?? 1);

  // Apply promotions if any
  if (!item.promotionType || !item.promotionValue) {
    return baseTotal;
  }

  if (item.promotionType === "percentage") {
    return baseTotal - (baseTotal * item.promotionValue) / 100;
  }

  // Fixed MMK discount
  return baseTotal - item.promotionValue;
}

/**
 * Format promotion display text
 */
export function formatPromotionText(
  promotionType: PromotionType,
  promotionValue: number | null | undefined
): string {
  if (!promotionType || !promotionValue) return "";

  if (promotionType === "percentage") {
    return `${promotionValue}% off`;
  }

  return `${promotionValue.toLocaleString()} MMK off`;
}

/**
 * Calculate discount amount
 */
export function calculateDiscountAmount(
  baseAmount: number,
  promotionType: PromotionType,
  promotionValue: number | null | undefined
): number {
  if (!promotionType || !promotionValue) return 0;

  if (promotionType === "percentage") {
    return (baseAmount * promotionValue) / 100;
  }

  return promotionValue;
}
