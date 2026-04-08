"use client";

import { User, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { User as UserType } from "@/src/types/type";

type MeasurementRecord = {
  height?: number | null;
  weight?: number | null;
  bodyFat?: number | null;
  chest?: number | null;
  waist?: number | null;
  biceps?: number | null;
  leg?: number | null;
  measuredAt?: string | Date | null;
  measuredBy?: string | UserType | null;
};

function getTrend(
  current: number | null | undefined,
  previous: number | null | undefined,
) {
  if (!current || !previous) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.1) return null;
  return diff > 0 ? "up" : "down";
}

function formatDateTime(date: string | Date | null | undefined) {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function getTrainerName(
  measuredBy: string | UserType | null | undefined,
): string {
  if (!measuredBy) return "-";
  if (typeof measuredBy === "object" && "name" in measuredBy) {
    return (measuredBy as UserType).name || "-";
  }
  return "Staff";
}

interface MeasurementHistoryTableProps {
  history: MeasurementRecord[] | undefined;
  isLoading: boolean;
}

export function MeasurementHistoryTable({
  history,
  isLoading,
}: MeasurementHistoryTableProps) {
  const METRIC_COLUMNS = [
    {
      label: "Height (cm)",
      key: "height" as keyof MeasurementRecord,
      upColor: "text-blue-500",
      downColor: "text-orange-500",
    },
    {
      label: "Weight (kg)",
      key: "weight" as keyof MeasurementRecord,
      upColor: "text-red-500",
      downColor: "text-green-500",
    },
    {
      label: "Body Fat (%)",
      key: "bodyFat" as keyof MeasurementRecord,
      upColor: "text-red-500",
      downColor: "text-green-500",
    },
    {
      label: "Chest (cm)",
      key: "chest" as keyof MeasurementRecord,
      upColor: "text-blue-500",
      downColor: "text-orange-500",
    },
    {
      label: "Waist (cm)",
      key: "waist" as keyof MeasurementRecord,
      upColor: "text-orange-500",
      downColor: "text-green-500",
    },
    {
      label: "Biceps (cm)",
      key: "biceps" as keyof MeasurementRecord,
      upColor: "text-blue-500",
      downColor: "text-orange-500",
    },
    {
      label: "Leg (cm)",
      key: "leg" as keyof MeasurementRecord,
      upColor: "text-blue-500",
      downColor: "text-orange-500",
    },
  ] as const;

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Measurement History</h2>
          <Badge variant="secondary" className="ml-auto">
            {history?.length || 0} records
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 text-center text-muted-foreground">
          Loading measurements...
        </div>
      ) : !history || history.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground">
          No measurement history available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {METRIC_COLUMNS.map((col) => (
                  <TableHead key={col.key} className="text-right">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead>Measured By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((measurement, index) => {
                const prev = history[index + 1];
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {formatDateTime(measurement.measuredAt)}
                    </TableCell>
                    {METRIC_COLUMNS.map((col) => {
                      const val = measurement[col.key] as
                        | number
                        | null
                        | undefined;
                      const prevVal = prev?.[col.key] as
                        | number
                        | null
                        | undefined;
                      const trend = getTrend(val, prevVal);
                      const displayVal =
                        col.key === "bodyFat"
                          ? val !== null && val !== undefined
                            ? val
                            : "-"
                          : val || "-";
                      return (
                        <TableCell key={col.key} className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {displayVal}
                            {trend === "up" && (
                              <TrendingUp
                                className={`h-4 w-4 ${col.upColor}`}
                              />
                            )}
                            {trend === "down" && (
                              <TrendingDown
                                className={`h-4 w-4 ${col.downColor}`}
                              />
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      {getTrainerName(
                        measurement.measuredBy as
                          | string
                          | UserType
                          | null
                          | undefined,
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
