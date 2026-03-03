"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Attendance, AttendanceStatus } from "@/src/types/attendance";
import { Badge } from "@/src/components/ui/badge";
import { Clock, Calendar } from "lucide-react";

export const createAttendanceColumns = (): ColumnDef<Attendance>[] => [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Date</span>
        </div>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      return (
        <div className="font-medium">
          {date.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "checkInTime",
    header: "Check In",
    cell: ({ row }) => {
      const time = new Date(row.original.checkInTime);
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-600" />
          <span className="font-mono">
            {time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "checkOutTime",
    header: "Check Out",
    cell: ({ row }) => {
      const checkOutTime = row.original.checkOutTime;
      if (!checkOutTime) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }
      const time = new Date(checkOutTime);
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-red-600" />
          <span className="font-mono">
            {time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.original.duration;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      
      if (duration === 0) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }
      
      return (
        <div className="font-medium">
          {hours > 0 && <span>{hours}h </span>}
          {minutes > 0 && <span>{minutes}m</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      
      const statusConfig = {
        [AttendanceStatus.ACTIVE]: {
          label: "Active",
          className: "bg-green-500 text-white hover:bg-green-600",
        },
        [AttendanceStatus.COMPLETED]: {
          label: "Completed",
          className: "bg-blue-500 text-white hover:bg-blue-600",
        },
        [AttendanceStatus.AUTO_CLOSED]: {
          label: "Auto Closed",
          className: "bg-orange-500 text-white hover:bg-orange-600",
        },
      };

      const config = statusConfig[status] || {
        label: status,
        className: "bg-gray-500 text-white",
      };

      return <Badge className={config.className}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "autoCloseAfter",
    header: "Auto Close",
    cell: ({ row }) => {
      const autoCloseAfter = row.original.autoCloseAfter;
      const hours = autoCloseAfter / 60;
      return (
        <div className="text-sm text-muted-foreground">
          {hours}h
        </div>
      );
    },
  },
];
