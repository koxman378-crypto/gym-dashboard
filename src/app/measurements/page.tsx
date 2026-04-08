"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  useGetMyProfileQuery,
  useGetMeasurementHistoryQuery,
} from "@/src/store/services/usersApi";
import { useAppSelector } from "@/src/store/hooks";
import { CurrentMeasurementsCard } from "@/src/components/measurements/CurrentMeasurementsCard";
import { MeasurementHistoryTable } from "@/src/components/measurements/MeasurementHistoryTable";
import { BodyMeasurement } from "@/src/types/type";

export default function MeasurementsPage() {
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: userProfile } = useGetMyProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const measurementUserId = userProfile?._id || currentUser?._id;

  const { data: measurementHistory, isLoading: isLoadingHistory } =
    useGetMeasurementHistoryQuery(measurementUserId || "", {
      skip: !isAuthenticated || !measurementUserId,
    });

  return (
    <div className="container mx-auto py-6 space-y-6">
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

      {userProfile?.bodyMeasurements && (
        <CurrentMeasurementsCard
          measurements={userProfile.bodyMeasurements as BodyMeasurement}
        />
      )}

      <MeasurementHistoryTable
        history={measurementHistory as BodyMeasurement[] | undefined}
        isLoading={isLoadingHistory}
      />

      {userProfile?.assignedTrainer &&
        typeof userProfile.assignedTrainer === "object" && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Assigned Trainer:{" "}
              <span className="font-medium text-foreground">
                {(userProfile.assignedTrainer as { name?: string; email?: string }).name ||
                  "Unknown"}
                {(userProfile.assignedTrainer as { name?: string; email?: string })
                  .email &&
                  ` (${(
                    userProfile.assignedTrainer as {
                      name?: string;
                      email?: string;
                    }
                  ).email})`}
              </span>
            </p>
          </div>
        )}
    </div>
  );
}
