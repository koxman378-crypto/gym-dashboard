"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import {
  Bell,
  CheckCheck,
  Wallet,
  DollarSign,
  Package,
  UserCheck,
  Calendar,
  Trash2,
  UserRound,
  ReceiptText,
  Wrench,
  Zap,
  Dumbbell,
  Banknote,
  Home,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { useLanguage } from "@/src/components/language/LanguageContext";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
  useDeleteNotificationMutation,
  GymNotification,
  NotificationType,
} from "@/src/store/services/notificationsApi";
import {
  useGetExpensesQuery,
  useApproveExpenseMutation,
  useRejectExpenseMutation,
  type Expense,
} from "@/src/store/services/expensesApi";
import { cn } from "@/src/lib/utils";
import { DataTablePagination } from "@/src/components/data-table/data-table-pagination";
import { useOwnerBranchFilter } from "@/src/components/layout/OwnerBranchFilterContext";
import { ConfirmAlertDialog } from "@/src/components/notifications/ConfirmAlertDialog";
import type { NotificationListItem } from "@/src/types/type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

function AnimatedNotificationItem({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: false });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="mb-3 last:mb-0"
    >
      {children}
    </motion.div>
  );
}

function getDaysBadgeVariant(daysLeft: number): string {
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

function TypeIcon({ type }: { type: NotificationType }) {
  const cls = "h-4 w-4";
  if (type === "gym_fee_end") return <DollarSign className={cls} />;
  if (type === "trainer_end") return <UserCheck className={cls} />;
  if (type === "service_end") return <Package className={cls} />;
  if (type === "payment_overdue") return <Wallet className={cls} />;
  return <Calendar className={cls} />;
}

function typeLabel(
  type: NotificationType,
  name: string | null,
  t: (k: string) => string,
): string {
  if (type === "gym_fee_end") {
    return name
      ? `${t("notifications.typeGymFee")}: ${name}`
      : t("notifications.typeGymFee");
  }
  if (type === "trainer_end") {
    return name
      ? `${t("notifications.typeTrainer")}: ${name}`
      : t("notifications.typeTrainer");
  }
  if (type === "service_end") {
    return name
      ? `${t("notifications.typeService")}: ${name}`
      : t("notifications.typeService");
  }
  if (type === "subscription_end") {
    return name
      ? `${t("notifications.typeSubscription")}: ${name}`
      : t("notifications.typeSubscription");
  }
  if (type === "payment_overdue") return t("notifications.typePaymentOverdue");
  return name || t("notifications.typeSubscription");
}

function getDaysSummary(daysLeft: number, t: (k: string) => string): string {
  if (daysLeft === -1) return t("notifications.typePaymentOverdue");
  if (daysLeft < 0) return t("notifications.expired");
  if (daysLeft === 0) return t("notifications.endsToday");
  if (daysLeft === 1) return `1 ${t("notifications.daysLeft")}`;
  return `${daysLeft} ${t("notifications.daysLeft")}`;
}

function expandExpiryItems(notification: GymNotification): Array<{
  notification: GymNotification;
  type: NotificationType;
  targetName: string | null;
  daysLeft: number;
}> {
  if (notification.type !== "subscription_end") {
    return [
      {
        notification,
        type: notification.type,
        targetName: notification.targetName,
        daysLeft: notification.daysLeft,
      },
    ];
  }

  const hasAggregatedSnapshot =
    notification.subscriptionDaysLeft !== undefined ||
    notification.gymFeeDaysLeft !== undefined ||
    notification.trainerDaysLeft !== undefined ||
    (notification.serviceDaysLeft?.length ?? 0) > 0;

  if (!hasAggregatedSnapshot) {
    return [
      {
        notification,
        type: notification.type,
        targetName: notification.targetName,
        daysLeft: notification.daysLeft,
      },
    ];
  }

  const items: Array<{
    notification: GymNotification;
    type: NotificationType;
    targetName: string | null;
    daysLeft: number;
  }> = [];

  if (typeof notification.subscriptionDaysLeft === "number") {
    items.push({
      notification,
      type: "subscription_end",
      targetName: "Subscription",
      daysLeft: notification.subscriptionDaysLeft,
    });
  }

  if (typeof notification.gymFeeDaysLeft === "number") {
    items.push({
      notification,
      type: "gym_fee_end",
      targetName: "Gym Fee",
      daysLeft: notification.gymFeeDaysLeft,
    });
  }

  if (typeof notification.trainerDaysLeft === "number") {
    items.push({
      notification,
      type: "trainer_end",
      targetName: "Trainer",
      daysLeft: notification.trainerDaysLeft,
    });
  }

  for (const service of notification.serviceDaysLeft ?? []) {
    items.push({
      notification,
      type: "service_end",
      targetName: service.name,
      daysLeft: service.daysLeft,
    });
  }

  if (items.length === 0) {
    items.push({
      notification,
      type: notification.type,
      targetName: notification.targetName,
      daysLeft: notification.daysLeft,
    });
  }

  return items;
}

function buildNotificationListItems(
  notifications: GymNotification[],
): NotificationListItem[] {
  // Group notifications by subscription
  const bySubscription = new Map<
    string,
    {
      expiry: GymNotification[];
      payment?: GymNotification;
    }
  >();

  for (const notification of notifications) {
    const subId = notification.subscriptionId;
    if (!bySubscription.has(subId)) {
      bySubscription.set(subId, { expiry: [] });
    }
    const group = bySubscription.get(subId)!;

    if (notification.type === "payment_overdue") {
      group.payment = notification;
    } else {
      group.expiry.push(notification);
    }
  }

  // Build list items
  const items: NotificationListItem[] = [];

  for (const [subId, group] of bySubscription) {
    // If payment-only (no expiry items), create separate item
    if (group.expiry.length === 0 && group.payment) {
      items.push({
        key: `payment:${subId}`,
        subscriptionId: subId,
        customerId: group.payment.customerId,
        customerName: group.payment.customerName,
        customerAvatar: group.payment.customerAvatar,
        expiryItems: [],
        payment: group.payment,
        relatedIds: [group.payment._id],
        isUnread: !group.payment.isRead,
      });
      continue;
    }

    // If expiry items exist, group them all together
    if (group.expiry.length > 0) {
      const first = group.expiry[0];
      const expiryItems = group.expiry.flatMap((n) => expandExpiryItems(n));

      const allIds = [
        ...group.expiry.map((n) => n._id),
        ...(group.payment ? [group.payment._id] : []),
      ];

      const hasUnread =
        group.expiry.some((n) => !n.isRead) ||
        Boolean(group.payment && !group.payment.isRead);

      items.push({
        key: `expiry:${subId}`,
        subscriptionId: subId,
        customerId: first.customerId,
        customerName: first.customerName,
        customerAvatar: first.customerAvatar,
        expiryItems,
        payment: group.payment,
        relatedIds: allIds,
        isUnread: hasUnread,
        offDayName: first.offDayName ?? null,
        offDayDaysAdded: first.offDayDaysAdded ?? null,
        offDayAppliedAt: first.offDayAppliedAt ?? null,
      });
    }
  }

  return items;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function CustomerAvatar({
  name,
  avatar,
}: {
  name: string;
  avatar?: string | null;
}) {
  return (
    <div className="relative shrink-0">
      {avatar ? (
        <Image
          src={avatar}
          alt={name}
          width={44}
          height={44}
          unoptimized
          className="h-11 w-11 rounded-full object-cover ring-1 ring-gray-100"
        />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-400">
          <UserRound className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

function getExpiryAccentColor(daysLeft: number) {
  if (daysLeft === -1 || (daysLeft <= 3 && daysLeft >= 0))
    return {
      border: "border-orange-200",
      bg: "bg-orange-50",
      dot: "bg-orange-400",
      icon: "text-orange-500",
    };
  if (daysLeft <= 0)
    return {
      border: "border-red-200",
      bg: "bg-red-50",
      dot: "bg-red-400",
      icon: "text-red-500",
    };
  if (daysLeft <= 7)
    return {
      border: "border-yellow-200",
      bg: "bg-yellow-50",
      dot: "bg-yellow-400",
      icon: "text-yellow-500",
    };
  return {
    border: "border-blue-100",
    bg: "bg-blue-50",
    dot: "bg-blue-400",
    icon: "text-blue-500",
  };
}

function NotificationRow({
  item,
  onMarkRead,
  onDelete,
  t,
}: {
  item: NotificationListItem;
  onMarkRead: (ids: string[]) => void;
  onDelete: (item: NotificationListItem) => void;
  t: (k: string) => string;
}) {
  const {
    expiryItems,
    payment,
    isUnread,
    relatedIds,
    customerName,
    customerAvatar,
    offDayName,
    offDayDaysAdded,
    offDayAppliedAt,
  } = item;
  const isPaymentOnly = expiryItems.length === 0 && payment;
  const remainingAmount = payment?.remainingAmount;
  const formattedRemaining =
    remainingAmount != null ? `${remainingAmount.toLocaleString()} MMK` : null;

  // Determine the most urgent accent for the card left border
  const worstDays =
    expiryItems.length > 0
      ? Math.min(...expiryItems.map((e) => e.daysLeft))
      : -1;
  const accent = getExpiryAccentColor(worstDays);

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md",
        isUnread ? "border-gray-200" : "border-gray-100",
      )}
    >
      {/* Colored left accent bar */}
      <div className="flex">
        <div
          className={cn(
            "w-1 shrink-0 rounded-l-2xl",
            isPaymentOnly ? "bg-orange-400" : accent.dot,
          )}
        />

        <div className="min-w-0 flex-1 px-4 py-4 sm:px-5">
          {/* Top row: avatar + name + unread badge + actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <CustomerAvatar name={customerName} avatar={customerAvatar} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {customerName}
                  </p>
                  {isUnread && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-blue-600 uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      New
                    </span>
                  )}
                </div>
                {/* Payment-only subtitle */}
                {isPaymentOnly && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-orange-600">
                    <Wallet className="h-3 w-3" />
                    Payment Overdue
                  </p>
                )}
                {/* Expiry subtitle */}
                {expiryItems.length > 0 && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {expiryItems.length}{" "}
                    {expiryItems.length === 1
                      ? "subscription item"
                      : "subscription items"}{" "}
                    expiring
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons — top right */}
            <div className="flex shrink-0 items-center gap-1.5">
              {isUnread && (
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500 transition hover:bg-gray-50 active:scale-95"
                  onClick={() => onMarkRead(relatedIds)}
                  title="Mark as read"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {t("notifications.markRead")}
                  </span>
                </button>
              )}
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 active:scale-95"
                onClick={() => onDelete(item)}
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Payment-only body */}
          {isPaymentOnly && payment && formattedRemaining && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
              <div className="flex items-center gap-2 text-orange-700">
                <Wallet className="h-4 w-4" />
                <span className="text-sm font-medium">Amount Remaining</span>
              </div>
              <span className="text-sm font-bold text-orange-800">
                {formattedRemaining}
              </span>
            </div>
          )}

          {/* Off-day banner */}
          {typeof offDayDaysAdded === "number" && offDayDaysAdded > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <Calendar className="h-3.5 w-3.5" />+{offDayDaysAdded} off-day
                {offDayDaysAdded > 1 ? "s" : ""} added
              </span>
              {offDayName && (
                <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[11px] text-emerald-600">
                  {offDayName}
                </span>
              )}
              {offDayAppliedAt && (
                <span className="text-[11px] text-emerald-500">
                  {new Date(offDayAppliedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {/* Expiry items grid */}
          {expiryItems.length > 0 && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {expiryItems.map((exp, idx) => {
                const a = getExpiryAccentColor(exp.daysLeft);
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-3 py-2.5",
                      a.border,
                      a.bg,
                    )}
                  >
                    <div className={cn("flex items-center gap-2", a.icon)}>
                      <TypeIcon type={exp.type} />
                      <span className="text-xs font-medium text-gray-700">
                        {typeLabel(exp.type, exp.targetName, t)}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "ml-2 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        getDaysBadgeVariant(exp.daysLeft),
                      )}
                    >
                      {getDaysSummary(exp.daysLeft, t)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Payment overdue row (when mixed with expiry) */}
          {expiryItems.length > 0 && payment && formattedRemaining && (
            <div className="mt-2 flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5">
              <div className="flex items-center gap-2 text-orange-600">
                <Wallet className="h-4 w-4" />
                <span className="text-xs font-semibold">Payment Overdue</span>
              </div>
              <span className="text-xs font-bold text-orange-800">
                {formattedRemaining} left
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  maintenance: "text-gray-600",
  utilities: "text-gray-600",
  equipment: "text-gray-600",
  salary: "text-gray-600",
  rent: "text-gray-600",
  other: "text-gray-600",
};

function getCategoryIcon(category: string) {
  const cls = "h-4 w-4";
  switch (category.toLowerCase()) {
    case "maintenance":
      return <Wrench className={cls} />;
    case "utilities":
      return <Zap className={cls} />;
    case "equipment":
      return <Dumbbell className={cls} />;
    case "salary":
      return <Banknote className={cls} />;
    case "rent":
      return <Home className={cls} />;
    default:
      return <AlertCircle className={cls} />;
  }
}

function PendingExpenseRow({
  expense,
  onApprove,
  onReject,
}: {
  expense: Expense;
  onApprove: (id: string) => void;
  onReject: (id: string, note: string) => void;
}) {
  const [showReject, setShowReject] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const submittedBy =
    typeof expense.submittedBy === "string"
      ? expense.submittedBy
      : (expense.submittedBy?.name ?? expense.submittedByName ?? "Unknown");

  const categoryColor =
    EXPENSE_CATEGORY_COLORS[expense.category] ?? EXPENSE_CATEGORY_COLORS.other;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-[#FCFCFC] shadow-sm transition-all hover:shadow">
      <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {/* Category Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500">
            {getCategoryIcon(expense.category)}
          </div>

          <div className="min-w-0 flex-1">
            {/* Title */}
            <p className="text-sm font-semibold text-gray-800">
              {expense.title}
            </p>

            {/* Category & Submitter */}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500 capitalize">
                {getCategoryIcon(expense.category)}
                {expense.category}
              </span>
              <span className="text-[11px] text-gray-400">
                by {submittedBy}
              </span>
            </div>

            {/* Amount */}
            <p className="mt-2 text-base font-bold text-gray-900">
              {Number(expense.amount).toLocaleString()} MMK
            </p>

            {/* Note */}
            {expense.note && (
              <p className="mt-1.5 text-xs text-gray-400 line-clamp-2">
                {expense.note}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {showReject ? (
          <div className="space-y-2">
            <textarea
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300 resize-none"
              rows={2}
              placeholder="Reason for rejection (optional)..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
                onClick={() => {
                  setShowReject(false);
                  setRejectNote("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 active:scale-[0.98]"
                onClick={() => {
                  onReject(expense._id, rejectNote);
                  setShowReject(false);
                  setRejectNote("");
                }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600 active:scale-[0.98]"
              onClick={() => onApprove(expense._id)}
            >
              ✓ Approve
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
              onClick={() => setShowReject(true)}
            >
              ✕ Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "all" | "payment" | "expiry" | "birthday" | "expenses"
  >("all");
  const [deleteTarget, setDeleteTarget] = useState<NotificationListItem | null>(
    null,
  );

  const { isOwner, selectedGymId, setSelectedGymId, branches } =
    useOwnerBranchFilter();
  const branchQuery = isOwner ? (selectedGymId ?? undefined) : undefined;

  const { data: countData } = useGetUnreadCountQuery(
    branchQuery ? { gymId: branchQuery } : undefined,
  );
  // Determine group param for API
  let groupParam: string | undefined = undefined;
  if (activeTab === "payment") groupParam = "payment";
  else if (activeTab === "expiry") groupParam = "expiry";
  else if (activeTab === "birthday") groupParam = "birthday";
  // 'all' and 'expenses' get all notifications or expenses

  const { data, isLoading } = useGetNotificationsQuery({
    page,
    limit: PAGE_SIZE,
    group: (activeTab === "expenses" || activeTab === "all"
      ? undefined
      : groupParam) as "all" | "payment" | "expiry" | undefined,
    gymId: branchQuery,
  });

  const [markRead] = useMarkReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  const [approveExpense] = useApproveExpenseMutation();
  const [rejectExpense] = useRejectExpenseMutation();

  const { data: pendingExpensesData, isLoading: expensesLoading } =
    useGetExpensesQuery(
      { gymId: branchQuery, status: "pending", page: 1, limit: 100 },
      { skip: !isOwner },
    );

  const pendingExpenses: Expense[] = pendingExpensesData?.data ?? [];

  const handleApproveExpense = async (id: string) => {
    await approveExpense({ id });
  };

  const handleRejectExpense = async (id: string, reviewNote: string) => {
    await rejectExpense({ id, reviewNote: reviewNote || undefined });
  };

  let notifications: GymNotification[] = Array.isArray(data?.data)
    ? data.data
    : [];
  // Only filter for birthday tab
  if (activeTab === "birthday") {
    notifications = notifications.filter(
      (n) => (n as any).type === "birthday_wish",
    );
  }
  // For 'all', show all notification types (no filter)
  // For 'expenses', handled separately below
  const listItems = buildNotificationListItems(notifications);
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const notificationUnreadCount = countData?.count ?? 0;
  const expenseUnreadCount = isOwner ? pendingExpenses.length : 0;
  const unreadCount = notificationUnreadCount + expenseUnreadCount;
  const paymentCount = activeTab === "payment" ? total : undefined;
  const expiryCount = activeTab === "expiry" ? total : undefined;
  // Always show the count of birthday notifications for the badge
  const birthdayCount =
    data?.data?.filter((n: any) => n.type === "birthday_wish")?.length || 0;

  const handleMarkRead = async (ids: string[]) => {
    await markRead(ids);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    // Delete the first notification from the expiry items or payment
    const firstNotification =
      deleteTarget.expiryItems[0]?.notification ?? deleteTarget.payment;
    if (!firstNotification?._id) return;

    await deleteNotification({
      id: firstNotification._id,
      gymId: branchQuery ?? null,
    });
    setDeleteTarget(null);
  };

  return (
    <div
      className="min-h-screen space-y-6 p-6 text-foreground"
      style={{ backgroundColor: "#FCFCFC" }}
    >
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Bell className="h-6 w-6" />
              {t("notifications.title")}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Review payment overdue reminders and subscription expiry alerts in
              one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {isOwner && branches.length > 0 && (
              <Select
                value={selectedGymId ?? "all"}
                onValueChange={(v) => {
                  setSelectedGymId(v === "all" ? null : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-48 rounded-full border border-gray-200 bg-white text-sm shadow-sm">
                  <SelectValue placeholder="All Gyms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gyms</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b._id} value={b._id!}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* All Tab */}
          <button
            type="button"
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              activeTab === "all"
                ? "border-gray-300 bg-gray-100 text-gray-800"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
            )}
            onClick={() => {
              setActiveTab("all");
              setPage(1);
            }}
          >
            All
          </button>
          {/* Payment Overdue Tab */}
          <button
            type="button"
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              activeTab === "payment"
                ? "border-gray-300 bg-gray-100 text-gray-800"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
            )}
            onClick={() => {
              setActiveTab("payment");
              setPage(1);
            }}
          >
            Payment Overdue{" "}
            {typeof paymentCount === "number" ? `(${paymentCount})` : ""}
          </button>
          {/* Subscription Ends Tab */}
          <button
            type="button"
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              activeTab === "expiry"
                ? "border-gray-300 bg-gray-100 text-gray-800"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
            )}
            onClick={() => {
              setActiveTab("expiry");
              setPage(1);
            }}
          >
            Subscription Ends{" "}
            {typeof expiryCount === "number" ? `(${expiryCount})` : ""}
          </button>
          {/* Birthday Tab */}
          <button
            type="button"
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              activeTab === "birthday"
                ? "border-gray-300 bg-gray-100 text-gray-800"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
            )}
            onClick={() => {
              setActiveTab("birthday");
              setPage(1);
            }}
          >
            Birthday{" "}
            {typeof birthdayCount === "number" ? `(${birthdayCount})` : ""}
          </button>
          {/* Expense Requests Tab (owner only) */}
          {isOwner && (
            <button
              type="button"
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                activeTab === "expenses"
                  ? "border-gray-300 bg-gray-100 text-gray-800"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
              )}
              onClick={() => {
                setActiveTab("expenses");
                setPage(1);
              }}
            >
              Expense Requests{" "}
              {pendingExpenses.length > 0 ? `(${pendingExpenses.length})` : ""}
            </button>
          )}
        </div>
      </div>

      {activeTab === "expenses" || activeTab === "all" ? (
        expensesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-[#FCFCFC] px-4 py-4 shadow-sm"
              >
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {pendingExpenses.length > 0 && (
              <div className="space-y-2 mb-6">
                {pendingExpenses.map((expense, index) => (
                  <AnimatedNotificationItem key={expense._id} index={index}>
                    <PendingExpenseRow
                      expense={expense}
                      onApprove={handleApproveExpense}
                      onReject={handleRejectExpense}
                    />
                  </AnimatedNotificationItem>
                ))}
              </div>
            )}
            {/* Show notifications list below expenses in 'all', or only notifications in 'expenses' if needed */}
            {activeTab === "all" &&
              (listItems.length === 0 ? (
                <div className="rounded-xl border border-gray-100 bg-[#FCFCFC] px-6 py-14 text-center shadow-sm">
                  <Bell className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-400">
                    No notifications right now.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {listItems.map((item, index) => (
                    <AnimatedNotificationItem key={item.key} index={index}>
                      <NotificationRow
                        item={item}
                        onMarkRead={handleMarkRead}
                        onDelete={setDeleteTarget}
                        t={t}
                      />
                    </AnimatedNotificationItem>
                  ))}
                </div>
              ))}
            {/* If expenses tab only, do not show notifications */}
          </>
        )
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-[#FCFCFC] px-4 py-4 shadow-sm"
            >
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      ) : listItems.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-[#FCFCFC] px-6 py-14 text-center shadow-sm">
          <Bell className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-400">
            {activeTab === "payment"
              ? "No payment overdue alerts right now."
              : "No subscription expiry alerts right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {listItems.map((item, index) => (
            <AnimatedNotificationItem key={item.key} index={index}>
              <NotificationRow
                item={item}
                onMarkRead={handleMarkRead}
                onDelete={setDeleteTarget}
                t={t}
              />
            </AnimatedNotificationItem>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <DataTablePagination
          meta={{ page, limit: PAGE_SIZE, total, totalPages }}
          onPageChange={setPage}
          onPageSizeChange={() => {}}
        />
      )}

      <ConfirmAlertDialog
        open={Boolean(deleteTarget)}
        title="Delete notification?"
        description={
          deleteTarget
            ? `This will remove the alert for ${deleteTarget.customerName}. This cannot be undone.`
            : "This will remove the selected alert. This cannot be undone."
        }
        confirmLabel="Delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
