"use client";

import Link from "next/link";
import {
  Calendar,
  CheckCheck,
  DollarSign,
  ExternalLink,
  Package,
  UserCheck,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  GymNotification,
  NotificationType,
  useMarkReadMutation,
} from "@/src/store/services/notificationsApi";
import { useLanguage } from "@/src/components/language/LanguageContext";
import { cn } from "@/src/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysLabel(daysLeft: number, t: (k: string) => string): string {
  if (daysLeft === -1) return "—";
  if (daysLeft < 0) return t("notifications.expired");
  if (daysLeft === 0) return t("notifications.endsToday");
  return `${daysLeft} ${t("notifications.daysLeft")}`;
}

function getDaysBadgeColor(daysLeft: number): string {
  if (daysLeft === -1)
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
  if (daysLeft <= 0)
    return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  if (daysLeft <= 3)
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
  if (daysLeft <= 7)
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
}

function getTypeLabel(
  type: NotificationType,
  name: string | null,
  t: (k: string) => string,
): string {
  if (type === "gym_fee_end") return name || t("notifications.typeGymFee");
  if (type === "trainer_end") return name || t("notifications.typeTrainer");
  if (type === "service_end") return name || t("notifications.typeService");
  if (type === "payment_overdue")
    return name || t("notifications.typePaymentOverdue");
  return name || t("notifications.typeSubscription");
}

function TypeIcon({
  type,
  className,
}: {
  type: NotificationType;
  className?: string;
}) {
  const cls = cn("h-5 w-5", className);
  if (type === "gym_fee_end") return <DollarSign className={cls} />;
  if (type === "trainer_end") return <UserCheck className={cls} />;
  if (type === "service_end") return <Package className={cls} />;
  if (type === "payment_overdue") return <Wallet className={cls} />;
  return <Calendar className={cls} />;
}

function typeIconBg(type: NotificationType): string {
  if (type === "gym_fee_end") return "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400";
  if (type === "trainer_end") return "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400";
  if (type === "service_end") return "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400";
  if (type === "payment_overdue") return "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  notification: GymNotification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDetailDialog({
  notification,
  open,
  onOpenChange,
}: Props) {
  const { t } = useLanguage();
  const [markRead] = useMarkReadMutation();

  if (!notification) return null;

  const handleMarkRead = async () => {
    if (!notification.isRead) {
      await markRead([notification._id]);
    }
  };

  const formattedDate = new Date(notification.createdAt).toLocaleDateString(
    undefined,
    { year: "numeric", month: "long", day: "numeric" },
  );

  const formattedRemaining =
    notification.remainingAmount != null
      ? notification.remainingAmount.toLocaleString() + " MMK"
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* ── Colored header strip ── */}
        <div className="bg-muted/40 border-b border-border px-6 pt-6 pb-5">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  typeIconBg(notification.type),
                )}
              >
                <TypeIcon type={notification.type} />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold leading-tight">
                  {t("notifications.detailTitle")}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getTypeLabel(notification.type, notification.targetName, t)}
                </p>
              </div>
              {!notification.isRead && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-blue-500 shrink-0" />
              )}
            </div>
          </DialogHeader>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4">
          {/* Customer */}
          <Row label={t("notifications.customer")}>
            <span className="font-medium">{notification.customerName}</span>
          </Row>

          {/* Item / type */}
          <Row label={t("notifications.item")}>
            <span>
              {getTypeLabel(notification.type, notification.targetName, t)}
            </span>
          </Row>

          {/* Days left / status */}
          <Row label={t("notifications.status")}>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                getDaysBadgeColor(notification.daysLeft),
              )}
            >
              {getDaysLabel(notification.daysLeft, t)}
            </span>
          </Row>

          {/* Remaining balance — payment_overdue only */}
          {notification.type === "payment_overdue" && formattedRemaining && (
            <Row label={t("notifications.remainingBalance")}>
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {formattedRemaining}
              </span>
            </Row>
          )}

          {/* Date */}
          <Row label={t("notifications.date")}>
            <span className="text-muted-foreground">{formattedDate}</span>
          </Row>
        </div>

        {/* ── Footer actions ── */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-3 bg-muted/20">
          <Link
            href={`/subscriptions/${notification.subscriptionId}`}
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("notifications.viewSubscription")}
          </Link>

          {!notification.isRead ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={handleMarkRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t("notifications.markRead")}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCheck className="h-3.5 w-3.5" />
              {t("notifications.markReadDone")}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Small layout helper ───────────────────────────────────────────────────────
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0 w-32">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
