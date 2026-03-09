"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Subscription } from "@/src/types/extended-types";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Calendar,
  X,
  User,
  DollarSign,
  MoreHorizontal,
  Trash2,
  Hash,
  CreditCard,
  Activity,
  Eye,
  Package,
  Pencil,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import Link from "next/link";

// Simple date formatter
const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

interface ColumnsProps {
  onCancel?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  onViewDetails?: (subscription: Subscription) => void;
  onUpdate?: (subscription: Subscription) => void;
}

export const createSubscriptionColumns = ({
  onCancel,
  onDelete,
  onViewDetails,
  onUpdate,
}: ColumnsProps = {}): ColumnDef<Subscription>[] => [
  {
    accessorKey: "_id",
    header: () => (
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-slate-500 dark:text-slate-400" />
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
        <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        Customer
      </div>
    ),
    cell: ({ row }) => {
      const customer = row.original.customer;
      const customerData = typeof customer === "object" ? customer : null;
      const customerId = typeof customer === "object" ? customer._id : customer;
      return (
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="font-medium">{customerData?.name || "Unknown"}</div>
            <div className="text-sm text-muted-foreground">
              {customerData?.email || ""}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "trainer",
    header: () => (
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        Trainer
      </div>
    ),
    cell: ({ row }) => {
      const trainer = row.original.trainer;
      if (!trainer) {
        return (
          <span className="text-sm text-muted-foreground">No Trainer</span>
        );
      }
      return (
        <div>
          <div className="font-medium text-sm">
            {trainer.trainerName || "Unknown"}
          </div>
          {typeof trainer.finalPrice === "number" && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {trainer.finalPrice.toLocaleString()} MMK/{trainer.durationUnit}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "subscription",
    header: () => (
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        Subscription Details
      </div>
    ),
    cell: ({ row }) => {
      const sub = row.original;
      const gymPrice = sub.gymPriceGroup;
      const servicesCount =
        sub.otherServiceGroups?.reduce(
          (acc, group) => acc + (group.selectedServices?.length || 0),
          0,
        ) || 0;

      return (
        <div>
          <div className="font-medium">
            {gymPrice ? gymPrice.groupName : "No Gym Package"}
          </div>
          <div className="text-xs text-muted-foreground">
            {gymPrice && (
              <span>
                {gymPrice.selectedPrice.duration}{" "}
                {gymPrice.selectedPrice.durationUnit}
              </span>
            )}
            {servicesCount > 0 && (
              <span className="ml-2">+ {servicesCount} service(s)</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "grandTotal",
    header: () => (
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        Total Amount
      </div>
    ),
    cell: ({ row }) => {
      const sub = row.original;
      return (
        <div>
          <div className="font-semibold">
            {sub.grandTotal.toLocaleString()} MMK
          </div>
          <div className="text-xs text-muted-foreground">
            {sub.trainer && <span className="text-blue-600">+Trainer</span>}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: () => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
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
        <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        End Date
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("endDate") as string | Date;
      const isExpired = new Date(date) < new Date();
      return (
        <div
          className={`flex items-center gap-2 ${isExpired ? "text-red-600" : ""}`}
        >
          <Calendar className="h-4 w-4" />
          {formatDate(date)}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: () => (
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        Payment
      </div>
    ),
    cell: ({ row }) => {
      const paymentStatus = row.getValue("paymentStatus") as string;
      const variants: Record<string, any> = {
        paid: "success",
        unpaid: "destructive",
        partial: "warning",
        refunded: "inactive",
      };
      return (
        <Badge variant={variants[paymentStatus] || "secondary"}>
          <DollarSign className="h-3 w-3 mr-1" />
          {paymentStatus.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        Status
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<string, any> = {
        active: "active",
        expired: "inactive",
        cancelled: "destructive",
        pending: "warning",
      };
      return (
        <Badge variant={variants[status] || "secondary"}>
          {status.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const subscription = row.original;
      const isCancelled =
        subscription.status === "cancelled" ||
        subscription.status === "expired";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onViewDetails && (
              <DropdownMenuItem onClick={() => onViewDetails(subscription)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            {onUpdate && !isCancelled && (
              <DropdownMenuItem onClick={() => onUpdate(subscription)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Subscription
              </DropdownMenuItem>
            )}
            {(onViewDetails || onUpdate) && <DropdownMenuSeparator />}
            {onCancel && !isCancelled && (
              <DropdownMenuItem
                onClick={() => onCancel(subscription)}
                className="text-yellow-600 focus:text-yellow-600"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Subscription
              </DropdownMenuItem>
            )}
            {onCancel && !isCancelled && <DropdownMenuSeparator />}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(subscription)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Subscription
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
