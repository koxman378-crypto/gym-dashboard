"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import type { DurationUnit, PromotionType } from "@/src/types/extended-types";

const lightSelectTriggerClassName =
  "border-black/20 bg-white text-slate-900 hover:border-black/40 focus:border-slate-900 focus:ring-black/10";
const lightSelectContentClassName =
  "border-black/20 bg-white text-slate-900 shadow-xl ring-black/10";
const lightSelectItemClassName =
  "text-slate-900 focus:bg-slate-100 hover:bg-slate-100";
const lightDialogContentClassName =
  "border border-black/15 bg-white text-slate-900 shadow-2xl ring-black/10";
const lightDialogFooterClassName = "border-black/10 bg-slate-50";
const lightButtonClassName =
  "border border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-sm";
const lightInputClassName =
  "border-black/20 bg-white text-slate-900 placeholder:text-slate-500 hover:border-black/40 focus-visible:border-slate-900 focus-visible:ring-black/10";

export type GymFeeFormState = {
  name: string;
  amount: number;
  duration: number;
  durationUnit: DurationUnit;
  promotionType: Exclude<PromotionType, null> | "none";
  promotionValue: number | "";
  isActive: boolean;
};

interface GymFeeFormDialogProps {
  open: boolean;
  isEdit: boolean;
  formData: GymFeeFormState;
  onOpenChange: (open: boolean) => void;
  onChange: (data: GymFeeFormState) => void;
  onSubmit: () => void;
}

export function GymFeeFormDialog({
  open,
  isEdit,
  formData,
  onOpenChange,
  onChange,
  onSubmit,
}: GymFeeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={lightDialogContentClassName}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Gym Fee" : "Add Gym Fee"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the gym fee item."
              : "Create a gym fee item with amount, duration and optional promotion."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-900">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              className={lightInputClassName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-slate-900">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={formData.amount}
              onChange={(e) =>
                onChange({ ...formData, amount: Number(e.target.value) })
              }
              className={lightInputClassName}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-slate-900">
                Duration
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) =>
                  onChange({
                    ...formData,
                    duration: Number(e.target.value) || 1,
                  })
                }
                className={lightInputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900">Duration Unit</Label>
              <Select
                value={formData.durationUnit}
                onValueChange={(value) =>
                  onChange({ ...formData, durationUnit: value as DurationUnit })
                }
              >
                <SelectTrigger className={lightSelectTriggerClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={lightSelectContentClassName}>
                  <SelectItem value="days" className={lightSelectItemClassName}>
                    Days
                  </SelectItem>
                  <SelectItem
                    value="months"
                    className={lightSelectItemClassName}
                  >
                    Months
                  </SelectItem>
                  <SelectItem
                    value="years"
                    className={lightSelectItemClassName}
                  >
                    Years
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-900">Promotion Type</Label>
              <Select
                value={formData.promotionType}
                onValueChange={(value) =>
                  onChange({
                    ...formData,
                    promotionType: value as GymFeeFormState["promotionType"],
                  })
                }
              >
                <SelectTrigger className={lightSelectTriggerClassName}>
                  <SelectValue placeholder="No promotion" />
                </SelectTrigger>
                <SelectContent className={lightSelectContentClassName}>
                  <SelectItem value="none" className={lightSelectItemClassName}>
                    None
                  </SelectItem>
                  <SelectItem
                    value="percentage"
                    className={lightSelectItemClassName}
                  >
                    Percentage
                  </SelectItem>
                  <SelectItem value="mmk" className={lightSelectItemClassName}>
                    MMK
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promotionValue" className="text-slate-900">
                Promotion Value
              </Label>
              <Input
                id="promotionValue"
                type="number"
                min="0"
                value={formData.promotionValue}
                onChange={(e) =>
                  onChange({
                    ...formData,
                    promotionValue:
                      e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                placeholder="10"
                className={lightInputClassName}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-black/10 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Active</p>
              <p className="text-xs text-slate-500">
                Toggle gym fee visibility
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                onChange({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-black/20 bg-white text-emerald-600 focus:ring-black/10"
            />
          </div>
        </div>
        <DialogFooter className={lightDialogFooterClassName}>
          <Button
            type="button"
            onClick={onSubmit}
            className={`cursor-pointer ${lightSelectItemClassName}`}
          >
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
