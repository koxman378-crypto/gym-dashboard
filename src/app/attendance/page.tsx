"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Calendar, User as UserIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { DataTable } from "@/src/components/data-table/table-data";
import { createAttendanceColumns } from "./columns";
import {
  useCheckInMutation,
  useCheckOutMutation,
  useGetActiveAttendanceQuery,
  useGetAttendanceHistoryQuery,
  useGetMonthlyStatsQuery,
  useGetAllAttendanceHistoryQuery,
} from "@/src/store/services/attendanceApi";
import { useGetManageableUsersQuery } from "@/src/store/services/usersApi";
import { useAppSelector } from "@/src/store/hooks";
import { useAttendanceState } from "@/src/store/hooks/useAttendanceState";
import { AttendanceStatus } from "@/src/types/attendance";
import { AttendanceCheckCard } from "@/src/components/attendance/AttendanceCheckCard";
import { AttendanceMonthlyStats } from "@/src/components/attendance/AttendanceMonthlyStats";
import { DataTablePagination } from "@/src/components/data-table/data-table-pagination";
import { useLanguage } from "@/src/components/language/LanguageContext";
import { Search } from "lucide-react";

export default function AttendancePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    autoCloseAfter,
    selectedMonth,
    selectedYear,
    page,
    setAutoCloseAfter,
    setSelectedMonth,
    setSelectedYear,
    setPage,
  } = useAttendanceState();
  const [limit, setLimit] = useState<number>(10);

  const { isAuthenticated, user: currentUser } = useAppSelector(
    (state) => state.auth,
  );

  // User/date/name filter state
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");

  // Fetch manageable users for filter dropdown
  const { data: manageableUsersData } = useGetManageableUsersQuery(
    { page: 1, limit: 100 },
    { skip: !isAuthenticated },
  );
  const manageableUsers = manageableUsersData?.data ?? [];

  // OWNER/CASHIER: use global endpoint, others: use personal history
  const isGlobal =
    currentUser?.role === "owner" || currentUser?.role === "cashier";

  const { data: globalHistoryData, isLoading: isLoadingGlobalHistory } =
    useGetAllAttendanceHistoryQuery(
      {
        userId: selectedUserId || undefined,
        startDate: selectedDate || undefined,
        endDate: selectedDate || undefined,
        name: searchName || undefined,
        page,
        limit,
      },
      { skip: !isAuthenticated || !isGlobal },
    );

  // Personal history fallback
  const { data: historyData, isLoading: isLoadingHistory } =
    useGetAttendanceHistoryQuery(
      { page, limit },
      { skip: !isAuthenticated || isGlobal },
    );

  // Mutations
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();

  // Calculate current session duration
  const [currentDuration, setCurrentDuration] = useState<number>(0);
  const [nowTs, setNowTs] = useState<number>(() => Date.now());

  // Fetch active attendance
  const { data: activeAttendance, refetch: refetchActive } =
    useGetActiveAttendanceQuery(undefined, {
      skip: !isAuthenticated,
      pollingInterval: 30000, // Refresh every 30 seconds
    });

  // Fetch monthly stats
  const { data: monthlyStats } = useGetMonthlyStatsQuery(
    { year: selectedYear, month: selectedMonth },
    { skip: !isAuthenticated },
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTs(Date.now());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      activeAttendance &&
      activeAttendance.status === AttendanceStatus.ACTIVE
    ) {
      const interval = setInterval(() => {
        const checkInTime = new Date(activeAttendance.checkInTime).getTime();
        const now = Date.now();
        const durationInMinutes = Math.floor((now - checkInTime) / 1000 / 60);
        setCurrentDuration(durationInMinutes);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeAttendance]);

  const handleCheckIn = async () => {
    try {
      await checkIn({ autoCloseAfter }).unwrap();
      refetchActive();
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof (error as { data?: { message?: string } }).data?.message ===
          "string"
          ? (error as { data?: { message?: string } }).data?.message
          : "Failed to check in. Please try again.";
      alert(message);
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut().unwrap();
      refetchActive();
    } catch {
      alert("Failed to check out. Please try again.");
    }
  };

  const isActive = activeAttendance?.status === AttendanceStatus.ACTIVE;
  const records = isGlobal
    ? (globalHistoryData?.data ?? [])
    : (historyData?.data ?? []);
  const pagination = isGlobal
    ? globalHistoryData?.pagination
    : historyData?.pagination;
  const isLoading = isGlobal ? isLoadingGlobalHistory : isLoadingHistory;

  // For personal: check-in limit logic
  const recentCheckInCount = (() => {
    const since24Hours = nowTs - 24 * 60 * 60 * 1000;
    return records.filter((record: (typeof records)[number]) => {
      if (!record?.checkInTime) return false;
      const checkInTime = new Date(record.checkInTime).getTime();
      return Number.isFinite(checkInTime) && checkInTime >= since24Hours;
    }).length;
  })();
  const canCheckIn = !isActive && recentCheckInCount < 2;
  const remainingCheckIns = Math.max(2 - recentCheckInCount, 0);

  const columns = createAttendanceColumns();

  return (
    <div className="min-h-screen bg-zinc-50 text-foreground">
      <div className="flex flex-col gap-6 p-6">
        {/* Header Section */}
        <div className="mb-8 rounded-2xl p-8 bg-white border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gray-100 rounded-2xl ring-2 ring-gray-200">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                  {t("attendance.title")}
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                {t("attendance.subtitle")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/measurements")}
                className="bg-gray-100 hover:bg-gray-200 text-foreground border border-gray-300"
                size="lg"
              >
                <UserIcon className="h-5 w-5 mr-2" />
                {t("attendance.myMeasurements")}
              </Button>
            </div>
          </div>
        </div>

        {/* Check-In/Out Card (personal only) */}
        {!isGlobal && (
          <div className="mb-8 rounded-2xl bg-slate-800/80 backdrop-blur-sm shadow-lg p-6 border border-border/40">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AttendanceCheckCard
                activeAttendance={activeAttendance ?? undefined}
                isActive={isActive}
                canCheckIn={canCheckIn}
                remainingCheckIns={remainingCheckIns}
                currentDuration={currentDuration}
                autoCloseAfter={autoCloseAfter}
                isCheckingIn={isCheckingIn}
                isCheckingOut={isCheckingOut}
                onAutoCloseChange={setAutoCloseAfter}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
              />

              <AttendanceMonthlyStats
                monthlyStats={monthlyStats}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
              />
            </div>
          </div>
        )}

        {/* Filters for global view */}
        {isGlobal && (
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white shadow-sm p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Filter Attendance
            </h3>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Search by Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Type a name..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white text-gray-900 border border-zinc-200 shadow-none hover:border-zinc-300 focus:outline-none focus:border-zinc-300 focus:ring-2 focus:ring-black/5 text-sm"
                    value={searchName}
                    onChange={(e) => {
                      setSearchName(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  User
                </label>
                <select
                  className="w-full rounded-lg px-3 py-2 bg-white text-gray-900 border border-zinc-200 shadow-none hover:border-zinc-300 focus:outline-none focus:border-zinc-300 focus:ring-2 focus:ring-black/5 text-sm"
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Users</option>
                  {manageableUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg px-3 py-2 bg-white text-gray-900 border border-zinc-200 shadow-none hover:border-zinc-300 focus:outline-none focus:border-zinc-300 focus:ring-2 focus:ring-black/5 text-sm"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              {(selectedUserId || selectedDate || searchName) && (
                <div className="flex-none">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-gray-700 hover:bg-zinc-50 shadow-none transition-colors"
                    onClick={() => {
                      setSelectedUserId("");
                      setSelectedDate("");
                      setSearchName("");
                      setPage(1);
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance History Table */}
        <div className="rounded-2xl bg-white shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-6 border-b border-zinc-200 bg-zinc-50">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-900">
              <Calendar className="h-6 w-6 text-blue-600" />
              Attendance History
            </h2>
          </div>
          {/* Active filter indicator */}
          {isGlobal && selectedDate && (
            <div className="px-6 py-3 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Showing attendances for:
              </span>
              <span className="text-sm font-semibold text-blue-700">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </span>
            </div>
          )}
          <DataTable
            columns={columns}
            data={records}
            isLoading={isLoading}
            getRowId={(row) => row._id}
            emptyMessage="No attendance records found."
          />
          {pagination && (
            <div className="p-4 border-t border-zinc-200 bg-white">
              <DataTablePagination
                meta={{
                  page: pagination.page ?? page,
                  limit: pagination.limit ?? limit,
                  total: pagination.total,
                  totalPages: pagination.totalPages,
                }}
                onPageChange={(p) => setPage(p)}
                onPageSizeChange={(s) => {
                  setLimit(s);
                  setPage(1);
                }}
                isLoading={isLoading}
                tone="light"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
