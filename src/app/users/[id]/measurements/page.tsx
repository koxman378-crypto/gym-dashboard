"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import {
  useGetUserByIdQuery,
  useGetMeasurementHistoryQuery,
  useGetAllTrainersQuery,
} from "@/src/store/services/usersApi";
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
import { useAppSelector } from "@/src/store/hooks";
import { Role, User as UserType } from "@/src/types/type";

export default function BodyMeasurementsHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  // Get current logged-in user
  const currentUser = useAppSelector((state) => state.auth.user);

  // Fetch user data and measurement history
  const { data: user, isLoading: userLoading } = useGetUserByIdQuery(userId);
  const { data: measurementHistory = [], isLoading: historyLoading } =
    useGetMeasurementHistoryQuery(userId);

  // Fetch all trainers to map IDs to names
  const { data: trainers = [] } = useGetAllTrainersQuery(undefined, {
    skip: !currentUser,
  });

  // Create a lookup map for trainer IDs to names
  const trainerMap = trainers.reduce((map, trainer) => {
    map[trainer._id] = trainer.name;
    return map;
  }, {} as Record<string, string>);

  const isLoading = userLoading || historyLoading;

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

  // Check if trainer has access to this customer
  const hasAccess = () => {
    if (!currentUser || !user) return false;
    
    // Owners and cashiers have access to all customers
    if (currentUser.role === Role.OWNER || currentUser.role === Role.CASHIER) {
      return true;
    }
    
    // Trainers can view all customers' measurements
    // (Backend allows this - trainers can see all customers)
    if (currentUser.role === Role.TRAINER && user.role === Role.CUSTOMER) {
      return true;
    }
    
    // Customers can view their own data
    if (currentUser.role === Role.CUSTOMER) {
      return currentUser._id === userId;
    }
    
    return false;
  };

  // Check if trainer can UPDATE this customer
  const canUpdate = () => {
    if (!currentUser || !user) return false;
    
    // Owners and cashiers can update all customers
    if (currentUser.role === Role.OWNER || currentUser.role === Role.CASHIER) {
      return true;
    }
    
    // Trainers can only update customers that are:
    // 1. Unassigned (no trainer)
    // 2. Assigned to them
    if (currentUser.role === Role.TRAINER) {
      const assignedTrainerId = typeof user.assignedTrainer === "string" 
        ? user.assignedTrainer 
        : user.assignedTrainer?._id;
      
      // If no assigned trainer OR assigned to this trainer, allow update
      return !assignedTrainerId || assignedTrainerId === currentUser._id;
    }
    
    return false;
  };


  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
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

  // Calculate trend (comparing with previous measurement)
  const getTrend = (current: number | null | undefined, previous: number | null | undefined) => {
    if (!current || !previous) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return null; // No significant change
    return diff > 0 ? "up" : "down";
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/users")}
          title="Back to users"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Body Measurements History</h1>
          {user && (
            <p className="text-muted-foreground mt-1">
              {user.name} ({user.email})
            </p>
          )}
        </div>
      </div>

      {/* Access Denied Message */}
      {!isLoading && user && !hasAccess() && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                Access Denied
              </h3>
              <p className="text-sm text-red-700 mt-1">
                You don't have permission to view this user's measurements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Only show measurements if user has access */}
      {!isLoading && user && hasAccess() && (
        <>
      {/* Current Measurements Card */}
      {user.bodyMeasurements && (
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Current Measurements</h2>
            <Badge variant="outline" className="ml-auto">
              {formatDate(user.bodyMeasurements?.measuredAt)}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user.bodyMeasurements?.height && (
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="text-2xl font-bold">{user.bodyMeasurements.height} cm</p>
              </div>
            )}
            {user.bodyMeasurements?.weight && (
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="text-2xl font-bold">{user.bodyMeasurements.weight} kg</p>
              </div>
            )}
            {user.bodyMeasurements?.bodyFat !== null && user.bodyMeasurements?.bodyFat !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Body Fat</p>
                <p className="text-2xl font-bold">{user.bodyMeasurements.bodyFat}%</p>
              </div>
            )}
            {user.bodyMeasurements?.chest && (
              <div>
                <p className="text-sm text-muted-foreground">Chest</p>
                <p className="text-2xl font-bold">{user.bodyMeasurements.chest} cm</p>
              </div>
            )}
            {user.bodyMeasurements?.waist && (
              <div>
                <p className="text-sm text-muted-foreground">Waist</p>
                <p className="text-2xl font-bold">{user.bodyMeasurements.waist} cm</p>
              </div>
            )}
            {user.bodyMeasurements?.biceps && (
              <div>
                <p className="text-sm text-muted-foreground">Biceps</p>
                <p className="text-2xl font-bold">{user.bodyMeasurements.biceps} cm</p>
              </div>
            )}
            {user.bodyMeasurements?.leg && (
              <div>
                <p className="text-sm text-muted-foreground">Leg</p>
                <p className="text-2xl font-bold">{user.bodyMeasurements.leg} cm</p>
              </div>
            )}
          </div>
          {user.bodyMeasurements?.measuredBy && (
            <p className="text-sm text-muted-foreground mt-4">
              Measured by: {getTrainerName(user.bodyMeasurements.measuredBy)}
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
              {measurementHistory.length} records
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">
            Loading measurements...
          </div>
        ) : measurementHistory.length === 0 ? (
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
      {user?.assignedTrainer && typeof user.assignedTrainer === "object" && (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Assigned Trainer:{" "}
            <span className="font-medium text-foreground">
              {user.assignedTrainer.name || "Unknown"} 
              {user.assignedTrainer.email && ` (${user.assignedTrainer.email})`}
            </span>
          </p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
