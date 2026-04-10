"use client";

import { Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import type { ExpiryPreset } from "@/src/types/extended-types";

interface ExpiryPresetListProps {
  presets: ExpiryPreset[];
  isLoading: boolean;
  onEdit: (preset: ExpiryPreset) => void;
  onDelete: (preset: ExpiryPreset) => void;
  onToggle: (preset: ExpiryPreset) => void;
}

export function ExpiryPresetList({
  presets,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
}: ExpiryPresetListProps) {
  if (isLoading) {
    return <div className="p-6 text-center text-slate-500">Loading...</div>;
  }

  if (presets.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">
        No expiry presets found
      </div>
    );
  }

  return (
    <div className="divide-y divide-black/10">
      {presets.map((preset) => (
        <div
          key={preset._id}
          className="flex items-center justify-between gap-4 p-4"
        >
          <div>
            <div className="font-semibold text-slate-900">{preset.label}</div>
            <div className="mt-0.5 text-sm text-slate-500">
              {preset.days} {preset.days === 1 ? "day" : "days"}
            </div>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                preset.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {preset.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggle(preset)}
              title={preset.isActive ? "Deactivate" : "Activate"}
              className="border border-black/10 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              {preset.isActive ? (
                <ToggleRight className="h-4 w-4" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(preset)}
              className="border border-black/10 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(preset)}
              className="border border-black/10 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
