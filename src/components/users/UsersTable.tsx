"use client";

import { type User, type Role } from "@/src/types/type";
import { UserRound } from "lucide-react";
import { type AuthUser } from "@/src/store/slices/authSlice";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { UserActionsDropdown } from "./UserActionsDropdown";
import { DataTablePagination } from "@/src/components/data-table/data-table-pagination";
import {
  lightBadgeClassName,
  lightSurfaceClassName,
  getRoleTextClass,
} from "./users.constants";

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  currentUser: AuthUser | null;
  meta: Meta;
  isMetaLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleActive: (user: User) => void;
  onViewMeasurements: (userId: string) => void;
  onViewHistory: (user: User) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function UsersTable({
  users,
  isLoading,
  currentUser,
  meta,
  isMetaLoading,
  onEdit,
  onDelete,
  onToggleActive,
  onViewMeasurements,
  onViewHistory,
  onPageChange,
  onPageSizeChange,
}: UsersTableProps) {
  return (
    <div className={`overflow-hidden rounded-2xl ${lightSurfaceClassName}`}>
      <Table containerClassName="border border-zinc-200 bg-white shadow-none">
        <TableHeader className="bg-white [&_tr]:border-zinc-200">
          <TableRow className="border-zinc-200 hover:bg-zinc-50/40">
            <TableHead className="font-semibold text-muted-foreground">
              User
            </TableHead>
            <TableHead className="font-semibold text-muted-foreground">
              Phone
            </TableHead>
            <TableHead className="font-semibold text-muted-foreground">
              Role
            </TableHead>
            <TableHead className="font-semibold text-muted-foreground">
              Nickname
            </TableHead>
            <TableHead className="font-semibold text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="text-center font-semibold text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow
              key="loading"
              className="border-border hover:bg-background"
            >
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                Loading users...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow key="empty" className="border-border hover:bg-background">
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user._id}
                className="border-zinc-200 hover:bg-zinc-50/40"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-muted-foreground">
                        <UserRound className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium leading-none text-foreground">
                        {user.name}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.phone || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${lightBadgeClassName} ${getRoleTextClass(user.role as Role)}`}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.nickname || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${lightBadgeClassName} ${user.isActive ? "text-zinc-700" : "text-zinc-500"}`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    {currentUser && (
                      <UserActionsDropdown
                        user={user}
                        currentUserRole={currentUser.role}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onViewMeasurements={onViewMeasurements}
                        onToggleActive={onToggleActive}
                        onViewHistory={onViewHistory}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="border-t border-zinc-200 bg-white p-4">
        <DataTablePagination
          meta={meta}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          isLoading={isMetaLoading}
          tone="light"
        />
      </div>
    </div>
  );
}
