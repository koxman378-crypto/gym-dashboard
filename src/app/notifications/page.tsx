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
  useGetExpensePendingCountQuery,
  useApproveExpenseMutation,
  useRejectExpenseMutation,
  type Expense,
  type ExpenseCategory,
  type ExpenseStatus,
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

const SUBSCRIPTION_EXPIRY_TYPES = new Set([
  "gym_fee_end",
  "trainer_end",
  "service_end",
]);

function getExpiryRowDisplay(
  exp: {
    type: NotificationType | string;
    targetName: string | null;
    daysLeft: number;
    notification: GymNotification;
  },
  customerName: string,
  t: (k: string) => string,
): { label: string; name: string; showDaysLeft: boolean; daysSummary: string } {
  const rawType = String(exp.type);
  const showDaysLeft = SUBSCRIPTION_EXPIRY_TYPES.has(rawType);
  let label = "Item";
  let name = exp.targetName ?? "—";

  if (rawType === "gym_fee_end") {
    label = t("notifications.labelGymPackage");
    name =
      exp.notification.gymFeeName ||
      exp.notification.targetName ||
      exp.targetName ||
      "—";
  } else if (rawType === "trainer_end") {
    label = t("notifications.typeTrainer");
    name =
      exp.notification.trainerName ||
      exp.notification.targetName ||
      exp.targetName ||
      "—";
  } else if (rawType === "service_end") {
    label = t("notifications.labelServices");
    name = exp.targetName ?? "—";
  } else if (rawType === "birthday_wish" || rawType === "birthday_reminder") {
    label = "Birthday";
    name = exp.targetName ?? customerName;
  } else if (rawType.includes("expense")) {
    label = "Expenses";
  } else if (rawType.includes("payment")) {
    label = "Payment";
  }

  return {
    label,
    name,
    showDaysLeft,
    daysSummary: getDaysSummary(exp.daysLeft, t),
  };
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

  if (typeof notification.gymFeeDaysLeft === "number") {
    items.push({
      notification,
      type: "gym_fee_end",
      targetName: notification.gymFeeName ?? "Gym Fee",
      daysLeft: notification.gymFeeDaysLeft,
    });
  }

  if (typeof notification.trainerDaysLeft === "number") {
    items.push({
      notification,
      type: "trainer_end",
      targetName: notification.trainerName ?? "Trainer",
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

  if (items.length === 0 && notification.type !== "subscription_end") {
    items.push({
      notification,
      type: notification.type,
      targetName: notification.targetName,
      daysLeft: notification.daysLeft,
    });
  }

  return items;
}

const EXPENSE_NOTIFICATION_TYPES = new Set([
  "expense_submitted",
  "expense_approved",
  "expense_rejected",
]);

function isExpenseNotificationType(type: string) {
  return EXPENSE_NOTIFICATION_TYPES.has(type);
}

function pickLatestCreatedAt(
  notifications: Array<{ createdAt?: string }>,
): string | undefined {
  let latestMs: number | null = null;
  let latestValue: string | undefined;

  for (const notification of notifications) {
    if (!notification.createdAt) continue;
    const ms = new Date(notification.createdAt).getTime();
    if (Number.isNaN(ms)) continue;
    if (latestMs === null || ms > latestMs) {
      latestMs = ms;
      latestValue = notification.createdAt;
    }
  }

  return latestValue;
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
    if (isExpenseNotificationType(String(notification.type))) {
      continue;
    }

    const subId = notification.subscriptionId || notification._id;
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
        createdAt: group.payment.createdAt,
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
        createdAt: pickLatestCreatedAt([
          ...group.expiry,
          ...(group.payment ? [group.payment] : []),
        ]),
      });
    }
  }

  return items;
}

const BIRTHDAY_TYPES = new Set(["birthday_wish", "birthday_reminder"]);

function itemHasBirthday(item: NotificationListItem): boolean {
  return item.expiryItems.some((exp) => BIRTHDAY_TYPES.has(String(exp.type)));
}

function itemHasSubscriptionExpiry(item: NotificationListItem): boolean {
  return item.expiryItems.some(
    (exp) =>
      !BIRTHDAY_TYPES.has(String(exp.type)) &&
      !isExpenseNotificationType(String(exp.type)),
  );
}

function itemHasPayment(item: NotificationListItem): boolean {
  return Boolean(item.payment);
}

