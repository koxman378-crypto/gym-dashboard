"use client";

import { Clock, PlayCircle, StopCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import type { Attendance } from "@/src/types/attendance";

interface AttendanceCheckCardProps {
  activeAttendance: Attendance | undefined;
  isActive: boolean;
  canCheckIn: boolean;
  remainingCheckIns: number;
  currentDuration: number;
  autoCloseAfter: number;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
  onAutoCloseChange: (value: number) => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AttendanceCheckCard({
  activeAttendance,
  isActive,
  canCheckIn,
  remainingCheckIns,
  currentDuration,
  autoCloseAfter,
  isCheckingIn,
  isCheckingOut,
  onAutoCloseChange,
  onCheckIn,
  onCheckOut,
}: AttendanceCheckCardProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <Clock className="h-6 w-6 text-blue-600" />
        Current Session
      </h2>

      {isActive ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Status</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                Active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-muted-foreground">Check-in Time</p>
                <p className="text-lg font-bold text-foreground">
                  {activeAttendance && formatTime(activeAttendance.checkInTime)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-lg font-bold text-foreground">
                  {formatDuration(currentDuration)}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={onCheckOut}
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
          <div className="p-4 bg-[#0F172B] rounded-xl border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Status</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-500 text-white">
                Inactive
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              You are not currently checked in. Start your session to begin
              tracking.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Auto Close After</label>
            <Select
              value={autoCloseAfter.toString()}
              onValueChange={(value) => onAutoCloseChange(Number(value))}
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
            onClick={onCheckIn}
            disabled={isCheckingIn || !canCheckIn}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
            size="lg"
          >
            <PlayCircle className="h-6 w-6 mr-2" />
            {isCheckingIn
              ? "Checking In..."
              : !canCheckIn
                ? "Limit Reached"
                : "Check In"}
          </Button>
          {!canCheckIn && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              You have reached the maximum of 2 check-ins in the last 24 hours.
            </div>
          )}
          {canCheckIn && (
            <p className="text-xs text-muted-foreground">
              Remaining check-ins in the current 24-hour window:{" "}
              {remainingCheckIns}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
