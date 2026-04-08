"use client";

import { Plus, Trash2 } from "lucide-react";
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

const lightDialogContentClassName =
  "max-w-3xl max-h-[90vh] overflow-y-auto border border-black/15 bg-white text-slate-900 shadow-2xl ring-black/10";
const lightDialogFooterClassName = "border-black/10 bg-slate-50";
const lightButtonClassName =
  "border border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-sm";
const lightInputClassName =
  "border-black/20 bg-white text-slate-900 placeholder:text-slate-500 hover:border-black/40 focus-visible:border-slate-900 focus-visible:ring-black/10";

export interface FeeFormItem {
  _id?: string;
  amount: number;
  isActive: boolean;
}

interface TrainerFeeEditDialogProps {
  open: boolean;
  selectedTrainer: User | null;
  formData: FeeFormItem[];
  onOpenChange: (open: boolean) => void;
  onAddRow: () => void;
  onUpdateRow: (index: number, field: keyof FeeFormItem, value: any) => void;
  onRemoveRow: (index: number) => void;
  onSave: () => void;
}

export function TrainerFeeEditDialog({
  open,
  selectedTrainer,
  formData,
  onOpenChange,
  onAddRow,
  onUpdateRow,
  onRemoveRow,
  onSave,
}: TrainerFeeEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={lightDialogContentClassName}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {selectedTrainer
              ? `Edit Fees — ${selectedTrainer.name}`
              : "Edit Trainer Fees"}
          </DialogTitle>
          <DialogDescription className="text-base">
            Configure amount-only fee items for this trainer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">
                Fee Items ({formData.length})
              </Label>
              <Button
                type="button"
                size="sm"
                onClick={onAddRow}
                className={lightButtonClassName}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {formData.map((fee, index) => (
                <div
                  key={index}
                  className="space-y-4 rounded-xl border border-black/10 bg-slate-50 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-700">
                      Item {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveRow(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">
                      Amount (MMK) *
                    </Label>
                    <Input
                      type="number"
                      value={fee.amount}
                      onChange={(e) =>
                        onUpdateRow(
                          index,
                          "amount",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="50000"
                      min={0}
                      className={lightInputClassName}
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-black/10 pt-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`active-${index}`}
                        checked={fee.isActive}
                        onChange={(e) =>
                          onUpdateRow(index, "isActive", e.target.checked)
                        }
                        className="h-4 w-4 rounded border-black/20 bg-white text-slate-900 focus:ring-black/10"
                      />
                      <Label
                        htmlFor={`active-${index}`}
                        className="font-semibold cursor-pointer"
                      >
                        Set as Active Item
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.length === 0 && (
              <div className="rounded-xl border border-dashed border-black/20 py-8 text-center">
                <p className="mb-3 text-slate-500">
                  No fee items configured. Click "Add Item" to start.
                </p>
              </div>
            )}
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
          <Button
            onClick={onSave}
            disabled={formData.length === 0}
            className={lightButtonClassName}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
