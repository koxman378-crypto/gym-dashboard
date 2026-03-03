"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, History, Calendar, TrendingUp, TrendingDown, User } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  useGetMyProfileQuery,
  useGetMeasurementHistoryQuery,
  useGetAllTrainersQuery,
} from "@/src/store/services/usersApi";
import { useAppSelector } from "@/src/store/hooks";
import { User as UserType } from "@/src/types/type";

export default function MeasurementsPage() {
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch user profile and measurement history
  const { data: userProfile, isLoading: isLoadingProfile } =
    useGetMyProfileQuery(undefined, {
      skip: !isAuthenticated,
    });

  const { data: measurementHistory, isLoading: isLoadingHistory } =
    useGetMeasurementHistoryQuery(currentUser?._id || "", {
      skip: !isAuthenticated || !currentUser?._id,
    });

  // Fetch all trainers to map IDs to names
  const { data: trainers = [] } = useGetAllTrainersQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Create a lookup map for trainer IDs to names
  const trainerMap = trainers.reduce((map, trainer) => {
    map[trainer._id] = trainer.name;
    return map;
  }, {} as Record<string, string>);

  // Helper function to get trainer name from measuredBy field
  const getTrainerName = (measuredBy: string | UserType | null | undefined): string => {
    if (!measuredBy) return "-";
    
    // If it's already an object with name
    if (typeof measuredBy === "object" && "name" in measuredBy) {
      return measuredBy.name || "-";
    }
    
    // If it's a string (ID), look it up in the trainer map
    if (typeof measuredBy === "string") {
      return trainerMap[measuredBy] || measuredBy; // Fallback to ID if name not found
    }
    
    return "-";
  };

  // Calculate trend (comparing with previous measurement)
  const getTrend = (current: number | null | undefined, previous: number | null | undefined) => {
    if (!current || !previous) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return null; // No significant change
    return diff > 0 ? "up" : "down";
  };

  const formatDateTime = (date: string | Date | null | undefined) => {
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
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Body Measurements History</h1>
          {userProfile && (
            <p className="text-muted-foreground mt-1">
              {userProfile.name} ({userProfile.email})
            </p>
          )}
        </div>
      </div>

      {/* Current Measurements Card */}
      {userProfile?.bodyMeasurements && (
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Current Measurements</h2>
            <Badge variant="outline" className="ml-auto">
              {formatDateTime(userProfile.bodyMeasurements?.measuredAt)}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userProfile.bodyMeasurements?.height && (
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="text-2xl font-bold">{userProfile.bodyMeasurements.height} cm</p>
              </div>
            )}
            {userProfile.bodyMeasurements?.weight && (
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="text-2xl font-bold">{userProfile.bodyMeasurements.weight} kg</p>
              </div>
            )}
            {userProfile.bodyMeasurements?.bodyFat !== null && userProfile.bodyMeasurements?.bodyFat !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Body Fat</p>
                <p className="text-2xl font-bold">{userProfile.bodyMeasurements.bodyFat}%</p>
              </div>
            )}
            {userProfile.bodyMeasurements?.chest && (
              <div>
                <p className="text-sm text-muted-foreground">Chest</p>
                <p className="text-2xl font-bold">{userProfile.bodyMeasurements.chest} cm</p>
              </div>
            )}
            {userProfile.bodyMeasurements?.waist && (
              <div>
                <p className="text-sm text-muted-foreground">Waist</p>
                <p className="text-2xl font-bold">{userProfile.bodyMeasurements.waist} cm</p>
              </div>
            )}
            {userProfile.bodyMeasurements?.biceps && (
              <div>
                <p className="text-sm text-muted-foreground">Biceps</p>
                <p className="text-2xl font-bold">{userProfile.bodyMeasurements.biceps} cm</p>
              </div>
            )}
            {userProfile.bodyMeasurements?.leg && (
              <div>
                <p className="text-sm text-muted-foreground">Leg</p>
                <p className="text-2xl font-bold">{userProfile.bodyMeasurements.leg} cm</p>
              </div>
            )}
          </div>
          {userProfile.bodyMeasurements?.measuredBy && (
            <p className="text-sm text-muted-foreground mt-4">
              Measured by: {getTrainerName(userProfile.bodyMeasurements.measuredBy)}
            </p>
          )}
        </div>
      )}

      {/* Measurement History Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Measurement History</h2>
            <Badge variant="secondary" className="ml-auto">
              {measurementHistory?.length || 0} records
            </Badge>
          </div>
        </div>

        {isLoadingHistory ? (
          <div className="p-6 text-center text-muted-foreground">
            Loading measurements...
          </div>
        ) : !measurementHistory || measurementHistory.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No measurement history available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Height (cm)</TableHead>
                  <TableHead className="text-right">Weight (kg)</TableHead>
                  <TableHead className="text-right">Body Fat (%)</TableHead>
                  <TableHead className="text-right">Chest (cm)</TableHead>
                  <TableHead className="text-right">Waist (cm)</TableHead>
                  <TableHead className="text-right">Biceps (cm)</TableHead>
                  <TableHead className="text-right">Leg (cm)</TableHead>
                  <TableHead>Measured By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurementHistory.map((measurement, index) => {
                  const prevMeasurement = measurementHistory[index + 1];
                  const heightTrend = getTrend(measurement.height, prevMeasurement?.height);
                  const weightTrend = getTrend(measurement.weight, prevMeasurement?.weight);
                  const bodyFatTrend = getTrend(measurement.bodyFat, prevMeasurement?.bodyFat);
                  const chestTrend = getTrend(measurement.chest, prevMeasurement?.chest);
                  const waistTrend = getTrend(measurement.waist, prevMeasurement?.waist);
                  const bicepsTrend = getTrend(measurement.biceps, prevMeasurement?.biceps);
                  const legTrend = getTrend(measurement.leg, prevMeasurement?.leg);

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {formatDateTime(measurement.measuredAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {measurement.height || "-"}
                          {heightTrend === "up" && (
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                          )}
                          {heightTrend === "down" && (
                            <TrendingDown className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {measurement.weight || "-"}
                          {weightTrend === "up" && (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          )}
                          {weightTrend === "down" && (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {measurement.bodyFat !== null && measurement.bodyFat !== undefined
                            ? measurement.bodyFat
                            : "-"}
                          {bodyFatTrend === "up" && (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          )}
                          {bodyFatTrend === "down" && (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {measurement.chest || "-"}
                          {chestTrend === "up" && (
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                          )}
                          {chestTrend === "down" && (
                            <TrendingDown className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {measurement.waist || "-"}
                          {waistTrend === "up" && (
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                          )}
                          {waistTrend === "down" && (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {measurement.biceps || "-"}
                          {bicepsTrend === "up" && (
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                          )}
                          {bicepsTrend === "down" && (
                            <TrendingDown className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {measurement.leg || "-"}
                          {legTrend === "up" && (
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                          )}
                          {legTrend === "down" && (
                            <TrendingDown className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTrainerName(measurement.measuredBy)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Assigned Trainer Info */}
      {userProfile?.assignedTrainer && typeof userProfile.assignedTrainer === "object" && (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Assigned Trainer:{" "}
            <span className="font-medium text-foreground">
              {userProfile.assignedTrainer.name || "Unknown"} 
              {userProfile.assignedTrainer.email && ` (${userProfile.assignedTrainer.email})`}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
