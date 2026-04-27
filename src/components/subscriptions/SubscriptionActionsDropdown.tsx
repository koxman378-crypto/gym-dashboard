"use client";

import { useState } from "react";
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
import { DeleteAlertDialog } from "@/src/components/ui/delete-alert-dialog";

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
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isCancelled =
    subscription.status === "cancelled" || subscription.status === "expired";

  const customerName =
    typeof subscription.customer === "object"
      ? subscription.customer?.name
      : "this customer";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 rounded-md border border-gray-200 shadow-md bg-background p-0 text-slate-700 hover:bg-muted hover:text-foreground"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {onViewDetails && (
            <DropdownMenuItem
              onClick={() => onViewDetails(subscription)}
              className="text-foreground focus:bg-muted hover:bg-gray-100 cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          )}
          {onUpdate && !isCancelled && (
            <DropdownMenuItem
              onClick={() => onUpdate(subscription)}
              className="text-foreground focus:bg-muted hover:bg-gray-100 cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Subscription
            </DropdownMenuItem>
          )}
          {(onViewDetails || onUpdate) && <DropdownMenuSeparator />}
          {onCancel && !isCancelled && (
            <DropdownMenuItem
              onClick={() => onCancel(subscription)}
              className="text-yellow-700 focus:bg-yellow-50 hover:bg-yellow-100 focus:text-yellow-700"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </DropdownMenuItem>
          )}
          {onCancel && !isCancelled && <DropdownMenuSeparator />}
          {onDelete && (
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-red-600 focus:bg-red-50 hover:bg-red-100 focus:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Subscription"
        description={`Permanently delete subscription for ${customerName}? This action cannot be undone.`}
        onConfirm={() => {
          if (onDelete) onDelete(subscription);
          setDeleteOpen(false);
        }}
      />
    </>
  );
}
