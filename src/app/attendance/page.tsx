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
} from "@/src/store/services/attendanceApi";
import { useAppSelector } from "@/src/store/hooks";
import { useAttendanceState } from "@/src/store/hooks/useAttendanceState";
import { AttendanceStatus } from "@/src/types/attendance";
import { AttendanceCheckCard } from "@/src/components/attendance/AttendanceCheckCard";
import { AttendanceMonthlyStats } from "@/src/components/attendance/AttendanceMonthlyStats";
import { useLanguage } from "@/src/components/language/LanguageContext";

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
  const limit = 30;

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch active attendance
  const { data: activeAttendance, refetch: refetchActive } =
    useGetActiveAttendanceQuery(undefined, {
      skip: !isAuthenticated,
      pollingInterval: 30000, // Refresh every 30 seconds
    });

  // Fetch attendance history
  const { data: historyData, isLoading: isLoadingHistory } =
    useGetAttendanceHistoryQuery({ page, limit }, { skip: !isAuthenticated });

  // Fetch monthly stats
  const { data: monthlyStats } = useGetMonthlyStatsQuery(
    { year: selectedYear, month: selectedMonth },
    { skip: !isAuthenticated },
  );

  // Mutations
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();

  // Calculate current session duration
  const [currentDuration, setCurrentDuration] = useState<number>(0);

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
  const recentCheckInCount = (() => {
    const since24Hours = Date.now() - 24 * 60 * 60 * 1000;
    const records = historyData?.data ?? [];
    return records.filter((record) => {
      if (!record?.checkInTime) return false;
      const checkInTime = new Date(record.checkInTime).getTime();
      return Number.isFinite(checkInTime) && checkInTime >= since24Hours;
    }).length;
  })();
  const canCheckIn = !isActive && recentCheckInCount < 2;
  const remainingCheckIns = Math.max(2 - recentCheckInCount, 0);

  const columns = createAttendanceColumns();

  return (
    <div className="min-h-screen bg-[#0F172B]">
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 rounded-2xl bg-slate-800 border border-slate-700 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-slate-800/15 rounded-2xl backdrop-blur-sm ring-2 ring-white/20">
                  <Clock className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                  {t("attendance.title")}
                </h1>
              </div>
              <p className="text-white/95 text-lg">
                {t("attendance.subtitle")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/measurements")}
                className="bg-slate-800/20 hover:bg-slate-800/30 text-white border border-white/30 backdrop-blur-sm"
                size="lg"
              >
                <UserIcon className="h-5 w-5 mr-2" />
                {t("attendance.myMeasurements")}
              </Button>
            </div>
          </div>
        </div>

        {/* Check-In/Out Card */}
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

        {/* Attendance History Table */}
        <div className="rounded-2xl bg-slate-800/80 backdrop-blur-sm shadow-lg overflow-hidden border border-border/40">
          <div className="p-6 border-b border-border/40">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              Attendance History
            </h2>
          </div>
          <DataTable
            columns={columns}
            data={historyData?.data || []}
            isLoading={isLoadingHistory}
            getRowId={(row) => row._id}
            emptyMessage="No attendance records found. Check in to start tracking your sessions."
          />
          {historyData?.pagination && historyData.pagination.totalPages > 1 && (
            <div className="p-4 border-t border-border/40 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {historyData.pagination.totalPages} (
                {historyData.pagination.total} total records)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= historyData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
