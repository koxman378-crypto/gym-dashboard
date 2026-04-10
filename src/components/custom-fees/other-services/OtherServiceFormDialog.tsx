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
import type { CreateOtherServiceDto } from "@/src/types/extended-types";

const lightInputClassName =
  "border-black/20 bg-white text-slate-900 placeholder:text-slate-500 hover:border-black/40 focus-visible:border-slate-900 focus-visible:ring-black/10";
const lightDialogContentClassName =
  "border border-black/15 bg-white text-slate-900 shadow-2xl ring-black/10";
const lightDialogFooterClassName = "border-black/10 bg-slate-50";
const lightButtonClassName =
  "border border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-sm";

interface OtherServiceFormDialogProps {
  open: boolean;
  isEdit: boolean;
  formData: CreateOtherServiceDto;
  onOpenChange: (open: boolean) => void;
  onChange: (data: CreateOtherServiceDto) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function OtherServiceFormDialog({
  open,
  isEdit,
  formData,
  onOpenChange,
  onChange,
  onSubmit,
}: OtherServiceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={lightDialogContentClassName}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Service" : "Add Service"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the service price for each duration unit."
              : "Create a service item with day, month, and year prices."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="amountDays" className="text-slate-900">
                Day Price
              </Label>
              <Input
                id="amountDays"
                type="number"
                min="0"
                placeholder="0000"
                value={formData.amountDays}
                onChange={(e) =>
                  onChange({
                    ...formData,
                    amountDays:
                      e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className={lightInputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountMonths" className="text-slate-900">
                Month Price
              </Label>
              <Input
                id="amountMonths"
                type="number"
                min="0"
                placeholder="0000"
                value={formData.amountMonths}
                onChange={(e) =>
                  onChange({
                    ...formData,
                    amountMonths:
                      e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className={lightInputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountYears" className="text-slate-900">
                Year Price
              </Label>
              <Input
                id="amountYears"
                type="number"
                min="0"
                placeholder="0000"
                value={formData.amountYears}
                onChange={(e) =>
                  onChange({
                    ...formData,
                    amountYears:
                      e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className={lightInputClassName}
              />
            </div>
          </div>
          <DialogFooter className={lightDialogFooterClassName}>
            <Button
              type="submit"
              className={`min-w-32 font-semibold cursor-pointer ${lightButtonClassName}`}
            >
              {isEdit ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
