"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

/* ─────────────────────────────────────────
   TableLoaderOverlay
   Full-overlay for data tables while loading
   ───────────────────────────────────────── */
interface TableLoaderOverlayProps {
  show: boolean;
}

export function TableLoaderOverlay({ show }: TableLoaderOverlayProps) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
      <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm font-medium text-gray-500">Loading…</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PageLoader
   Full-page centered spinner
   ───────────────────────────────────────── */
export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm font-medium text-gray-500">Loading…</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   InlineLoader
   Small inline spinner for buttons / cells
   ───────────────────────────────────────── */
interface InlineLoaderProps {
  label?: string;
  className?: string;
}

export function InlineLoader({ label = "Loading…", className }: InlineLoaderProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm text-gray-400", className)}>
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────
   CardSkeleton
   Pulsing placeholder card rows
   ───────────────────────────────────────── */
interface CardSkeletonProps {
  rows?: number;
  className?: string;
}

export function CardSkeleton({ rows = 4, className }: CardSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-[#FCFCFC] px-4 py-3.5"
        >
          {/* Avatar placeholder */}
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/5 animate-pulse rounded bg-gray-200" />
            <div className="h-2.5 w-3/5 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
