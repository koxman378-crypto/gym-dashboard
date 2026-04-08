"use client";

import { Subscription } from "@/src/types/extended-types";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";

interface SubscriptionActionsDropdownProps {
  subscription: Subscription;
  onCancel?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  onViewDetails?: (subscription: Subscription) => void;
  onUpdate?: (subscription: Subscription) => void;
}

export function SubscriptionActionsDropdown({
  subscription,
  onCancel,
  onDelete,
  onViewDetails,
  onUpdate,
}: SubscriptionActionsDropdownProps) {
  const isCancelled =
    subscription.status === "cancelled" || subscription.status === "expired";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 rounded-md border border-black/10 bg-white p-0 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-black/15 bg-white text-slate-900 shadow-xl ring-black/10"
      >
        {onViewDetails && (
          <DropdownMenuItem
            onClick={() => onViewDetails(subscription)}
            className="text-slate-900 focus:bg-slate-100 hover:bg-slate-100"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
        {onUpdate && !isCancelled && (
          <DropdownMenuItem
            onClick={() => onUpdate(subscription)}
            className="text-slate-900 focus:bg-slate-100 hover:bg-slate-100"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Subscription
          </DropdownMenuItem>
        )}
        {(onViewDetails || onUpdate) && <DropdownMenuSeparator />}
        {onCancel && !isCancelled && (
          <DropdownMenuItem
            onClick={() => onCancel(subscription)}
            className="text-yellow-700 focus:bg-yellow-50 hover:bg-yellow-50 focus:text-yellow-700"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel Subscription
          </DropdownMenuItem>
        )}
        {onCancel && !isCancelled && <DropdownMenuSeparator />}
        {onDelete && (
          <DropdownMenuItem
            onClick={() => onDelete(subscription)}
            className="text-red-600 focus:bg-red-50 hover:bg-red-50 focus:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Subscription
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
