"use client";

import { Role, type User } from "@/src/types/type";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  lightButtonClassName,
  lightDialogContentClassName,
  lightDialogFooterClassName,
  lightInputClassName,
  lightSelectContentClassName,
  lightSelectItemClassName,
  lightSelectTriggerClassName,
} from "./users.constants";

export interface EditFormData {
  email: string;
  name: string;
  phone: string;
  age: number | "" | undefined;
  assignedTrainer: string;
  bodyMeasurements?: {
    height?: number;
    weight?: number;
    bodyFat?: number;
    chest?: number;
    waist?: number;
    biceps?: number;
    leg?: number;
  };
}

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: User | null;
  formData: EditFormData;
  onFormChange: (data: EditFormData) => void;
  trainers: User[];
  onSubmit: (e: React.FormEvent) => void;
}

const MEASUREMENT_FIELDS = [
  { id: "height" as const, label: "Height (cm)", placeholder: "170" },
  { id: "weight" as const, label: "Weight (kg)", placeholder: "70" },
  { id: "bodyFat" as const, label: "Body Fat (%)", placeholder: "15" },
  { id: "chest" as const, label: "Chest (cm)", placeholder: "100" },
  { id: "waist" as const, label: "Waist (cm)", placeholder: "80" },
  { id: "biceps" as const, label: "Biceps (cm)", placeholder: "35" },
  { id: "leg" as const, label: "Leg (cm)", placeholder: "55" },
];

export function UserEditDialog({
  open,
  onOpenChange,
  selectedUser,
  formData,
  onFormChange,
  trainers,
  onSubmit,
}: UserEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={lightDialogContentClassName}>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Edit name, email, phone, and age.
          </DialogDescription>
        </DialogHeader>
        {selectedUser && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-slate-900">
                Name *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  onFormChange({ ...formData, name: e.target.value })
                }
                required
                className={lightInputClassName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-slate-900">
                Email *
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  onFormChange({ ...formData, email: e.target.value })
                }
                required
                className={lightInputClassName}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-slate-900">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) =>
                    onFormChange({ ...formData, phone: e.target.value })
                  }
                  className={lightInputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-age" className="text-slate-900">
                  Age
                </Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) =>
                    onFormChange({
                      ...formData,
                      age: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  placeholder="0000"
                  className={lightInputClassName}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900">Role</Label>
              <Input
                value={selectedUser.role}
                disabled
                className={`capitalize ${lightInputClassName}`}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900">Status</Label>
              <Input
                value={selectedUser.isActive ? "Active" : "Inactive"}
                disabled
                className={lightInputClassName}
              />
            </div>

            {selectedUser.role === Role.CUSTOMER && (
              <div className="space-y-2">
                <Label htmlFor="edit-trainer" className="text-slate-900">
                  Assign Trainer (Optional)
                </Label>
                <Select
                  value={formData.assignedTrainer}
                  onValueChange={(value) =>
                    onFormChange({ ...formData, assignedTrainer: value })
                  }
                >
                  <SelectTrigger className={lightSelectTriggerClassName}>
                    <SelectValue placeholder="Select a trainer" />
                  </SelectTrigger>
                  <SelectContent className={lightSelectContentClassName}>
                    <SelectItem
                      value="none"
                      className={lightSelectItemClassName}
                    >
                      No Trainer
                    </SelectItem>
                    {trainers.map((trainer) => (
                      <SelectItem
                        key={trainer._id}
                        value={trainer._id}
                        className={lightSelectItemClassName}
                      >
                        {trainer.nickname || trainer.name} ({trainer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedUser.role === Role.CUSTOMER && (
              <div className="space-y-3 border-t border-black/10 pt-4">
                <h4 className="text-sm font-medium text-slate-900">
                  Body Measurements (Optional)
                </h4>
                <p className="text-xs text-slate-500">
                  Update the customer's body measurements
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {MEASUREMENT_FIELDS.map(({ id, label, placeholder }) => (
                    <div key={id} className="space-y-2">
                      <Label htmlFor={`edit-${id}`} className="text-slate-900">
                        {label}
                      </Label>
                      <Input
                        id={`edit-${id}`}
                        type="number"
                        placeholder={placeholder}
                        value={formData.bodyMeasurements?.[id] || ""}
                        onChange={(e) =>
                          onFormChange({
                            ...formData,
                            bodyMeasurements: {
                              ...formData.bodyMeasurements,
                              [id]:
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                            },
                          })
                        }
                        className={lightInputClassName}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className={lightDialogFooterClassName}>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={lightButtonClassName}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className={lightButtonClassName}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
