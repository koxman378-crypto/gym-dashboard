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
import type { ExpiryPresetFormState } from "@/src/store/slices/expiryPresetsSlice";

const lightDialogContentClassName =
  "border border-black/15 bg-white text-slate-900 shadow-2xl ring-black/10";
const lightInputClassName =
  "border-black/20 bg-white text-slate-900 placeholder:text-slate-500 hover:border-black/40 focus-visible:border-slate-900 focus-visible:ring-black/10";
const lightButtonClassName =
  "border border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-sm";

interface ExpiryPresetFormDialogProps {
  open: boolean;
  isEdit: boolean;
  formData: ExpiryPresetFormState;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (data: Partial<ExpiryPresetFormState>) => void;
  onSubmit: () => void;
}

export function ExpiryPresetFormDialog({
  open,
  isEdit,
  formData,
  isLoading,
  onOpenChange,
  onChange,
  onSubmit,
}: ExpiryPresetFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={lightDialogContentClassName}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Expiry Preset" : "Add Expiry Preset"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the label and number of days."
              : "Create a preset for the subscription expiry filter dropdown."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preset-label" className="text-slate-900">
              Label
            </Label>
            <Input
              id="preset-label"
              value={formData.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder='e.g. "Within 10 days"'
              className={lightInputClassName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset-days" className="text-slate-900">
              Days
            </Label>
            <Input
              id="preset-days"
              type="number"
              min={1}
              value={formData.days}
              onChange={(e) =>
                onChange({
                  days: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              placeholder="0000"
              className={lightInputClassName}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={lightButtonClassName}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isLoading ||
              !formData.label.trim() ||
              formData.days === "" ||
              Number(formData.days) < 1
            }
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            {isLoading ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
