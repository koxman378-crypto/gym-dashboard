"use client";

import { User } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { BodyMeasurement, User as UserType } from "@/src/types/type";

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

interface CurrentMeasurementsCardProps {
  measurements: BodyMeasurement;
}

export function CurrentMeasurementsCard({
  measurements,
}: CurrentMeasurementsCardProps) {
  const fields: {
    label: string;
    value: string | number | null | undefined;
    unit: string;
  }[] = [
    { label: "Height", value: measurements.height, unit: "cm" },
    { label: "Weight", value: measurements.weight, unit: "kg" },
    { label: "Body Fat", value: measurements.bodyFat, unit: "%" },
    { label: "Chest", value: measurements.chest, unit: "cm" },
    { label: "Waist", value: measurements.waist, unit: "cm" },
    { label: "Biceps", value: measurements.biceps, unit: "cm" },
    { label: "Leg", value: measurements.leg, unit: "cm" },
  ].filter((f) => f.value !== null && f.value !== undefined);

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Current Measurements</h2>
        <Badge variant="outline" className="ml-auto">
          {formatDateTime(measurements.measuredAt)}
        </Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-sm text-muted-foreground">{f.label}</p>
            <p className="text-2xl font-bold">
              {f.value}
              {f.unit !== "%" ? ` ${f.unit}` : f.unit}
            </p>
          </div>
        ))}
      </div>
      {measurements.measuredBy && (
        <p className="text-sm text-muted-foreground mt-4">
          Measured by:{" "}
          {getTrainerName(
            measurements.measuredBy as string | UserType | null | undefined,
          )}
        </p>
      )}
    </div>
  );
}
