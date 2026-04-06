"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  useCreateGymFeeRecordMutation,
  useDeleteGymFeeRecordMutation,
  useGetAllGymFeeRecordsQuery,
  useUpdateGymFeeRecordMutation,
} from "@/src/store/services/customFeesApi";
import type {
  GymFeeRecord,
  CreateGymFeeRecordDto,
  DurationUnit,
  PromotionType,
} from "@/src/types/extended-types";

type GymFeeFormState = {
  name: string;
  amount: number;
  duration: number;
  durationUnit: DurationUnit;
  promotionType: Exclude<PromotionType, null> | "none";
  promotionValue: number | "";
  isActive: boolean;
};

const emptyFormState: GymFeeFormState = {
  name: "",
  amount: 0,
  duration: 1,
  durationUnit: "months",
  promotionType: "none",
  promotionValue: "",
  isActive: true,
};

export default function GymPricesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<GymFeeRecord | null>(null);
  const [formData, setFormData] = useState<GymFeeFormState>(emptyFormState);

  const { data: gymFees = [], isLoading } = useGetAllGymFeeRecordsQuery({
    active: undefined,
  });
  const [createFee] = useCreateGymFeeRecordMutation();
  const [updateFee] = useUpdateGymFeeRecordMutation();
  const [deleteFee] = useDeleteGymFeeRecordMutation();

  const resetForm = () => {
    setFormData(emptyFormState);
    setSelectedFee(null);
  };

  const handleCreate = async () => {
    try {
      const payload: CreateGymFeeRecordDto = {
        name: formData.name.trim(),
        amount: formData.amount,
        duration: formData.duration,
        durationUnit: formData.durationUnit,
        promotionType:
          formData.promotionType === "none" ? undefined : formData.promotionType,
        promotionValue:
          formData.promotionValue === "" ? undefined : formData.promotionValue,
        isActive: formData.isActive,
      };

      await createFee(payload).unwrap();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to create gym fee");
    }
  };

  const handleEdit = (fee: GymFeeRecord) => {
    setSelectedFee(fee);
    setFormData({
      name: fee.name,
      amount: fee.amount,
      duration: fee.duration,
      durationUnit: fee.durationUnit,
      promotionType: fee.promotionType ?? "none",
      promotionValue: fee.promotionValue ?? "",
      isActive: fee.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedFee?._id) return;

    try {
      await updateFee({
        id: selectedFee._id,
        data: {
          name: formData.name.trim(),
          amount: formData.amount,
          duration: formData.duration,
          durationUnit: formData.durationUnit,
          promotionType:
            formData.promotionType === "none"
              ? undefined
              : formData.promotionType,
          promotionValue:
            formData.promotionValue === "" ? undefined : formData.promotionValue,
          isActive: formData.isActive,
        },
      }).unwrap();
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to update gym fee");
    }
  };

  const handleDelete = async (fee: GymFeeRecord) => {
    if (!fee._id) return;
    if (!confirm(`Delete ${fee.name}?`)) return;
    try {
      await deleteFee(fee._id).unwrap();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to delete gym fee");
    }
  };

  const handleToggle = async (fee: GymFeeRecord) => {
    if (!fee._id) return;
    try {
      await updateFee({
        id: fee._id,
        data: { isActive: !fee.isActive },
      }).unwrap();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to update gym fee");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172B] p-6 text-white">
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800 p-6">
        <div>
          <h1 className="text-3xl font-bold">Gym Prices</h1>
          <p className="mt-1 text-slate-400">
            Create flat gym fee items with amount, duration and promotion.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Fee
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-800">
        {isLoading ? (
          <div className="p-6 text-center text-slate-300">Loading...</div>
        ) : gymFees.length === 0 ? (
          <div className="p-6 text-center text-slate-300">No gym fees found</div>
        ) : (
          <div className="divide-y divide-slate-700">
            {gymFees.map((fee) => (
              <div
                key={fee._id}
                className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-semibold">{fee.name}</div>
                  <div className="text-sm text-slate-400">
                    {fee.amount.toLocaleString()} MMK per {fee.duration}{" "}
                    {fee.durationUnit}
                  </div>
                  <div className="text-xs text-slate-500">
                    {fee.promotionType && fee.promotionValue !== null
                      ? fee.promotionType === "percentage"
                        ? `${fee.promotionValue}% promotion`
                        : `${Number(fee.promotionValue).toLocaleString()} MMK promotion`
                      : "No promotion"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggle(fee)}
                  >
                    {fee.isActive ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(fee)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(fee)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      fee.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-600 text-slate-300"
                    }`}
                  >
                    {fee.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Gym Fee" : "Add Gym Fee"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Update the gym fee item."
                : "Create a gym fee item with amount, duration and optional promotion."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: Number(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Duration Unit</Label>
                <Select
                  value={formData.durationUnit}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      durationUnit: value as DurationUnit,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Promotion Type</Label>
                <Select
                  value={formData.promotionType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      promotionType: value as GymFeeFormState["promotionType"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No promotion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="mmk">MMK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotionValue">Promotion Value</Label>
                <Input
                  id="promotionValue"
                  type="number"
                  min="0"
                  value={formData.promotionValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      promotionValue:
                        e.target.value === ""
                          ? ""
                          : Number(e.target.value),
                    })
                  }
                  placeholder="10"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-[#0F172B] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-200">Active</p>
                <p className="text-xs text-slate-400">
                  Toggle gym fee visibility
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={isEditDialogOpen ? handleUpdate : handleCreate}
            >
              {isEditDialogOpen ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
