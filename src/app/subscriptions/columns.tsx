"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { ComponentProps } from "react";
import { Subscription } from "@/src/types/extended-types";
import { Badge } from "@/src/components/ui/badge";
import { SubscriptionActionsDropdown } from "@/src/components/subscriptions/SubscriptionActionsDropdown";
import {
  Calendar,
  User,
  DollarSign,
  Hash,
  CreditCard,
  Activity,
  UserCheck,
  Clock,
  Image,
} from "lucide-react";
import { FaUserCircle } from "react-icons/fa";

// Simple date formatter
const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>;

interface ColumnsProps {
  onCancel?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  onViewDetails?: (subscription: Subscription) => void;
  onUpdate?: (subscription: Subscription) => void;
  showDaysLeft?: boolean;
}

export const createSubscriptionColumns = ({
  onCancel,
  onDelete,
  onViewDetails,
  onUpdate,
  showDaysLeft,
}: ColumnsProps = {}): ColumnDef<Subscription>[] => [
  {
    accessorKey: "_id",
    header: () => (
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-muted-foreground" />
        ID
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="font-mono text-xs">
          {row.original._id.slice(-8).toUpperCase()}
        </div>
      );
    },
  },
  {
    accessorKey: "customer",
    header: () => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        Customer
      </div>
    ),
    cell: ({ row }) => {
      const customer = row.original.customer;
      const customerData = typeof customer === "object" ? customer : null;
      return (
        <div className="flex items-center gap-3 min-w-55">
          {customerData?.avatar ? (
            <img
              src={customerData.avatar}
              alt={customerData.name}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="h-10 w-10 text-zinc-400" />
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold leading-none text-foreground">
              {customerData?.name || "Unknown"}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {customerData?.email || "-"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "trainer",
    header: () => (
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-muted-foreground" />
        Trainer
      </div>
    ),
    cell: ({ row }) => {
      const trainer = row.original.trainer;
      if (!trainer) {
        return (
          <span className="text-sm text-muted-foreground">
            No Trainer Include
          </span>
        );
      }
      return (
        <div className="flex items-center gap-3 min-w-60">
          {trainer.trainerAvatar ? (
            <img
              src={trainer.trainerAvatar}
              alt={trainer.trainerName}
              className="h-9 w-9 border-5 shrink-0 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="h-10 text-zinc-400 w-10" />
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold leading-none text-foreground">
              {trainer.trainerName || "Unknown"}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {trainer.trainerEmail || "-"}
            </p>
            <p className="mt-1 text-xs font-semibold text-zinc-600">
              {typeof trainer.finalPrice === "number"
                ? `${trainer.finalPrice.toLocaleString()} MMK/${trainer.durationUnit}`
                : "-"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "grandTotal",
    header: () => (
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        Total Amount
      </div>
    ),
    cell: ({ row }) => {
      const sub = row.original;
      return (
        <div>
          <div className="font-bold text-emerald-700">
            {sub.grandTotal.toLocaleString()} MMK
          </div>
          <div className="text-xs text-muted-foreground">
            {sub.trainer && <span className="text-zinc-500">+Trainer</span>}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: () => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        Start Date
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("startDate") as string | Date;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatDate(date)}
        </div>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: () => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        End Date
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("endDate") as string | Date;
      const today = new Date();
      const endDate = new Date(date);
      const daysLeft = Math.ceil(
        (endDate.getTime() - today.getTime()) / 86400000,
      );
      const isExpired = daysLeft < 0;
      const isSoon = daysLeft >= 0 && daysLeft <= 7;
      const color = isExpired
        ? "text-red-600"
        : isSoon
          ? "text-amber-600"
          : "text-emerald-600";
      return (
        <div className={`flex items-center gap-2 font-medium ${color}`}>
          <Calendar className="h-4 w-4" />
          {formatDate(date)}
          {isExpired && (
            <span className="text-xs font-semibold">(Expired)</span>
          )}
          {isSoon && !isExpired && (
            <span className="text-xs font-semibold">({daysLeft}d)</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: () => (
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        Payment
      </div>
    ),
    cell: ({ row }) => {
      const paymentStatus = row.getValue("paymentStatus") as string;
      const hasProofImage = row.original.proofImage;
      const variants: Record<string, any> = {
        paid: "success",
        unpaid: "destructive",
        partial: "warning",
        refunded: "inactive",
      };
      return (
        <div className="flex items-center gap-2">
          <Badge variant={variants[paymentStatus] || "secondary"}>
            <DollarSign className="h-3 w-3 mr-1" />
            {paymentStatus.toUpperCase()}
          </Badge>
          {hasProofImage && (
            <span title="Has proof image">
              <Image className="h-4 w-4 text-emerald-600" />
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        Status
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const colorMap: Record<string, string> = {
        active: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        expired: "bg-red-100 text-red-700 border border-red-200",
        cancelled:
          "bg-zinc-100 text-zinc-500 border border-zinc-200 line-through",
        pending: "bg-amber-100 text-amber-700 border border-amber-200",
      };
      const cls =
        colorMap[status] ?? "bg-zinc-100 text-zinc-600 border border-zinc-200";
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${cls}`}
        >
          {status.toUpperCase()}
        </span>
      );
    },
  },
  ...(showDaysLeft
    ? [
        {
          id: "gymFeeEndsIn",
          header: () => (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Days Left
            </div>
          ),
          cell: ({ row }: { row: { original: Subscription } }) => {
            const gymFee = row.original.gymFee;
            if (!gymFee?.endDate)
              return (
                <span className="text-xs text-muted-foreground">
                  No gym fee
                </span>
              );
            const today = new Date();
            const daysLeft = Math.ceil(
              (new Date(gymFee.endDate).getTime() - today.getTime()) / 86400000,
            );
            if (daysLeft <= 0)
              return (
                <Badge variant="destructive" className="tabular-nums">
                  Expired
                </Badge>
              );
            const color =
              daysLeft <= 7
                ? "destructive"
                : daysLeft <= 15
                  ? "warning"
                  : "active";
            return (
              <Badge variant={color as any} className="tabular-nums">
                {daysLeft}d left
              </Badge>
            );
          },
        } as ColumnDef<Subscription>,
      ]
    : []),
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const subscription = row.original;
      return (
        <SubscriptionActionsDropdown
          subscription={subscription}
          onViewDetails={onViewDetails}
          onUpdate={onUpdate}
          onCancel={onCancel}
          onDelete={onDelete}
        />
      );
    },
  },
];
