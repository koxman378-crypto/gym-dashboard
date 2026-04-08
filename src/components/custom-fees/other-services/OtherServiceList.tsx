"use client";

import { Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import type { OtherServiceItem } from "@/src/types/extended-types";

const lightButtonIconClassName =
  "border border-black/10 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900";

interface OtherServiceListProps {
  items: OtherServiceItem[];
  isLoading: boolean;
  onEdit: (item: OtherServiceItem) => void;
  onDelete: (item: OtherServiceItem) => void;
  onToggle: (item: OtherServiceItem) => void;
}

export function OtherServiceList({
  items,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
}: OtherServiceListProps) {
  if (isLoading) {
    return <div className="p-6 text-center text-slate-500">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">No services found</div>
    );
  }

  return (
    <div className="divide-y divide-black/10">
      {items.map((item) => (
        <div
          key={item._id}
          className="flex items-center justify-between gap-4 p-4"
        >
          <div>
            <div className="font-semibold">{item.name}</div>
            <div className="text-sm text-green-400">
              {item.amount.toLocaleString()} MMK
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggle(item)}
              className={lightButtonIconClassName}
            >
              {item.isActive ? (
                <ToggleRight className="h-4 w-4" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
              className={lightButtonIconClassName}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item)}
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
