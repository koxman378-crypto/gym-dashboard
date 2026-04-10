"use client";

import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  useCreateGymFeeRecordMutation,
  useDeleteGymFeeRecordMutation,
  useGetAllGymFeeRecordsQuery,
  useUpdateGymFeeRecordMutation,
} from "@/src/store/services/customFeesApi";
import type {
  GymFeeRecord,
  CreateGymFeeRecordDto,
} from "@/src/types/extended-types";
import {
  GymFeeFormDialog,
  type GymFeeFormState,
} from "@/src/components/custom-fees/gym-prices/GymFeeFormDialog";
import { GymFeeList } from "@/src/components/custom-fees/gym-prices/GymFeeList";
import { useGymPricesState } from "@/src/store/hooks/useGymPricesState";

const lightSurfaceClassName =
  "border border-black/15 bg-white text-slate-900 shadow-sm";
const lightButtonClassName =
  "border border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-sm";

export default function GymPricesPage() {
  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedFeeId,
    formData,
    openCreateDialog,
    openEditDialog,
    closeCreateDialog,
    closeEditDialog,
    setFormData,
    resetForm,
  } = useGymPricesState();

  const { data: gymFees = [], isLoading } = useGetAllGymFeeRecordsQuery({
    active: undefined,
  });
  const selectedFee = gymFees.find((f) => f._id === selectedFeeId) ?? null;
  const [createFee] = useCreateGymFeeRecordMutation();
  const [updateFee] = useUpdateGymFeeRecordMutation();
  const [deleteFee] = useDeleteGymFeeRecordMutation();

  const handleCreate = async () => {
    try {
      const payload: CreateGymFeeRecordDto = {
        name: formData.name.trim(),
        amount: Number(formData.amount || 0),
        duration: Number(formData.duration || 1),
        durationUnit: formData.durationUnit,
        promotionType:
          formData.promotionType === "none"
            ? undefined
            : formData.promotionType,
        promotionValue:
          formData.promotionValue === ""
            ? undefined
            : Number(formData.promotionValue),
        isActive: formData.isActive,
      };
      await createFee(payload).unwrap();
      closeCreateDialog();
      resetForm();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to create gym fee");
    }
  };

  const handleEdit = (fee: GymFeeRecord) => {
    openEditDialog(fee);
  };

  const handleUpdate = async () => {
    if (!selectedFee?._id) return;
    try {
      await updateFee({
        id: selectedFee._id,
        data: {
          name: formData.name.trim(),
          amount: Number(formData.amount || 0),
          duration: Number(formData.duration || 1),
          durationUnit: formData.durationUnit,
          promotionType:
            formData.promotionType === "none"
              ? undefined
              : formData.promotionType,
          promotionValue:
            formData.promotionValue === ""
              ? undefined
              : Number(formData.promotionValue),
          isActive: formData.isActive,
        },
      }).unwrap();
      closeEditDialog();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to update gym fee");
    }
  };

  const handleDelete = async (fee: GymFeeRecord) => {
    if (!fee._id || !confirm(`Delete ${fee.name}?`)) return;
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
    <div className="min-h-screen bg-white p-6 text-slate-900">
      <div
        className={`mb-6 flex items-center justify-between rounded-2xl p-6 ${lightSurfaceClassName}`}
      >
        <div>
          <h1 className="text-3xl font-bold">Gym Prices</h1>
          <p className="mt-1 text-slate-600">
            Create flat gym fee items with amount, duration and promotion.
          </p>
        </div>
        <Button
          onClick={() => openCreateDialog()}
          className={`px-6 py-6 cursor-pointer text-base font-semibold ${lightButtonClassName}`}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Fee
        </Button>
      </div>

      <div className={`rounded-2xl ${lightSurfaceClassName}`}>
        <GymFeeList
          fees={gymFees}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      </div>

      <GymFeeFormDialog
        open={isCreateDialogOpen || isEditDialogOpen}
        isEdit={isEditDialogOpen}
        formData={formData}
        onOpenChange={(open) => {
          if (!open) {
            if (isEditDialogOpen) closeEditDialog();
            else closeCreateDialog();
          }
        }}
        onChange={(data) => setFormData(data)}
        onSubmit={isEditDialogOpen ? handleUpdate : handleCreate}
      />
    </div>
  );
}
