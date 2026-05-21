import {
  Calendar,
  DollarSign,
  Gift,
  Package,
  Receipt,
  RefreshCcw,
  UserCheck,
  Wallet,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  GymNotification,
  NotificationType,
} from "@/src/store/services/notificationsApi";

export type DashboardNotificationConfig = {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Tailwind classes for the icon wrapper bubble */
  iconBg: string;
  /** Label used for the "Item" row (falls back to targetName) */
  getLabel: (notification: GymNotification, t: (k: string) => string) => string;
  /** Whether to render the remaining-amount row */
  showRemainingAmount?: boolean;
};

const DEFAULT_CONFIG: DashboardNotificationConfig = {
  icon: Bell,
  iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  getLabel: (n, t) => n.targetName ?? t("notifications.typeSubscription"),
};

export const DASHBOARD_NOTIFICATION_CONFIG: Record<
  NotificationType,
  DashboardNotificationConfig
> = {
  subscription_end: {
    icon: Calendar,
    iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    getLabel: (n, t) => n.targetName ?? t("notifications.typeSubscription"),
  },

  gym_fee_end: {
    icon: DollarSign,
    iconBg:
      "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    getLabel: (n, t) => n.targetName ?? t("notifications.typeGymFee"),
  },

  trainer_end: {
    icon: UserCheck,
    iconBg:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    getLabel: (n, t) => n.targetName ?? t("notifications.typeTrainer"),
  },

  service_end: {
    icon: Package,
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    getLabel: (n, t) => n.targetName ?? t("notifications.typeService"),
  },

  payment_overdue: {
    icon: Wallet,
    iconBg:
      "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400",
    getLabel: (_n, t) => t("notifications.typePaymentOverdue"),
    showRemainingAmount: true,
  },

  subscription_extended: {
    icon: RefreshCcw,
    iconBg:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    getLabel: (n, t) => n.targetName ?? t("notifications.typeSubscription"),
  },

  payment_approved: {
    icon: CheckCircle2,
    iconBg:
      "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    getLabel: (_n, t) => t("notifications.typePaymentApproved"),
    showRemainingAmount: true,
  },

  payment_rejected: {
    icon: XCircle,
    iconBg: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
    getLabel: (_n, t) => t("notifications.typePaymentRejected"),
  },
};

export function getDashboardNotificationConfig(
  type: NotificationType,
): DashboardNotificationConfig {
  return DASHBOARD_NOTIFICATION_CONFIG[type] ?? DEFAULT_CONFIG;
}