function splitListItemsForAllTab(items: NotificationListItem[]) {
  const payment: NotificationListItem[] = [];
  const subscription: NotificationListItem[] = [];
  const birthday: NotificationListItem[] = [];

  for (const item of items) {
    if (itemHasPayment(item)) payment.push(item);
    if (itemHasSubscriptionExpiry(item)) subscription.push(item);
    if (itemHasBirthday(item)) birthday.push(item);
  }

  return { payment, subscription, birthday };
}

type ExpenseStatusFilter = "all" | ExpenseStatus;

const EXPENSE_STATUS_FILTERS: { value: ExpenseStatusFilter; label: string }[] =
  [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

function NotificationListSection({
  title,
  items,
  onMarkRead,
  onDelete,
  t,
  startIndex = 0,
}: {
  title: string;
  items: NotificationListItem[];
  onMarkRead: (ids: string[]) => void;
  onDelete: (item: NotificationListItem) => void;
  t: (k: string) => string;
  startIndex?: number;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      {items.map((item, index) => (
        <AnimatedNotificationItem key={item.key} index={startIndex + index}>
          <NotificationRow
            item={item}
            onMarkRead={onMarkRead}
            onDelete={onDelete}
            t={t}
          />
        </AnimatedNotificationItem>
      ))}
    </div>
  );
}

function ExpenseListSection({
  title,
  expenses,
  t,
  onApprove,
  onReject,
  startIndex = 0,
}: {
  title: string;
  expenses: Expense[];
  t: (path: string) => string;
  onApprove: (id: string) => void;
  onReject: (id: string, note: string) => void;
  startIndex?: number;
}) {
  if (expenses.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      {expenses.map((expense, index) => (
        <AnimatedNotificationItem key={expense._id} index={startIndex + index}>
          <ExpenseRow
            expense={expense}
            t={t}
            onApprove={onApprove}
            onReject={onReject}
          />
        </AnimatedNotificationItem>
      ))}
    </div>
  );
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
    createdAt,
  } = item;
  const isPaymentOnly = expiryItems.length === 0 && payment;
  const remainingAmount = payment?.remainingAmount;
  const formattedRemaining =
    remainingAmount != null ? `${remainingAmount.toLocaleString()} MMK` : null;

  const hasSubscriptionExpiry = expiryItems.some(
    (exp) => String(exp.type) === "subscription_end",
  );
  const rowLabel = isPaymentOnly
    ? "Payment overdue"
    : hasSubscriptionExpiry
      ? "Subscription items expiring"
      : expiryItems.some((exp) =>
            ["birthday_wish", "birthday_reminder"].includes(String(exp.type)),
          )
        ? "Birthday"
        : expiryItems.some((exp) => String(exp.type).includes("expense"))
          ? "Expenses"
          : "Notification";

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md",
        isUnread ? "border-gray-200" : "border-gray-100",
      )}
    >
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
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {rowLabel}
                </span>
                {createdAt ? (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="inline-flex items-center gap-1 text-gray-400">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {formatNotificationDate(createdAt)}
                    </span>
                  </>
                ) : null}
              </p>
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
          <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">Amount Remaining</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {formattedRemaining}
            </span>
          </div>
        )}

        {/* Off-day banner */}
        {typeof offDayDaysAdded === "number" && offDayDaysAdded > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-700">
              <Calendar className="h-3.5 w-3.5" />+{offDayDaysAdded} off-day
              {offDayDaysAdded > 1 ? "s" : ""} added
            </span>
            {offDayName && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600">
                {offDayName}
              </span>
            )}
            {offDayAppliedAt && (
              <span className="text-[11px] text-gray-400">
                {new Date(offDayAppliedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Subscription expiry rows: label + name ········· days left */}
        {(() => {
          const visibleExpiryItems = expiryItems.filter(
            (exp) => String(exp.type) !== "subscription_end",
          );
          if (visibleExpiryItems.length === 0) return null;
          return (
            <div className="mt-3 flex flex-col gap-1.5 rounded-xl border border-gray-100 bg-[#FAFAFA] p-3">
              {visibleExpiryItems.map((exp, idx) => {
                const row = getExpiryRowDisplay(exp, customerName, t);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2.5"
                  >
                    <p className="min-w-0 flex-1 truncate text-xs text-gray-900">
                      <span className="font-semibold text-gray-500">
                        {row.label}:
                      </span>{" "}
                      <span className="font-medium">{row.name}</span>
                    </p>
                    {row.showDaysLeft ? (
                      <span className="shrink-0 text-xs font-semibold whitespace-nowrap text-gray-600">
                        {row.daysSummary}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Payment overdue row (when mixed with expiry) */}
        {expiryItems.length > 0 && payment && formattedRemaining && (
          <div className="mt-2 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
            <div className="flex items-center gap-2 text-gray-700">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-semibold">Payment Overdue</span>
            </div>
            <span className="text-xs font-bold text-gray-900">
              {formattedRemaining} left
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const EXPENSE_CATEGORY_KEYS: Record<ExpenseCategory, string> = {
  maintenance: "expenses.cat_maintenance",
  utilities: "expenses.cat_utilities",
  equipment: "expenses.cat_equipment",
  salary: "expenses.cat_salary",
  rent: "expenses.cat_rent",
  other: "expenses.cat_other",
};

function formatExpenseMoney(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${Number(value).toLocaleString()} MMK`;
}

function formatNotificationDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const formatExpenseDate = formatNotificationDate;

function getExpenseCategoryLabel(
  category: ExpenseCategory,
  t: (path: string) => string,
) {
  return t(EXPENSE_CATEGORY_KEYS[category] ?? "expenses.cat_other");
}

function getExpenseStatusLabel(status: string, t: (path: string) => string) {
  if (status === "pending") return t("expenses.pending");
  if (status === "approved") return t("expenses.approved");
  if (status === "rejected") return t("expenses.rejected");
  return status;
}

function getExpenseStatusTone(status: string) {
  if (status === "approved") {
    return {
      chip: "bg-emerald-100 text-emerald-700 ring-emerald-200",
      dot: "bg-emerald-500",
    };
  }
  if (status === "rejected") {
    return {
      chip: "bg-rose-100 text-rose-700 ring-rose-200",
      dot: "bg-rose-500",
    };
  }
  return {
    chip: "bg-zinc-100 text-zinc-700 ring-zinc-200",
    dot: "bg-zinc-400",
  };
}

/** Matches expenses page card UI; includes approve/reject for notifications. */
function ExpenseRow({
  expense,
  t,
  onApprove,
  onReject,
}: {
  expense: Expense;
  t: (path: string) => string;
  onApprove: (id: string) => void;
  onReject: (id: string, note: string) => void;
}) {
  const [showReject, setShowReject] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const category = getExpenseCategoryLabel(expense.category, t);
  const status = getExpenseStatusLabel(expense.status, t);
  const tone = getExpenseStatusTone(expense.status);
  const submittedBy =
    typeof expense.submittedBy === "string"
      ? expense.submittedBy
      : (expense.submittedBy?.name ?? expense.submittedByName ?? "Unknown");
  const canReview = expense.status === "pending";

  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-gray-100 bg-white shadow-sm shadow-gray-100/70 transition-all hover:border-gray-200 hover:shadow-md">
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700">
                {category}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${tone.chip}`}
              >
                <span
                  className={`mr-1 inline-block h-2 w-2 rounded-full ${tone.dot}`}
                />
                {status}
              </span>
            </div>

            <h3 className="mt-3 truncate text-base font-bold text-gray-950">
              {expense.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
              <span>{submittedBy}</span>
              <span className="text-gray-300">•</span>
              <span>{formatExpenseDate(expense.createdAt)}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#f7f7f2] px-3 py-2 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
              {t("expenses.amount")}
            </p>
            <p className="mt-1 text-lg font-black text-gray-950">
              {formatExpenseMoney(expense.amount)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#f7f7f2] px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Proof files
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {expense.proofImages?.length ?? 0}
            </p>
          </div>
          <div className="rounded-2xl bg-[#f7f7f2] px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Submitted by
            </p>
            <p className="mt-1 truncate text-sm font-bold text-gray-900">
              {expense.submittedByName || submittedBy}
            </p>
          </div>
          <div className="rounded-2xl bg-[#f7f7f2] px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Updated
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {formatExpenseDate(expense.updatedAt)}
            </p>
          </div>
        </div>

        {expense.note ? (
          <div className="rounded-2xl border border-gray-100 bg-[#fcfcf9] p-3 text-sm leading-6 text-gray-600">
            {expense.note}
          </div>
        ) : null}

        {expense.category === "salary" && expense.salaryItems?.length ? (
          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-3 text-xs font-medium text-sky-700">
            Salary batch for {expense.salaryItems.length} staff member
            {expense.salaryItems.length > 1 ? "s" : ""}
          </div>
        ) : null}

        {canReview &&
          (showReject ? (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <textarea
                className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                rows={2}
                placeholder="Reason for rejection (optional)..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  onClick={() => {
                    setShowReject(false);
                    setRejectNote("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-2xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
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
            <div className="flex gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                className="flex-1 rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                onClick={() => onApprove(expense._id)}
              >
                Approve
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                onClick={() => setShowReject(true)}
              >
                Reject
              </button>
            </div>
          ))}
      </div>
    </article>
  );
}

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "all" | "payment" | "expiry" | "birthday" | "expenses"
  >("all");
  const [expenseStatusFilter, setExpenseStatusFilter] =
    useState<ExpenseStatusFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<NotificationListItem | null>(
    null,
  );

  const { isOwner, selectedGymId, setSelectedGymId, branches } =
    useOwnerBranchFilter();
  const branchQuery = isOwner ? (selectedGymId ?? undefined) : undefined;

  const showExpenses =
    isOwner && (activeTab === "all" || activeTab === "expenses");
  const showNotifications = activeTab !== "expenses";

  const notificationGroup: "payment" | "expiry" | undefined =
    activeTab === "payment"
      ? "payment"
      : activeTab === "expiry"
        ? "expiry"
        : undefined;

  const { data: countData } = useGetUnreadCountQuery(
    branchQuery ? { gymId: branchQuery } : undefined,
  );

  const notificationLimit = activeTab === "all" ? 100 : PAGE_SIZE;

  const { data, isLoading: notificationsLoading } = useGetNotificationsQuery(
    {
      page: activeTab === "all" ? 1 : page,
      limit: notificationLimit,
      group: notificationGroup,
      gymId: branchQuery,
    },
    { skip: !showNotifications },
  );

  const [markRead] = useMarkReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  const [approveExpense] = useApproveExpenseMutation();
  const [rejectExpense] = useRejectExpenseMutation();

  const { data: pendingCountData } = useGetExpensePendingCountQuery(
    branchQuery,
    { skip: !isOwner },
  );

  const expenseStatusQuery =
    activeTab === "all" || expenseStatusFilter === "all"
      ? undefined
      : expenseStatusFilter;

  const { data: expensesData, isLoading: expensesLoading } =
    useGetExpensesQuery(
      {
        gymId: branchQuery,
        status: expenseStatusQuery,
        page: activeTab === "expenses" ? page : 1,
        limit: activeTab === "expenses" ? PAGE_SIZE : 100,
      },
      { skip: !showExpenses },
    );

  const expenses: Expense[] = expensesData?.data ?? [];
  const expensesTotal = expensesData?.total ?? 0;
  const expensesTotalPages = expensesData?.totalPages ?? 1;

  const handleApproveExpense = async (id: string) => {
    await approveExpense({ id });
  };

  const handleRejectExpense = async (id: string, reviewNote: string) => {
    await rejectExpense({ id, reviewNote: reviewNote || undefined });
  };

  let notifications: GymNotification[] = Array.isArray(data?.data)
    ? data.data
    : [];
  if (activeTab === "birthday") {
    notifications = notifications.filter((n) =>
      ["birthday_wish", "birthday_reminder"].includes(String(n.type)),
    );
  }
  const listItems = buildNotificationListItems(notifications);
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const notificationUnreadCount = countData?.count ?? 0;
  const pendingExpenseCount = pendingCountData?.count ?? 0;
  const unreadCount = notificationUnreadCount + pendingExpenseCount;
  const paymentCount = activeTab === "payment" ? total : undefined;
  const expiryCount = activeTab === "expiry" ? total : undefined;
  const birthdayCount =
    activeTab === "birthday"
      ? notifications.length
      : (data?.data?.filter((n) =>
          ["birthday_wish", "birthday_reminder"].includes(String(n.type)),
        ).length ?? 0);

  const allTabSections =
    activeTab === "all" ? splitListItemsForAllTab(listItems) : null;

  const isContentLoading =
    (showNotifications && notificationsLoading) ||
    (showExpenses && expensesLoading);
  const hasExpenses = expenses.length > 0;
  const hasNotifications = listItems.length > 0;
  const hasAllTabContent =
    activeTab === "all" &&
    (hasExpenses ||
      Boolean(
        allTabSections &&
        (allTabSections.payment.length > 0 ||
          allTabSections.subscription.length > 0 ||
          allTabSections.birthday.length > 0),
      ));

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
              Subscriptions, payment overdue, birthdays, and expenses in one
              place.
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
                <SelectTrigger className="h-10 w-48 cursor-pointer rounded-full border border-gray-200 bg-[#FFFFFF] text-sm text-gray-800 shadow-sm transition-colors  focus:ring-black/5">
                  <SelectValue placeholder="All Gyms" />
                </SelectTrigger>
                <SelectContent className="border border-gray-200 bg-white shadow-lg">
                  <SelectItem
                    value="all"
                    className="cursor-pointer rounded-lg focus:bg-gray-100 data-[highlighted]:bg-gray-100"
                  >
                    All Gyms
                  </SelectItem>
                  {branches.map((b) => (
                    <SelectItem
                      key={b._id}
                      value={b._id!}
                      className="cursor-pointer rounded-lg focus:bg-gray-100 data-[highlighted]:bg-gray-100"
                    >
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
          {/* Expenses tab (owner only) */}
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
                setExpenseStatusFilter("all");
                setPage(1);
              }}
            >
              Expenses
              {pendingExpenseCount > 0
                ? ` (${pendingExpenseCount} pending)`
                : ""}
            </button>
          )}
        </div>

        {activeTab === "expenses" && isOwner && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {EXPENSE_STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                  expenseStatusFilter === value
                    ? "border-gray-300 bg-gray-100 text-gray-800"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
                )}
                onClick={() => {
                  setExpenseStatusFilter(value);
                  setPage(1);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isContentLoading ? (
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
      ) : activeTab === "all" ? (
        !hasAllTabContent ? (
          <div className="rounded-xl border border-gray-100 bg-[#FCFCFC] px-6 py-14 text-center shadow-sm">
            <Bell className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm font-medium text-gray-400">
              No notifications or expenses right now.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {showExpenses && (
              <ExpenseListSection
                title={t("nav.expenses")}
                expenses={expenses}
                t={t}
                onApprove={handleApproveExpense}
                onReject={handleRejectExpense}
                startIndex={0}
              />
            )}
            {allTabSections && (
              <>
                <NotificationListSection
                  title="Subscription Ends"
                  items={allTabSections.subscription}
                  onMarkRead={handleMarkRead}
                  onDelete={setDeleteTarget}
                  t={t}
                  startIndex={hasExpenses ? expenses.length : 0}
                />
                <NotificationListSection
                  title="Payment Overdue"
                  items={allTabSections.payment}
                  onMarkRead={handleMarkRead}
                  onDelete={setDeleteTarget}
                  t={t}
                  startIndex={
                    (hasExpenses ? expenses.length : 0) +
                    allTabSections.subscription.length
                  }
                />
                <NotificationListSection
                  title="Birthday"
                  items={allTabSections.birthday}
                  onMarkRead={handleMarkRead}
                  onDelete={setDeleteTarget}
                  t={t}
                  startIndex={
                    (hasExpenses ? expenses.length : 0) +
                    allTabSections.subscription.length +
                    allTabSections.payment.length
                  }
                />
              </>
            )}
          </div>
        )
      ) : !hasExpenses && !hasNotifications ? (
        <div className="rounded-xl border border-gray-100 bg-[#FCFCFC] px-6 py-14 text-center shadow-sm">
          <Bell className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-400">
            {activeTab === "expenses"
              ? expenseStatusFilter === "all"
                ? "No expenses yet."
                : `No ${expenseStatusFilter} expenses.`
              : activeTab === "payment"
                ? "No payment overdue alerts right now."
                : activeTab === "birthday"
                  ? "No birthday reminders right now."
                  : "No subscription expiry alerts right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {showExpenses && hasExpenses && (
            <div className="space-y-2">
              {expenses.map((expense, index) => (
                <AnimatedNotificationItem key={expense._id} index={index}>
                  <ExpenseRow
                    expense={expense}
                    t={t}
                    onApprove={handleApproveExpense}
                    onReject={handleRejectExpense}
                  />
                </AnimatedNotificationItem>
              ))}
            </div>
          )}

          {showNotifications && hasNotifications && (
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
        </div>
      )}

      {showNotifications && activeTab !== "all" && totalPages > 1 && (
        <DataTablePagination
          meta={{ page, limit: PAGE_SIZE, total, totalPages }}
          onPageChange={setPage}
          onPageSizeChange={() => {}}
        />
      )}

      {activeTab === "expenses" && expensesTotalPages > 1 && (
        <DataTablePagination
          meta={{
            page,
            limit: PAGE_SIZE,
            total: expensesTotal,
            totalPages: expensesTotalPages,
          }}
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
