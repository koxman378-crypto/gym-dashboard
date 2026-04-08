"use client";

import { Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import type { GymFeeRecord } from "@/src/types/extended-types";

interface GymFeeListProps {
  fees: GymFeeRecord[];
  isLoading: boolean;
  onEdit: (fee: GymFeeRecord) => void;
  onDelete: (fee: GymFeeRecord) => void;
  onToggle: (fee: GymFeeRecord) => void;
}

export function GymFeeList({
  fees,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
}: GymFeeListProps) {
  if (isLoading) {
    return <div className="p-6 text-center text-slate-500">Loading...</div>;
  }

  if (fees.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">No gym fees found</div>
    );
  }

  return (
    <div className="divide-y divide-black/10">
      {fees.map((fee) => (
        <div
          key={fee._id}
          className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="font-semibold">{fee.name}</div>
            <div className="text-sm text-green-400">
              {fee.amount.toLocaleString()} MMK per {fee.duration}{" "}
              {fee.durationUnit}
            </div>
            <div className="text-xs text-green-600 italic">
              {fee.promotionType && fee.promotionValue !== null
                ? fee.promotionType === "percentage"
                  ? `${fee.promotionValue}% promotion`
                  : `${Number(fee.promotionValue).toLocaleString()} MMK promotion`
                : "No promotion"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggle(fee)}
              className="border border-black/10 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              {fee.isActive ? (
                <ToggleRight className="h-4 w-4" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(fee)}
              className="border border-black/10 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(fee)}
              className="border border-black/10 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                fee.isActive
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {fee.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
