"use client";

import { Trash2 } from "lucide-react";
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
import type { User } from "@/src/types/type";
import type { FeeFormItem } from "@/src/store/slices/trainerFeesSlice";

const lightDialogContentClassName =
  "max-w-xl border border-black/15 bg-white text-slate-900 shadow-2xl ring-black/10";
const lightDialogFooterClassName = "border-black/10 bg-slate-50";
const lightButtonClassName =
  "border border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-sm";
const lightInputClassName =
  "border-black/20 bg-white text-slate-900 placeholder:text-slate-500 hover:border-black/40 focus-visible:border-slate-900 focus-visible:ring-black/10";

interface TrainerFeeEditDialogProps {
  open: boolean;
  selectedTrainer: User | null;
  formData: FeeFormItem;
  hasExistingFee: boolean;
  onOpenChange: (open: boolean) => void;
  onAmountChange: (amount: number | "") => void;
  onActiveChange: (isActive: boolean) => void;
  onSave: () => void;
  onDelete: () => void;
}

export function TrainerFeeEditDialog({
  open,
  selectedTrainer,
  formData,
  hasExistingFee,
  onOpenChange,
  onAmountChange,
  onActiveChange,
  onSave,
  onDelete,
}: TrainerFeeEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={lightDialogContentClassName}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {selectedTrainer
              ? `Trainer Fee - ${selectedTrainer.name}`
              : "Trainer Fee"}
          </DialogTitle>
          <DialogDescription className="text-base">
            One trainer has one fee amount only. Edit the amount and active
            state here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Fee Amount (MMK) *</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                onAmountChange(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="0000"
              min={0}
              className={lightInputClassName}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-black/10 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Active fee</p>
              <p className="text-xs text-slate-500">
                Active fees can be used in subscriptions.
              </p>
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => onActiveChange(e.target.checked)}
                className="h-4 w-4 rounded border-black/20 bg-white text-slate-900 focus:ring-black/10"
              />
              <span className="text-sm font-medium text-slate-700">
                {formData.isActive ? "Active" : "Inactive"}
              </span>
            </label>
          </div>
        </div>

        <DialogFooter className={`${lightDialogFooterClassName} gap-2`}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={lightButtonClassName}
          >
            Cancel
          </Button>
          {hasExistingFee && (
            <Button
              type="button"
              variant="outline"
              onClick={onDelete}
              className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 shadow-sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
          <Button onClick={onSave} className={lightButtonClassName}>
            {hasExistingFee ? "Update Fee" : "Create Fee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
