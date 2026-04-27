"use client";

import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

interface PageLoadingStateProps {
  className?: string;
  headerActionCount?: number;
  itemCount?: number;
}

export function PageLoadingState({
  className,
  headerActionCount = 1,
  itemCount = 4,
}: PageLoadingStateProps) {
  return (
    <div className={cn("min-h-screen bg-[#FCFCFC] p-6 text-foreground", className)}>
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-[#F5F5F5] p-6 shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-9 w-56 bg-gray-200" />
          <Skeleton className="h-4 w-80 max-w-full bg-gray-100" />
        </div>
        <div className="flex items-center gap-3">
          {Array.from({ length: headerActionCount }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-14 w-36 rounded-2xl border border-gray-200 bg-white shadow-sm"
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="space-y-4">
          {Array.from({ length: itemCount }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-[#F5F5F5] p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 bg-gray-200" />
                  <Skeleton className="h-4 w-64 bg-gray-100" />
                  <Skeleton className="h-4 w-28 bg-gray-100" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20 rounded-full bg-white" />
                  <Skeleton className="h-9 w-24 rounded-full bg-white" />
                  <Skeleton className="h-9 w-20 rounded-full bg-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}