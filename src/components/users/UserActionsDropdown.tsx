"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Activity,
  UserCheck,
  UserX,
  CalendarDays,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { Role, type User, canDeleteRole } from "@/src/types/type";
import { DeleteAlertDialog } from "@/src/components/ui/delete-alert-dialog";

interface UserActionsDropdownProps {
  user: User;
  currentUserRole: Role;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  onViewMeasurements?: (userId: string) => void;
  onToggleActive?: (user: User) => void;
  onViewHistory?: (user: User) => void;
}

export function UserActionsDropdown({
  user,
  currentUserRole,
  onEdit,
  onDelete,
  onViewMeasurements,
  onToggleActive,
  onViewHistory,
}: UserActionsDropdownProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canDelete =
    user.role !== Role.OWNER && canDeleteRole(currentUserRole, user.role);
  const canEdit =
    currentUserRole === Role.OWNER ||
    currentUserRole === Role.CASHIER ||
    (currentUserRole === Role.TRAINER && user.role === Role.CUSTOMER);
  const canViewBodyMeasurements =
    user.role === Role.CUSTOMER &&
    (currentUserRole === Role.OWNER ||
      currentUserRole === Role.TRAINER ||
      currentUserRole === Role.CASHIER);
  const canToggleActive =
    currentUserRole === Role.OWNER ||
    currentUserRole === Role.CASHIER ||
    (currentUserRole === Role.TRAINER && user.role === Role.CUSTOMER);
  const canViewHistory =
    user.role === Role.CUSTOMER &&
    (currentUserRole === Role.OWNER ||
      currentUserRole === Role.CASHIER ||
      currentUserRole === Role.TRAINER);

  if (
    !canEdit &&
    !canDelete &&
    !canViewBodyMeasurements &&
    !canToggleActive &&
    !canViewHistory
  ) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 rounded-md border-gray-200 bg-white p-0 shadow-sm"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-gray-200 bg-white text-foreground shadow-xl ring-0"
        >
          {canEdit && onEdit && (
            <DropdownMenuItem
              onClick={() => onEdit(user)}
              className="text-foreground focus:bg-muted hover:bg-gray-100 cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
          )}

          {canViewBodyMeasurements && onViewMeasurements && (
            <DropdownMenuItem
              onClick={() => onViewMeasurements(user._id)}
              className="text-foreground focus:bg-muted hover:bg-gray-100 cursor-pointer"
            >
              <Activity className="mr-2 h-4 w-4" />
              Body Measurements
            </DropdownMenuItem>
          )}

          {canViewHistory && onViewHistory && (
            <DropdownMenuItem
              onClick={() => onViewHistory(user)}
              className="text-foreground focus:bg-sky-50 hover:bg-sky-50 cursor-pointer"
            >
              <CalendarDays className="mr-2 h-4 w-4 text-sky-600" />
              Attendance History
            </DropdownMenuItem>
          )}

          {canToggleActive && onToggleActive && (
            <DropdownMenuItem
              onClick={() => onToggleActive(user)}
              className="text-foreground focus:bg-muted hover:bg-gray-100 cursor-pointer"
            >
              {user.isActive ? (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Deactivate User
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activate User
                </>
              )}
            </DropdownMenuItem>
          )}

          {canDelete && onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-red-600 focus:bg-red-50 cursor-pointer hover:bg-red-50 focus:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete User"
        description={`Are you sure you want to permanently delete "${user.name}"? This action cannot be undone.`}
        onConfirm={() => {
          if (onDelete) onDelete(user._id);
          setDeleteOpen(false);
        }}
      />
    </>
  );
}
