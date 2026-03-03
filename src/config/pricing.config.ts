// Gym Plan Duration Configuration
// Prices will be set manually in the database
// This config only defines available plan types and durations

export const PlanDurations = {
  // Monthly Plans - Duration in months
  monthly: [1, 3, 6],

  // Yearly Plans - Duration in years
  yearly: [1, 1.5, 2, 2.5, 3],
};

// Plan type definitions
export type PlanType = 'monthly' | 'yearly';

// Get available durations for a plan type
export function getAvailableDurations(planType: PlanType): number[] {
  return PlanDurations[planType];
}

// Get plan display name
export function getPlanDisplayName(
  planType: PlanType,
  duration: number,
): string {
  const unit = planType === 'monthly' ? 'Month' : 'Year';
  const pluralUnit = duration === 1 ? unit : `${unit}s`;
  return `${planType.charAt(0).toUpperCase() + planType.slice(1)} (${duration} ${pluralUnit})`;
}

// Format duration display
export function formatDurationDisplay(planType: PlanType, duration: number): string {
  const unit = planType === 'monthly' ? 'month' : 'year';
  return `${duration} ${duration === 1 ? unit : `${unit}s`}`;
}
