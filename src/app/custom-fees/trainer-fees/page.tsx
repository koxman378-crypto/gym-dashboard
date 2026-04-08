"use client";

import { useState } from "react";
import { User as UserIcon } from "lucide-react";
import {
  useGetAllTrainersQuery,
  useUpdateTrainerFeesMutation,
  useUpdateTrainerFeeItemMutation,
} from "@/src/store/services/usersApi";
import type { User } from "@/src/types/type";
import type { TrainerFeeItem } from "@/src/types/extended-types";
import { TrainerCard } from "@/src/components/custom-fees/trainer-fees/TrainerCard";
import {
  TrainerFeeEditDialog,
  type FeeFormItem,
} from "@/src/components/custom-fees/trainer-fees/TrainerFeeEditDialog";

const lightSurfaceClassName =
  "border border-black/15 bg-white text-slate-900 shadow-sm";

export default function TrainerFeesPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<User | null>(null);
  const [formData, setFormData] = useState<FeeFormItem[]>([]);

  const { data: trainers = [], isLoading } = useGetAllTrainersQuery();
  const [updateTrainerFees] = useUpdateTrainerFeesMutation();
  const [updateTrainerFeeItem] = useUpdateTrainerFeeItemMutation();

  const addFeeRow = () => {
    setFormData([...formData, { amount: 0, isActive: true }]);
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
          amount: fee.amount,
          isActive: fee.isActive,
        })),
      );
    } else {
      setFormData([{ amount: 0, isActive: true }]);
    }
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTrainer) return;
    try {
      await updateTrainerFees({
        trainerId: selectedTrainer._id,
        trainerFees: formData.map((fee) => ({
          amount: fee.amount,
          isActive: fee.isActive,
        })),
      }).unwrap();
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to update trainer fees");
    }
  };

  // Uses PUT /users/:id/trainer-fees/:feeId â€” the existing backend endpoint
  const handleToggleItem = async (trainerId: string, feeId: string) => {
    try {
      const trainer = trainers.find((t) => t._id === trainerId);
      if (!trainer || !trainer.trainerFees) return;

      const fee = trainer.trainerFees.find((f) => f._id === feeId);
      if (!fee) return;

      await updateTrainerFeeItem({
        trainerId,
        feeId,
        feeData: {
          amount: fee.amount,
          isActive: !fee.isActive,
        },
      }).unwrap();
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-slate-900"></div>
          <p className="mt-4 text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        <div className={`rounded-2xl p-8 ${lightSurfaceClassName}`}>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Trainer Fees Management
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Manage trainer fee items for each trainer
          </p>
        </div>

        <div className="grid gap-6">
          {trainers.length === 0 ? (
            <div
              className={`rounded-2xl p-12 text-center ${lightSurfaceClassName}`}
            >
              <div className="max-w-md mx-auto">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-slate-100 p-4">
                  <UserIcon className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  No Trainers Found
                </h3>
                <p className="text-slate-600">
                  Create trainers in the staff management section first
                </p>
              </div>
            </div>
          ) : (
            trainers.map((trainer) => (
              <TrainerCard
                key={trainer._id}
                trainer={trainer}
                onEdit={handleEdit}
                onToggleFee={handleToggleItem}
              />
            ))
          )}
        </div>
      </div>

      <TrainerFeeEditDialog
        open={isEditDialogOpen}
        selectedTrainer={selectedTrainer}
        formData={formData}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditDialogOpen(false);
            resetForm();
          }
        }}
        onAddRow={addFeeRow}
        onUpdateRow={updateFeeRow}
        onRemoveRow={removeFeeRow}
        onSave={handleSave}
      />
    </div>
  );
}
