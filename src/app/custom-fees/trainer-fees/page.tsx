"use client";

import { User as UserIcon } from "lucide-react";
import {
  useAddTrainerFeeItemMutation,
  useDeleteTrainerFeeItemMutation,
  useGetAllTrainersQuery,
  useUpdateTrainerFeeItemMutation,
} from "@/src/store/services/usersApi";
import type { User } from "@/src/types/type";
import { TrainerCard } from "@/src/components/custom-fees/trainer-fees/TrainerCard";
import { TrainerFeeEditDialog } from "@/src/components/custom-fees/trainer-fees/TrainerFeeEditDialog";
import { useTrainerFeesState } from "@/src/store/hooks/useTrainerFeesState";

const lightSurfaceClassName =
  "border border-black/15 bg-white text-slate-900 shadow-sm";

export default function TrainerFeesPage() {
  const {
    isEditDialogOpen,
    selectedTrainerId,
    formData,
    openEditDialog,
    closeEditDialog,
    updateFeeField,
  } = useTrainerFeesState();

  const { data: trainers = [], isLoading } = useGetAllTrainersQuery();
  const selectedTrainer = selectedTrainerId
    ? (trainers.find((t) => t._id === selectedTrainerId) ?? null)
    : null;
  const currentFee = selectedTrainer?.trainerFees?.[0] ?? null;

  const [addTrainerFeeItem] = useAddTrainerFeeItemMutation();
  const [updateTrainerFeeItem] = useUpdateTrainerFeeItemMutation();
  const [deleteTrainerFeeItem] = useDeleteTrainerFeeItemMutation();

  const handleEdit = (trainer: User) => {
    openEditDialog(trainer);
  };

  const handleSave = async () => {
    if (!selectedTrainer) return;
    try {
      const feePayload = {
        amount: Number(formData.amount) || 0,
        isActive: formData.isActive,
      };

      if (currentFee?._id) {
        await updateTrainerFeeItem({
          trainerId: selectedTrainer._id,
          feeId: currentFee._id,
          feeData: feePayload,
        }).unwrap();
      } else {
        await addTrainerFeeItem({
          trainerId: selectedTrainer._id,
          feeData: feePayload,
        }).unwrap();
      }

      closeEditDialog();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to save trainer fee");
    }
  };

  const handleDelete = async (trainerId: string, feeId: string) => {
    try {
      if (!confirm("Delete this trainer fee?")) return;
      await deleteTrainerFeeItem({ trainerId, feeId }).unwrap();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to delete trainer fee");
    }
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
            Trainer Fee Management
          </h1>
          <p className="mt-2 text-base text-slate-600">
            One trainer has one fee amount only.
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
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      <TrainerFeeEditDialog
        open={isEditDialogOpen}
        selectedTrainer={selectedTrainer}
        formData={formData}
        hasExistingFee={Boolean(currentFee)}
        onOpenChange={(open) => {
          if (!open) closeEditDialog();
        }}
        onAmountChange={(amount) => updateFeeField("amount", amount)}
        onActiveChange={(isActive) => updateFeeField("isActive", isActive)}
        onSave={handleSave}
        onDelete={() => {
          if (!selectedTrainer || !currentFee?._id) return;
          void (async () => {
            await handleDelete(selectedTrainer._id, currentFee._id);
            closeEditDialog();
          })();
        }}
      />
    </div>
  );
}
