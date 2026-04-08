"use client";

import { TrendingUp, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

interface MonthlyStatsData {
  totalDays?: number;
  totalHours?: number;
  averageHoursPerDay?: number;
}

interface AttendanceMonthlyStatsProps {
  monthlyStats: MonthlyStatsData | undefined;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export function AttendanceMonthlyStats({
  monthlyStats,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: AttendanceMonthlyStatsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-emerald-600" />
        Monthly Statistics
      </h2>

      <div className="flex gap-2">
        <Select
          value={selectedMonth.toString()}
          onValueChange={(value) => onMonthChange(Number(value))}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <SelectItem key={month} value={month.toString()}>
                {new Date(2024, month - 1).toLocaleString("en-US", {
                  month: "long",
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => onYearChange(Number(value))}
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
          <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
            <p className="text-xs text-slate-400 mb-1">Total Days</p>
            <p className="text-3xl font-bold text-blue-400">
              {monthlyStats.totalDays || 0}
            </p>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
            <p className="text-xs text-slate-400 mb-1">Total Hours</p>
            <p className="text-3xl font-bold text-emerald-400">
              {Number(monthlyStats.totalHours || 0).toFixed(1)}
            </p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 col-span-2">
            <p className="text-xs text-slate-400 mb-1">Average Hours/Day</p>
            <p className="text-3xl font-bold text-purple-400">
              {Number(monthlyStats.averageHoursPerDay || 0).toFixed(1)}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-[#0F172B] rounded-xl border border-slate-700 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No data available for this period
          </p>
        </div>
      )}
    </div>
  );
}
