"use client";

import { type User, type Role } from "@/src/types/type";
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
import { lightSurfaceClassName, getRoleTextClass } from "./users.constants";

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
      <Table containerClassName="border-black/15 bg-white shadow-none">
        <TableHeader className="bg-slate-50 [&_tr]:border-black/10">
          <TableRow className="border-black/10 hover:bg-slate-50">
            <TableHead className="text-slate-500">User</TableHead>
            <TableHead className="text-slate-500">Phone</TableHead>
            <TableHead className="text-slate-500">Role</TableHead>
            <TableHead className="text-slate-500">Nickname</TableHead>
            <TableHead className="text-slate-500">Status</TableHead>
            <TableHead className="text-center text-slate-500">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow key="loading" className="border-black/10 hover:bg-white">
              <TableCell colSpan={6} className="text-center text-slate-500">
                Loading users...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow key="empty" className="border-black/10 hover:bg-white">
              <TableCell colSpan={6} className="text-center text-slate-500">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user._id}
                className="border-black/10 hover:bg-slate-50"
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
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-slate-100 text-sm font-semibold uppercase select-none text-slate-900">
                        {user.name.trim().charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium leading-none text-slate-900">
                        {user.name}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.phone || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`bg-gray-100 border rounded-lg border-gray-200 shadow-none ${getRoleTextClass(user.role as Role)}`}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.nickname || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`bg-gray-100 border rounded-lg border-gray-200 shadow-none ${user.isActive ? "text-emerald-600" : "text-amber-600"}`}
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
      <div className="border-t border-black/10 bg-white p-4">
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
