"use client";

import { Loader2 } from "lucide-react";

interface TableLoaderOverlayProps {
  show: boolean;
}

export function TableLoaderOverlay({ show }: TableLoaderOverlayProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 rounded-lg bg-background p-4 shadow-lg border">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  );
}
