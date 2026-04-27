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
  "max-w-xl border border-border bg-background text-foreground shadow-2xl ring-ring/20";
const lightDialogFooterClassName = "border-border bg-muted";
const lightButtonClassName =
  "border border-border bg-background text-foreground hover:bg-muted hover:text-foreground shadow-sm";
const lightInputClassName =
  "border-border bg-background text-foreground placeholder:text-muted-foreground hover:border-ring focus-visible:border-ring focus-visible:ring-ring/20";

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

          <div className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Active fee</p>
              <p className="text-xs text-muted-foreground">
                Active fees can be used in subscriptions.
              </p>
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => onActiveChange(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-background text-foreground focus:ring-ring/20"
              />
              <span className="text-sm font-medium text-foreground">
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
