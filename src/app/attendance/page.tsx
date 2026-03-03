"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  PlayCircle,
  StopCircle,
  Calendar,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { DataTable } from "@/src/components/data-table/table-data";
import { createAttendanceColumns } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  useCheckInMutation,
  useCheckOutMutation,
  useGetActiveAttendanceQuery,
  useGetAttendanceHistoryQuery,
  useGetMonthlyStatsQuery,
} from "@/src/store/services/attendanceApi";
import { useAppSelector } from "@/src/store/hooks";
import { AttendanceStatus } from "@/src/types/attendance";

export default function AttendancePage() {
  const router = useRouter();
  const [autoCloseAfter, setAutoCloseAfter] = useState<number>(120); // Default 2 hours
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [page, setPage] = useState(1);
  const limit = 30;

  const currentUser = useAppSelector((state) => state.auth.user);
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
    } else {
      setCurrentDuration(0);
    }
  }, [activeAttendance]);

  const handleCheckIn = async () => {
    try {
      await checkIn({ autoCloseAfter }).unwrap();
      refetchActive();
    } catch (error) {
      console.error("Failed to check in:", error);
      alert("Failed to check in. Please try again.");
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut().unwrap();
      refetchActive();
    } catch (error) {
      console.error("Failed to check out:", error);
      alert("Failed to check out. Please try again.");
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isActive = activeAttendance?.status === AttendanceStatus.ACTIVE;

  const columns = createAttendanceColumns();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-sm ring-2 ring-white/20">
                  <Clock className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                  My Attendance
                </h1>
              </div>
              <p className="text-white/95 text-lg">
                Track your gym attendance and workout sessions
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/measurements")}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                size="lg"
              >
                <UserIcon className="h-5 w-5 mr-2" />
                My Measurements
              </Button>
            </div>
          </div>
        </div>

        {/* Check-In/Out Card */}
        <div className="mb-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg p-6 border border-border/40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Status */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Clock className="h-6 w-6 text-blue-600" />
                Current Session
              </h2>

              {isActive ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Status
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                        Active
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Check-in Time
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {activeAttendance &&
                            formatTime(activeAttendance.checkInTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {formatDuration(currentDuration)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckOut}
                    disabled={isCheckingOut}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold"
                    size="lg"
                  >
                    <StopCircle className="h-6 w-6 mr-2" />
                    {isCheckingOut ? "Checking Out..." : "Check Out"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Status</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-500 text-white">
                        Inactive
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      You are not currently checked in. Start your session to
                      begin tracking.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Auto Close After
                    </label>
                    <Select
                      value={autoCloseAfter.toString()}
                      onValueChange={(value) =>
                        setAutoCloseAfter(Number(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 Hour</SelectItem>
                        <SelectItem value="120">2 Hours</SelectItem>
                        <SelectItem value="180">3 Hours</SelectItem>
                        <SelectItem value="240">4 Hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Session will automatically close after this duration
                    </p>
                  </div>

                  <Button
                    onClick={handleCheckIn}
                    disabled={isCheckingIn}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                    size="lg"
                  >
                    <PlayCircle className="h-6 w-6 mr-2" />
                    {isCheckingIn ? "Checking In..." : "Check In"}
                  </Button>
                </div>
              )}
            </div>

            {/* Monthly Statistics */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
                Monthly Statistics
              </h2>

              <div className="flex gap-2">
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(Number(value))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2024, month - 1).toLocaleString("en-US", {
                            month: "long",
                          })}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: 5 },
                      (_, i) => new Date().getFullYear() - i,
                    ).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {monthlyStats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Days
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {monthlyStats.totalDays || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Hours
                    </p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {Number(monthlyStats.totalHours || 0).toFixed(1)}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      Average Hours/Day
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {Number(monthlyStats.averageHoursPerDay || 0).toFixed(1)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No data available for this period
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance History Table */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg overflow-hidden border border-border/40">
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
