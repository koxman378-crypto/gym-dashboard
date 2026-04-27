"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Timer,
  X,
} from "lucide-react";
import { useGetUserMonthAttendanceQuery } from "@/src/store/services/attendanceApi";
import type { Attendance } from "@/src/types/attendance";
import { useLanguage } from "@/src/components/language/LanguageContext";

interface UserAttendanceCalendarProps {
  userId: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function StatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
  if (status === "auto_closed") return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
  return <Clock className="h-3.5 w-3.5 text-blue-500" />;
}

function statusBadgeClass(status: string) {
  if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "auto_closed") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

function statusDot(status: string) {
  if (status === "completed") return "bg-emerald-500";
  if (status === "auto_closed") return "bg-amber-400";
  return "bg-blue-500";
}

function statusLabel(t: (k: string) => string, status: string) {
  if (status === "auto_closed") return t("attendanceHistory.autoClosed");
  if (status === "completed") return t("attendanceHistory.completed");
  return t("attendanceHistory.active");
}

export function UserAttendanceCalendar({ userId }: UserAttendanceCalendarProps) {
  const { t } = useLanguage();
  const today = useMemo(() => new Date(), []);

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  const { data, isFetching } = useGetUserMonthAttendanceQuery(
    { userId, year, month },
    { skip: !userId },
  );

  const byDate = data?.byDate ?? {};

  const calendarCells = useMemo(() => {
    const firstDow = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells: Array<{ date: Date } | null> = Array(firstDow).fill(null);

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month - 1, d) });
    }

    return cells;
  }, [month, year]);

  const selectedRecords: Attendance[] = selectedDateStr ? (byDate[selectedDateStr] ?? []) : [];

  const totalDays = Object.keys(byDate).filter(
    (ds) => (byDate[ds] ?? []).some((r) => r.status !== "active"),
  ).length;

  const prevMonth = () => { setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)); setSelectedDateStr(null); };
  const nextMonth = () => { setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); setSelectedDateStr(null); };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Month header ── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-base font-bold text-slate-900">
            {MONTH_NAMES[month - 1]} {year}
          </p>
          {isFetching && (
            <p className="animate-pulse text-[11px] text-slate-400">Loading…</p>
          )}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ── Stats chips ── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t("attendanceHistory.completed")}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          {t("attendanceHistory.autoClosed")}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {t("attendanceHistory.active")}
        </span>
        <span className="ml-auto text-xs text-slate-500">
          {t("attendanceHistory.totalDays")}:{" "}
          <strong className="text-slate-900">{totalDays}</strong>
        </span>
      </div>

      {/* ── Calendar grid ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {calendarCells.map((cell, i) => {
            if (!cell) {
              return <div key={`e-${i}`} className="h-12 bg-slate-50/60" />;
            }
            const ds = toDateStr(cell.date);
            const records = byDate[ds] ?? [];
            const hasRec = records.length > 0;
            const isSelected = selectedDateStr === ds;
            const isToday = isSameDay(cell.date, today);
            return (
              <button
                key={ds}
                type="button"
                onClick={() =>
                  setSelectedDateStr((cur) => (cur === ds ? null : ds))
                }
                className={[
                  "relative flex h-12 w-full flex-col items-center justify-center gap-0.5 transition-colors",
                  isSelected
                    ? "bg-emerald-500 text-white"
                    : isToday
                      ? "bg-emerald-50 font-bold text-emerald-700"
                      : "text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {isToday && !isSelected && (
                  <span className="pointer-events-none absolute inset-1.5 rounded-full border-2 border-emerald-400 opacity-40" />
                )}
                <span
                  className={[
                    "text-[13px] font-semibold leading-none",
                    isSelected
                      ? "text-white"
                      : isToday
                        ? "text-emerald-700"
                        : "text-slate-800",
                  ].join(" ")}
                >
                  {cell.date.getDate()}
                </span>
                {hasRec && (
                  <div className="flex gap-0.5">
                    {records.slice(0, 3).map((r) => (
                      <span
                        key={r._id}
                        className={[
                          "h-1.5 w-1.5 rounded-full",
                          isSelected ? "bg-white/80" : statusDot(r.status),
                        ].join(" ")}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Day detail panel ── */}
      {selectedDateStr && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-linear-to-r from-emerald-50 to-white px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {new Date(`${selectedDateStr}T00:00:00`).toLocaleDateString(
                  undefined,
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {selectedRecords.length} session
                {selectedRecords.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDateStr(null)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-4">
            {isFetching ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
                Loading…
              </div>
            ) : selectedRecords.length === 0 ? (
              <p className="py-2 text-center text-sm text-slate-400">
                {t("attendanceHistory.noAttendance")}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedRecords.map((rec, idx) => (
                  <div
                    key={rec._id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="mb-2.5 flex items-center gap-2">
                      <StatusIcon status={rec.status} />
                      <span className="text-sm font-semibold text-slate-900">
                        {t("attendanceHistory.session")} {idx + 1}
                      </span>
                      <span
                        className={`ml-auto rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusBadgeClass(rec.status)}`}
                      >
                        {statusLabel(t, rec.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <LogIn className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-slate-400">
                            {t("attendanceHistory.checkIn")}
                          </p>
                          <p className="text-xs font-semibold text-slate-900">
                            {formatTime(rec.checkInTime)}
                          </p>
                        </div>
                      </div>

                      {rec.checkOutTime ? (
                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                          <LogOut className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-slate-400">
                              {t("attendanceHistory.checkOut")}
                            </p>
                            <p className="text-xs font-semibold text-slate-900">
                              {formatTime(rec.checkOutTime)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-blue-400">
                              Status
                            </p>
                            <p className="text-xs font-semibold text-blue-700">
                              Still active
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {rec.duration > 0 && (
                      <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <Timer className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-slate-400">
                            {t("attendanceHistory.duration")}
                          </p>
                          <p className="text-xs font-semibold text-slate-900">
                            {rec.duration >= 60
                              ? `${Math.floor(rec.duration / 60)}h ${rec.duration % 60}m`
                              : `${rec.duration} ${t("attendanceHistory.minutes")}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
