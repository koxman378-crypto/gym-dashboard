"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  User as UserIcon,
} from "lucide-react";
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
  useGetAllTrainersQuery,
  useUpdateTrainerFeesMutation,
  useToggleTrainerFeeItemMutation,
} from "@/src/store/services/usersApi";
import type { User } from "@/src/types/type";
import type {
  DurationUnit,
  PromotionType,
  TrainerFeeItem,
} from "@/src/types/extended-types";

interface FeeFormItem {
  _id?: string;
  duration: number;
  durationUnit: DurationUnit;
  amount: number;
  promotionType?: PromotionType | null;
  promotionValue?: number | null;
  isActive: boolean;
}

const calculateFinalPrice = (item: FeeFormItem): number => {
  if (!item.promotionType || !item.promotionValue) return item.amount;
  if (item.promotionType === "percentage") {
    return Math.round(item.amount - (item.amount * item.promotionValue) / 100);
  }
  if (item.promotionType === "mmk") {
    return Math.max(0, item.amount - item.promotionValue);
  }
  return item.amount;
};

export default function TrainerFeesPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<User | null>(null);
  const [formData, setFormData] = useState<FeeFormItem[]>([]);

  const { data: trainers = [], isLoading } = useGetAllTrainersQuery();
  const [updateTrainerFees] = useUpdateTrainerFeesMutation();
  const [toggleItem] = useToggleTrainerFeeItemMutation();

  const addFeeRow = () => {
    setFormData([
      ...formData,
      {
        duration: 1,
        durationUnit: "months",
        amount: 0,
        promotionType: null,
        promotionValue: null,
        isActive: true,
      },
    ]);
  };

  const updateFeeRow = (
    index: number,
    field: keyof FeeFormItem,
    value: any,
  ) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  const removeFeeRow = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const handleEdit = (trainer: User) => {
    setSelectedTrainer(trainer);
    if (trainer.trainerFees && trainer.trainerFees.length > 0) {
      setFormData(
        trainer.trainerFees.map((fee: TrainerFeeItem) => ({
          _id: fee._id,
          duration: fee.duration,
          durationUnit: fee.durationUnit as DurationUnit,
          amount: fee.amount,
          promotionType: (fee.promotionType as PromotionType) ?? null,
          promotionValue: fee.promotionValue ?? null,
          isActive: fee.isActive,
        })),
      );
    } else {
      setFormData([
        {
          duration: 1,
          durationUnit: "months",
          amount: 0,
          promotionType: null,
          promotionValue: null,
          isActive: true,
        },
      ]);
    }
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTrainer) return;
    try {
      await updateTrainerFees({
        trainerId: selectedTrainer._id,
        trainerFees: formData.map((fee) => ({
          duration: fee.duration,
          durationUnit: fee.durationUnit,
          amount: fee.amount,
          promotionType: fee.promotionType ?? null,
          promotionValue: fee.promotionValue ?? null,
          isActive: fee.isActive,
        })),
      }).unwrap();
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to update trainer fees");
    }
  };

  const handleToggleItem = async (trainerId: string, feeId: string) => {
    try {
      await toggleItem({ trainerId, feeId }).unwrap();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to toggle fee item");
    }
  };

  const resetForm = () => {
    setFormData([]);
    setSelectedTrainer(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F172B]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172B]">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Trainer Fees Management
            </h1>
            <p className="text-slate-400 mt-2 text-base">
              Manage fee tiers and promotional pricing for each trainer
            </p>
          </div>
        </div>

        {/* Trainers Grid */}
        <div className="grid gap-6">
          {trainers.length === 0 ? (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="rounded-full bg-slate-700 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Trainers Found
                </h3>
                <p className="text-slate-400">
                  Create trainers in the staff management section first
                </p>
              </div>
            </div>
          ) : (
            trainers.map((trainer) => (
              <div
                key={trainer._id}
                className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Trainer Header */}
                <div className="bg-[#0F172B] border-b border-slate-700 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="rounded-full bg-blue-100 p-2">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {trainer.name}
                          </h2>
                          <p className="text-sm text-slate-400">
                            {trainer.email}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            (trainer.trainerFees?.length ?? 0) > 0
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-600 text-slate-300"
                          }`}
                        >
                          {trainer.trainerFees?.length ?? 0} tier
                          {(trainer.trainerFees?.length ?? 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(trainer)}
                        className="border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                      >
                        <Edit className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-semibold">
                          {(trainer.trainerFees?.length ?? 0) > 0
                            ? "Edit Fees"
                            : "Add Fees"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Fee Table */}
                <div className="p-6">
                  {trainer.trainerFees && trainer.trainerFees.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                              Duration
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                              Base Amount
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                              Promotion
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                              Final Price
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                              Status
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {trainer.trainerFees.map((fee, index) => {
                            const finalPrice = calculateFinalPrice(
                              fee as FeeFormItem,
                            );
                            const hasPromotion =
                              fee.promotionType && fee.promotionValue;
                            return (
                              <tr
                                key={fee._id}
                                className={`border-b border-slate-100 hover:bg-slate-800 transition-colors ${
                                  index === trainer.trainerFees!.length - 1
                                    ? "border-b-0"
                                    : ""
                                }`}
                              >
                                <td className="py-4 px-4">
                                  <span className="font-medium text-white">
                                    {fee.duration} {fee.durationUnit}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <span
                                    className={`text-slate-300 ${
                                      hasPromotion
                                        ? "line-through text-sm"
                                        : "font-semibold"
                                    }`}
                                  >
                                    {fee.amount.toLocaleString()} MMK
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  {hasPromotion ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-semibold">
                                      -{fee.promotionValue}
                                      {fee.promotionType === "percentage"
                                        ? "%"
                                        : " MMK"}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-sm">
                                      No promotion
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 px-4">
                                  <span className="text-lg font-bold text-white">
                                    {finalPrice.toLocaleString()} MMK
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                      fee.isActive
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-slate-600 text-slate-300"
                                    }`}
                                  >
                                    {fee.isActive ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleToggleItem(trainer._id, fee._id!)
                                    }
                                    disabled={!fee._id}
                                    className={
                                      fee.isActive
                                        ? "border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700"
                                        : "border-slate-600 hover:bg-slate-700 text-slate-400"
                                    }
                                  >
                                    {fee.isActive ? (
                                      <>
                                        <ToggleRight className="h-4 w-4 mr-1.5" />
                                        <span className="text-xs font-semibold">
                                          Active
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <ToggleLeft className="h-4 w-4 mr-1.5" />
                                        <span className="text-xs font-semibold">
                                          Inactive
                                        </span>
                                      </>
                                    )}
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-slate-600 rounded-xl">
                      <p className="text-slate-400 mb-3">
                        No fee tiers configured yet.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(trainer)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Fees
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditDialogOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedTrainer
                ? `Edit Fees — ${selectedTrainer.name}`
                : "Edit Trainer Fees"}
            </DialogTitle>
            <DialogDescription className="text-base">
              Configure fee tiers and promotional offers for this trainer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">
                  Fee Tiers ({formData.length})
                </Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={addFeeRow}
                  className="bg-slate-100 text-slate-900 hover:bg-white"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Tier
                </Button>
              </div>

              <div className="space-y-3">
                {formData.map((fee, index) => {
                  const finalPrice = calculateFinalPrice(fee);
                  const hasPromotion = fee.promotionType && fee.promotionValue;

                  return (
                    <div
                      key={index}
                      className="border border-slate-700 rounded-xl p-5 space-y-4 bg-[#0F172B]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-slate-300">
                          Tier {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeeRow(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-slate-400">
                            Duration *
                          </Label>
                          <Input
                            type="number"
                            value={fee.duration}
                            onChange={(e) =>
                              updateFeeRow(
                                index,
                                "duration",
                                parseInt(e.target.value) || 1,
                              )
                            }
                            min={1}
                            className="border-slate-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-slate-400">
                            Unit *
                          </Label>
                          <Select
                            value={fee.durationUnit}
                            onValueChange={(value: DurationUnit) =>
                              updateFeeRow(index, "durationUnit", value)
                            }
                          >
                            <SelectTrigger className="border-slate-600">
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

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-400">
                          Amount (MMK) *
                        </Label>
                        <Input
                          type="number"
                          value={fee.amount}
                          onChange={(e) =>
                            updateFeeRow(
                              index,
                              "amount",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          placeholder="50000"
                          min={0}
                          className="border-slate-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-slate-400">
                            Promotion Type
                          </Label>
                          <Select
                            value={fee.promotionType || "none"}
                            onValueChange={(value) =>
                              updateFeeRow(
                                index,
                                "promotionType",
                                value === "none"
                                  ? null
                                  : (value as PromotionType),
                              )
                            }
                          >
                            <SelectTrigger className="border-slate-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Promotion</SelectItem>
                              <SelectItem value="percentage">
                                Percentage (%)
                              </SelectItem>
                              <SelectItem value="mmk">
                                Fixed Amount (MMK)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-slate-400">
                            Discount Value
                          </Label>
                          <Input
                            type="number"
                            value={fee.promotionValue || ""}
                            onChange={(e) =>
                              updateFeeRow(
                                index,
                                "promotionValue",
                                parseFloat(e.target.value) || null,
                              )
                            }
                            placeholder={
                              fee.promotionType === "percentage" ? "10" : "5000"
                            }
                            disabled={!fee.promotionType}
                            min={0}
                            className="border-slate-600"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`active-${index}`}
                            checked={fee.isActive}
                            onChange={(e) =>
                              updateFeeRow(index, "isActive", e.target.checked)
                            }
                            className="w-4 h-4 text-white border-slate-600 rounded focus:ring-slate-500"
                          />
                          <Label
                            htmlFor={`active-${index}`}
                            className="font-semibold cursor-pointer"
                          >
                            Set as Active Tier
                          </Label>
                        </div>
                        {hasPromotion && (
                          <div className="text-right">
                            <div className="text-xs text-slate-400">
                              Final Price
                            </div>
                            <div className="text-lg font-bold text-emerald-600">
                              {finalPrice.toLocaleString()} MMK
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {formData.length === 0 && (
                <div className="text-center py-8 border border-dashed border-slate-600 rounded-xl">
                  <p className="text-slate-400 mb-3">
                    No fee tiers configured. Click "Add Tier" to start.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={formData.length === 0}
              className="bg-slate-100 text-slate-900 hover:bg-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

