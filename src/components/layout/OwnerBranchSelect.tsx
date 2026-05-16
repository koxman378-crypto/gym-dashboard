"use client";

import { Building2 } from "lucide-react";

import { cn } from "@/src/lib/utils";
import type { MultiGymItem } from "@/src/types/type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

type OwnerBranchSelectProps = {
  branches: MultiGymItem[];
  selectedGymId: string | null;
  onChange: (gymId: string | null) => void;
  variant?: "page" | "compact";
  className?: string;
  label?: string;
  subtitle?: string;
  allLabel?: string;
};

export function OwnerBranchSelect({
  branches,
  selectedGymId,
  onChange,
  variant = "page",
  className,

  allLabel = "All Branches",
}: OwnerBranchSelectProps) {
  if (branches.length === 0) return null;

  const trigger = (
    <Select
      value={selectedGymId ?? "all"}
      onValueChange={(value) => onChange(value === "all" ? null : value)}
    >
      <SelectTrigger
        className={cn(
          variant === "page"
            ? "h-12 w-50 border -mt-4 border-zinc-200 bg-white text-sm shadow-sm transition-colors hover:bg-zinc-50 focus:ring-black/5 focus-visible:ring-black/5"
            : "h-9 cursor-pointer border border-zinc-200 bg-white text-sm shadow-sm transition-colors hover:bg-zinc-50 focus:ring-0 focus-visible:ring-0",
        )}
      >
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent className="border border-gray-200 bg-white shadow-lg">
        <SelectItem value="all" className="cursor-pointer focus:bg-gray-100">
          {allLabel}
        </SelectItem>
        {branches.map((branch) => (
          <SelectItem
            key={branch._id}
            value={String(branch._id)}
            className="cursor-pointer focus:bg-gray-100"
          >
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return <div className={className}>{trigger}</div>;
}
