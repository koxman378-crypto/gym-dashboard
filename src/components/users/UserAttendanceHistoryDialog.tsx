"use client";

import { CalendarDays, Clock3, Mail, User as UserIcon } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { cn } from "@/src/lib/utils";
import { UserAttendanceCalendar } from "@/src/components/attendance/UserAttendanceCalendar";
import { lightDialogContentClassName } from "./users.constants";
import type { User } from "@/src/types/type";

interface UserAttendanceHistoryDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserAttendanceHistoryDialog({
  user,
  open,
  onOpenChange,
}: UserAttendanceHistoryDialogProps) {
  if (!user) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onOpenChange(false);
      }}
    >
      <DialogContent className={cn(lightDialogContentClassName, "max-w-5xl")}>
        <DialogHeader>
          <div className="rounded-2xl border border-border bg-linear-to-r from-muted/50 via-background to-sky-50/60 px-4 py-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-background text-foreground shadow-sm ring-1 ring-border">
                <CalendarDays className="h-7 w-7 text-sky-600" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl font-semibold text-foreground">
                  Attendance History
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  Check-in sessions are loaded only when you open this dialog.
                </DialogDescription>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-sky-200 bg-sky-50 text-sky-700"
                  >
                    {user.role}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border bg-background text-muted-foreground"
                  >
                    {user.name}
                  </Badge>
                  {user.nickname && (
                    <Badge
                      variant="outline"
                      className="border-border bg-background text-muted-foreground"
                    >
                      {user.nickname}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 shadow-sm">
                <UserIcon className="h-4 w-4 text-sky-600" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 shadow-sm">
                  <Clock3 className="h-4 w-4 text-sky-600" />
                  <span className="truncate">{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
          <UserAttendanceCalendar userId={user._id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
