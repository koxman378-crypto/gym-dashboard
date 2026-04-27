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
import { cn } from "@/src/lib/utils";
import { DataTablePagination } from "@/src/components/data-table/data-table-pagination";
import { useOwnerBranchFilter } from "@/src/components/layout/OwnerBranchFilterContext";
import { ConfirmAlertDialog } from "@/src/components/notifications/ConfirmAlertDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

type NotificationListItem = {
  key: string;
  primary: GymNotification;
  payment?: GymNotification;
  relatedIds: string[];
  isUnread: boolean;
};

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

function buildNotificationListItems(
  notifications: GymNotification[],
): NotificationListItem[] {
  const paymentBySubscription = new Map<string, GymNotification>();
  const hasNonPaymentBySubscription = new Map<string, boolean>();

  for (const notification of notifications) {
    if (notification.type === "payment_overdue") {
      paymentBySubscription.set(notification.subscriptionId, notification);
      continue;
    }

    hasNonPaymentBySubscription.set(notification.subscriptionId, true);
  }

  const items: NotificationListItem[] = [];
  const seenKeys = new Set<string>();

  for (const notification of notifications) {
    if (notification.type === "payment_overdue") {
      if (hasNonPaymentBySubscription.get(notification.subscriptionId)) {
        continue;
      }

      const paymentOnlyKey = `payment:${notification.subscriptionId}`;
      if (seenKeys.has(paymentOnlyKey)) {
        continue;
      }

      seenKeys.add(paymentOnlyKey);
      items.push({
        key: paymentOnlyKey,
        primary: notification,
        relatedIds: [notification._id],
        isUnread: !notification.isRead,
      });
      continue;
    }

    const payment = paymentBySubscription.get(notification.subscriptionId);
    const key = notification._id;

    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    items.push({
      key,
      primary: notification,
      payment,
      relatedIds: payment
        ? [notification._id, payment._id]
        : [notification._id],
      isUnread: !notification.isRead || Boolean(payment && !payment.isRead),
    });
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
  const { primary, payment, isUnread, relatedIds } = item;
  const isPaymentOverdue = primary.type === "payment_overdue";
  const showPaymentStatus = Boolean(payment && payment._id !== primary._id);
  const paymentDaysLeft = payment?.daysLeft ?? -1;
  const remainingAmount = payment?.remainingAmount ?? primary.remainingAmount;
  const formattedRemaining =
    remainingAmount != null ? `${remainingAmount.toLocaleString()} MMK` : null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-[#FCFCFC] shadow-sm transition-all hover:shadow">
      <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">

        {/* Unread indicator strip */}
        {isUnread && (
          <div className="-mx-4 -mt-4 mb-1 flex items-center gap-2 border-b border-gray-100 bg-white px-4 py-2 sm:-mx-5 sm:px-5">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Unread</span>
          </div>
        )}

        <div className="flex min-w-0 flex-1 items-start gap-3 text-left">
          <CustomerAvatar
            name={primary.customerName}
            avatar={primary.customerAvatar}
          />

          <div className="min-w-0 flex-1">
            {/* Customer name */}
            <p className="text-sm font-semibold text-gray-800">{primary.customerName}</p>

            {/* Type tag */}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500">
                <TypeIcon type={primary.type} />
                {typeLabel(primary.type, primary.targetName, t)}
              </span>

              {isPaymentOverdue && formattedRemaining && (
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500">
                  <Wallet className="h-3 w-3" />
                  Left: {formattedRemaining}
                </span>
              )}
            </div>

            {/* Days / payment info */}
            {isPaymentOverdue ? (
              <p className="mt-2 text-xs text-gray-400">
                Remaining: {formattedRemaining ?? "-"}
              </p>
            ) : (
              <>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                      getDaysBadgeVariant(primary.daysLeft),
                    )}
                  >
                    {getDaysSummary(primary.daysLeft, t)}
                  </span>
                  {showPaymentStatus && (
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                        getDaysBadgeVariant(paymentDaysLeft),
                      )}
                    >
                      {getDaysSummary(paymentDaysLeft, t)}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  {`Ends in ${getDaysSummary(primary.daysLeft, t)}`}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          {isUnread && (
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 active:scale-95"
              onClick={() => onMarkRead(relatedIds)}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t("notifications.markRead")}
            </button>
          )}
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-50 active:scale-95"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"payment" | "expiry">("payment");
  const [deleteTarget, setDeleteTarget] = useState<NotificationListItem | null>(
    null,
  );

  const { isOwner, selectedGymId, setSelectedGymId, branches } =
    useOwnerBranchFilter();
  const branchQuery = isOwner ? (selectedGymId ?? undefined) : undefined;

  const { data: countData } = useGetUnreadCountQuery(
    branchQuery ? { gymId: branchQuery } : undefined,
  );
  const { data, isLoading } = useGetNotificationsQuery({
    page,
    limit: PAGE_SIZE,
    group: activeTab,
    gymId: branchQuery,
  });

  const [markRead] = useMarkReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  const notifications: GymNotification[] = data?.data ?? [];
  const listItems = buildNotificationListItems(notifications);
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const unreadCount = countData?.count ?? 0;
  const paymentCount = activeTab === "payment" ? total : undefined;
  const expiryCount = activeTab === "expiry" ? total : undefined;

  const handleMarkRead = async (ids: string[]) => {
    await markRead(ids);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.primary._id ?? deleteTarget.primary._id;
    if (!id) return;

    await deleteNotification({
      id,
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
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-[#FCFCFC] px-4 py-4 shadow-sm">
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
            ? `This will remove the alert for ${deleteTarget.primary.customerName}. This cannot be undone.`
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
