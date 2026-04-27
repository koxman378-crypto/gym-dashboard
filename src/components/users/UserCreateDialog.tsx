"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Role, type CreateUserDto, type MultiGymItem } from "@/src/types/type";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { FaUserPlus } from "react-icons/fa";

interface UserCreateDialogProps {
  currentUserRole: Role;
  branches?: MultiGymItem[];
  defaultGymId?: string | null;
  onCreate: (data: CreateUserDto) => Promise<void>;
}

const buildDefaultForm = (defaultGymId?: string | null): CreateUserDto => ({
  email: "",
  password: "",
  name: "",
  nickname: "",
  phone: "",
  age: undefined,
  role: Role.CUSTOMER,
  gymId: defaultGymId ?? undefined,
  bodyMeasurements: undefined,
});

const isPhoneValid = (phone: string) => /^\d{9,11}$/.test(phone.trim());

const validateForm = (formData: CreateUserDto) => {
  const errors: string[] = [];

  if (!formData.name.trim()) errors.push("Name");
  if (!formData.email.trim()) errors.push("Email");
  if (!formData.password.trim()) errors.push("Password");

  const phone = (formData.phone ?? "").trim();
  if (!phone) {
    errors.push("Phone");
  } else if (!isPhoneValid(phone)) {
    errors.push("Phone must be 9 to 11 digits");
  }

  if (
    formData.age === undefined ||
    formData.age === null ||
    Number.isNaN(formData.age)
  ) {
    errors.push("Age");
  } else if (formData.age < 1 || formData.age > 120) {
    errors.push("Age must be between 1 and 120");
  }

  return errors;
};

export function UserCreateDialog({
  currentUserRole,
  branches = [],
  defaultGymId = null,
  onCreate,
  gymFilter,
  onGymFilterChange,
}: UserCreateDialogProps & {
  gymFilter?: string | null;
  onGymFilterChange?: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateUserDto>(
    buildDefaultForm(defaultGymId),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (value: boolean) => {
    if (value) {
      setFormData(buildDefaultForm(defaultGymId));
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(buildDefaultForm(defaultGymId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const missing = validateForm(formData);

    if (missing.length > 0) {
      toast.error(`Please fix: ${missing.join(", ")}`, {
        description: missing.map((f) => `• ${f}`).join("\n"),
        duration: 4000,
      });
      return;
    }

    if (
      currentUserRole === Role.OWNER &&
      formData.role !== Role.OWNER &&
      branches.length > 0 &&
      !formData.gymId
    ) {
      toast.error("Please choose a branch", {
        description:
          "Owner-created staff and customers must be assigned to a branch.",
        duration: 4000,
      });
      return;
    }

    const cleanedFormData = {
      ...formData,
      email: formData.email.trim(),
    };
    if (cleanedFormData.bodyMeasurements) {
      const hasAny = Object.values(cleanedFormData.bodyMeasurements).some(
        (val) => val !== undefined,
      );
      if (!hasAny) cleanedFormData.bodyMeasurements = undefined;
    }

    setIsSubmitting(true);
    try {
      await onCreate(cleanedFormData);
      toast.success("User created successfully!");
      handleClose();
    } catch (error: any) {
      const status = error?.status ?? error?.data?.status;
      const msg: string =
        error?.data?.message || error?.message || "Failed to create user.";
      const isDuplicate =
        status === 409 ||
        msg.toLowerCase().includes("duplicate") ||
        msg.toLowerCase().includes("already exists") ||
        msg.toLowerCase().includes("email");
      toast.error(
        isDuplicate ? "Email already in use" : "Failed to create user",
        {
          description: isDuplicate
            ? "This email address is already registered. Please use a different email."
            : msg,
          duration: 5000,
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-4">
      {currentUserRole === Role.OWNER &&
        branches.length > 0 &&
        onGymFilterChange && (
          <div className="flex items-center gap-2">
            <Label className="text-foreground">Branch:</Label>
            <Select
              value={gymFilter ?? "all"}
              onValueChange={(v) => onGymFilterChange(v === "all" ? null : v)}
            >
              <SelectTrigger className={lightSelectTriggerClassName + " w-44"}>
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent className={lightSelectContentClassName}>
                <SelectItem value="all" className={lightSelectItemClassName}>
                  All Branches
                </SelectItem>
                {branches.map((b) => (
                  <SelectItem
                    key={b._id}
                    value={b._id!}
                    className={lightSelectItemClassName}
                  >
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            className={`px-6 py-6 text-base font-semibold cursor-pointer ${lightButtonClassName}`}
          >
            <FaUserPlus className="mr-2 h-5 w-5" />
            Create User
          </Button>
        </DialogTrigger>
        <DialogContent
          className={lightDialogContentClassName}
          showCloseButton={false}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={handleClose}
        >
          <DialogClose asChild onClick={handleClose}>
            <button
              className="absolute cursor-pointer right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-muted-foreground"
              type="button"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </DialogClose>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. Fill in the required information
              below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name" className="text-foreground">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={lightInputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email" className="text-foreground">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={lightInputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password" className="text-foreground">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={lightInputClassName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-phone" className="text-foreground">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-phone"
                inputMode="numeric"
                value={formData.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, phone: digits });
                }}
                className={lightInputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-age" className="text-foreground">
                Age <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-age"
                type="number"
                min={1}
                max={120}
                value={formData.age || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    age:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
                placeholder="0000"
                className={lightInputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role" className="text-foreground">
                Role <span className="text-red-500">*</span>
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
            {currentUserRole === Role.OWNER && branches.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="create-gym" className="text-foreground">
                  Branch <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gymId ?? "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      gymId: value === "none" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger className={lightSelectTriggerClassName}>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent className={lightSelectContentClassName}>
                    <SelectItem
                      value="none"
                      className={lightSelectItemClassName}
                    >
                      Select branch
                    </SelectItem>
                    {branches.map((branch) => (
                      <SelectItem
                        key={branch._id}
                        value={branch._id ?? branch.name}
                        className={lightSelectItemClassName}
                      >
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Body Measurements */}
            <div className="space-y-3 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground">
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
                    <Label htmlFor={`create-${id}`} className="text-foreground">
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

            <DialogFooter className={lightDialogFooterClassName}>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className={`cursor-pointer ${lightButtonClassName}`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`min-w-36 cursor-pointer font-semibold ${lightButtonClassName}`}
              >
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    // ...existing code...
  );
}
