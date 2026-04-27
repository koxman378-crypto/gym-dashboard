"use client";

import { useState } from "react";
import {
  Search,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useGetManageableUsersQuery } from "@/src/store/services/usersApi";
import { useAppSelector } from "@/src/store/hooks";
import { useLanguage } from "@/src/components/language/LanguageContext";
import { UserAttendanceCalendar } from "@/src/components/attendance/UserAttendanceCalendar";
import { Role, type User } from "@/src/types/type";

const PAGE_LIMIT = 12;

export default function AttendanceHistoryPage() {
  const { t } = useLanguage();
  const {
    isAuthenticated,
    accessToken,
    user: currentUser,
  } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout((window as any).__attSearchTimer);
    (window as any).__attSearchTimer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 350);
  };

  // Paginated user list — only CUSTOMER role for simplicity; owner can remove role filter if needed
  const { data: usersData, isFetching: loadingUsers } =
    useGetManageableUsersQuery(
      {
        page,
        limit: PAGE_LIMIT,
        name: debouncedSearch || undefined,
        role: Role.CUSTOMER,
      },
      { skip: !isAuthenticated || !accessToken },
    );

  const users = usersData?.data ?? [];
  const totalPages = usersData?.totalPages ?? 1;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {t("attendanceHistory.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("attendanceHistory.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* LEFT PANEL — user list */}
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("attendanceHistory.searchMembers")}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* User cards */}
          <div className="flex flex-col gap-2 min-h-75">
            {loadingUsers ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg bg-muted animate-pulse"
                />
              ))
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {t("attendanceHistory.noMembers")}
              </p>
            ) : (
              users.map((u) => (
                <button
                  key={u._id}
                  onClick={() =>
                    setSelectedUser(selectedUser?._id === u._id ? null : u)
                  }
                  className={[
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                    selectedUser?._id === u._id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border bg-background hover:bg-accent",
                  ].join(" ")}
                >
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="h-9 w-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {u.nickname || u.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="h-3 w-3" />
                {t("attendance.prev")}
              </button>
              <span className="text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                {t("attendance.next")}
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — calendar */}
        <div className="rounded-xl border border-border bg-background p-5">
          {selectedUser ? (
            <>
              {/* Selected user header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {selectedUser.nickname || selectedUser.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedUser.email}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* The calendar */}
              <UserAttendanceCalendar userId={selectedUser._id} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <UserIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t("attendanceHistory.selectUser")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
