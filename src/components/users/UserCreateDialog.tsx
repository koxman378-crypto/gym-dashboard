"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Role, type CreateUserDto } from "@/src/types/type";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface UserCreateDialogProps {
  currentUserRole: Role;
  onCreate: (data: CreateUserDto) => Promise<void>;
}

const defaultForm: CreateUserDto = {
  email: "",
  password: "",
  name: "",
  nickname: "",
  phone: "",
  age: undefined,
  role: Role.CUSTOMER,
  bodyMeasurements: undefined,
};

export function UserCreateDialog({
  currentUserRole,
  onCreate,
}: UserCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateUserDto>(defaultForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedFormData = { ...formData };
    if (cleanedFormData.bodyMeasurements) {
      const hasAny = Object.values(cleanedFormData.bodyMeasurements).some(
        (val) => val !== undefined,
      );
      if (!hasAny) cleanedFormData.bodyMeasurements = undefined;
    }
    await onCreate(cleanedFormData);
    setOpen(false);
    setFormData(defaultForm);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`px-6 py-6 cursor-pointer text-base font-semibold shadow-sm ${lightButtonClassName}`}
        >
          <Plus className="mr-2 h-5 w-5" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className={lightDialogContentClassName}>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. Fill in the required information
            below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name" className="text-slate-900">
              Name *
            </Label>
            <Input
              id="create-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className={lightInputClassName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-email" className="text-slate-900">
              Email *
            </Label>
            <Input
              id="create-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className={lightInputClassName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-password" className="text-slate-900">
              Password *
            </Label>
            <Input
              id="create-password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className={lightInputClassName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-nickname" className="text-slate-900">
              Nickname
            </Label>
            <Input
              id="create-nickname"
              value={formData.nickname || ""}
              onChange={(e) =>
                setFormData({ ...formData, nickname: e.target.value })
              }
              className={lightInputClassName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-phone" className="text-slate-900">
              Phone
            </Label>
            <Input
              id="create-phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className={lightInputClassName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-age" className="text-slate-900">
              Age
            </Label>
            <Input
              id="create-age"
              type="number"
              value={formData.age || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  age: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className={lightInputClassName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-role" className="text-slate-900">
              Role *
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: Role) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger className={lightSelectTriggerClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={lightSelectContentClassName}>
                <SelectItem
                  value={Role.CUSTOMER}
                  className={lightSelectItemClassName}
                >
                  Customer
                </SelectItem>
                {(currentUserRole === Role.OWNER ||
                  currentUserRole === Role.CASHIER) && (
                  <SelectItem
                    value={Role.TRAINER}
                    className={lightSelectItemClassName}
                  >
                    Trainer
                  </SelectItem>
                )}
                {currentUserRole === Role.OWNER && (
                  <SelectItem
                    value={Role.CASHIER}
                    className={lightSelectItemClassName}
                  >
                    Cashier
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Body Measurements */}
          <div className="space-y-3 border-t border-black/10 pt-4">
            <h4 className="text-sm font-medium text-slate-900">
              Body Measurements (Optional)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { id: "height", label: "Height (cm)", placeholder: "170" },
                  { id: "weight", label: "Weight (kg)", placeholder: "70" },
                  { id: "bodyFat", label: "Body Fat (%)", placeholder: "15" },
                  { id: "chest", label: "Chest (cm)", placeholder: "100" },
                  { id: "waist", label: "Waist (cm)", placeholder: "80" },
                  { id: "biceps", label: "Biceps (cm)", placeholder: "35" },
                  { id: "leg", label: "Leg (cm)", placeholder: "55" },
                ] as const
              ).map(({ id, label, placeholder }) => (
                <div key={id} className="space-y-2">
                  <Label htmlFor={`create-${id}`} className="text-slate-900">
                    {label}
                  </Label>
                  <Input
                    id={`create-${id}`}
                    type="number"
                    placeholder={placeholder}
                    value={formData.bodyMeasurements?.[id] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bodyMeasurements: {
                          ...formData.bodyMeasurements,
                          [id]: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      })
                    }
                    className={lightInputClassName}
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className={lightDialogFooterClassName}>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className={`cursor-pointer ${lightButtonClassName}`}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className={`min-w-36 cursor-pointer font-semibold ${lightButtonClassName}`}
            >
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
