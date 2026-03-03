"use client";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Activity,
  UserCheck,
  UserX,
  History,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { Role, type User, canDeleteRole } from "@/src/types/type";

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
  // Determine permissions
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

  // If no actions available, don't show the dropdown
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuSeparator />

        {canEdit && onEdit && (
          <DropdownMenuItem onClick={() => onEdit(user)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
        )}

        {canViewBodyMeasurements && onViewMeasurements && (
          <DropdownMenuItem onClick={() => onViewMeasurements(user._id)}>
            <Activity className="mr-2 h-4 w-4" />
            Body Measurements
          </DropdownMenuItem>
        )}

        {canViewHistory && onViewHistory && (
          <DropdownMenuItem onClick={() => onViewHistory(user)}>
            <History className="mr-2 h-4 w-4" />
            Subscription History
          </DropdownMenuItem>
        )}

        {canToggleActive && onToggleActive && (
          <DropdownMenuItem onClick={() => onToggleActive(user)}>
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
              onClick={() => onDelete(user._id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
