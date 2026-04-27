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
  "border border-gray-200 bg-white text-foreground hover:border-gray-300 focus:border-gray-300 focus:ring-0";
const lightSelectContentClassName =
  "border border-gray-200 bg-white text-foreground shadow-sm";
const lightSelectItemClassName =
  "text-foreground focus:bg-gray-100 hover:bg-gray-100";
const lightDialogContentClassName =
  "border border-gray-200 bg-white text-foreground shadow-2xl";
const lightDialogFooterClassName = "border-t border-gray-200 bg-white";
const lightButtonClassName =
  "border border-gray-200 bg-white text-foreground hover:bg-gray-50 hover:text-foreground shadow-sm";
const lightInputClassName =
  "border border-gray-200 bg-white text-foreground placeholder:text-muted-foreground hover:border-gray-300 focus:border-gray-300 focus:ring-0";

export type GymFeeFormState = {
  name: string;
  amount: number | "";
  duration: number | "";
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
            <Label htmlFor="name" className="text-foreground">
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
            <Label htmlFor="amount" className="text-foreground">
              Amount
            </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  onChange({
                    ...formData,
                    amount: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className={lightInputClassName}
              />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-foreground">
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
                    duration:
                      e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className={lightInputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Duration Unit</Label>
              <Select
                value={formData.durationUnit}
                onValueChange={(value) =>
                  onChange({ ...formData, durationUnit: value as DurationUnit })
                }
              >
                <SelectTrigger className={lightSelectTriggerClassName}>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className={lightSelectContentClassName}>
                  <SelectItem value="days" className={lightSelectItemClassName}>
                    Days
                  </SelectItem>
                  <SelectItem value="months" className={lightSelectItemClassName}>
                    Months
                  </SelectItem>
                  <SelectItem value="years" className={lightSelectItemClassName}>
                    Years
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Promotion Type</Label>
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
                  <SelectItem value="percentage" className={lightSelectItemClassName}>
                    Percentage
                  </SelectItem>
                  <SelectItem value="mmk" className={lightSelectItemClassName}>
                    MMK
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promotionValue" className="text-foreground">
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
                placeholder="0000"
                className={lightInputClassName}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">
                Toggle gym fee visibility
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                onChange({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-border bg-background text-emerald-600 focus:ring-ring/20"
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
