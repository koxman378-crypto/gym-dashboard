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
import type { CreateOtherServiceDto } from "@/src/types/extended-types";
import type { MultiGymItem } from "@/src/types/type";

const lightInputClassName =
  "border-border bg-background text-foreground placeholder:text-muted-foreground hover:border-ring focus-visible:border-ring focus-visible:ring-ring/20";
const lightDialogContentClassName =
  "border border-border bg-background text-foreground shadow-2xl ring-ring/20";
const lightDialogFooterClassName = "border-border bg-muted";
const lightButtonClassName =
  "border border-border bg-background text-foreground hover:bg-muted hover:text-foreground shadow-sm";

interface OtherServiceFormDialogProps {
  open: boolean;
  isEdit: boolean;
  isOwner: boolean;
  branches: MultiGymItem[];
  selectedGymId: string;
  onSelectedGymIdChange: (gymId: string) => void;
  formData: CreateOtherServiceDto;
  onOpenChange: (open: boolean) => void;
  onChange: (data: CreateOtherServiceDto) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function OtherServiceFormDialog({
  open,
  isEdit,
  isOwner,
  branches,
  selectedGymId,
  onSelectedGymIdChange,
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
          {!isEdit && isOwner && branches.length > 0 && (
            <div className="space-y-2">
              <Label className="text-foreground">
                Branch <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedGymId}
                onValueChange={onSelectedGymIdChange}
              >
                <SelectTrigger className={lightInputClassName}>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select branch</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem
                      key={branch._id ?? branch.name}
                      value={branch._id ?? branch.name}
                    >
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="amountDays" className="text-foreground">
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
              <Label htmlFor="amountMonths" className="text-foreground">
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
              <Label htmlFor="amountYears" className="text-foreground">
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
