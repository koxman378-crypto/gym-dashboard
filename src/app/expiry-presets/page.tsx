"use client";

import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  useGetExpiryPresetsQuery,
  useCreateExpiryPresetMutation,
  useUpdateExpiryPresetMutation,
  useToggleExpiryPresetMutation,
  useDeleteExpiryPresetMutation,
} from "@/src/store/services/expiryPresetsApi";
import type { ExpiryPreset } from "@/src/types/extended-types";
import { ExpiryPresetFormDialog } from "@/src/components/expiry-presets/ExpiryPresetFormDialog";
import { ExpiryPresetList } from "@/src/components/expiry-presets/ExpiryPresetList";
import { useExpiryPresetsState } from "@/src/store/hooks/useExpiryPresetsState";

const lightSurfaceClassName =
  "border border-black/15 bg-white text-slate-900 shadow-sm";
const lightButtonClassName =
  "border border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-sm";

export default function ExpiryPresetsPage() {
  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedPresetId,
    formData,
    openCreateDialog,
    openEditDialog,
    closeCreateDialog,
    closeEditDialog,
    setFormData,
  } = useExpiryPresetsState();

  const { data: presets = [], isLoading } = useGetExpiryPresetsQuery({});
  const selectedPreset =
    presets.find((p) => p._id === selectedPresetId) ?? null;

  const [createPreset, { isLoading: isCreating }] =
    useCreateExpiryPresetMutation();
  const [updatePreset, { isLoading: isUpdating }] =
    useUpdateExpiryPresetMutation();
  const [togglePreset] = useToggleExpiryPresetMutation();
  const [deletePreset] = useDeleteExpiryPresetMutation();

  const handleCreate = async () => {
    if (formData.days === "") return;
    try {
      await createPreset({
        label: formData.label.trim(),
        days: Number(formData.days),
      }).unwrap();
      closeCreateDialog();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to create expiry preset");
    }
  };

  const handleUpdate = async () => {
    if (!selectedPreset?._id || formData.days === "") return;
    try {
      await updatePreset({
        id: selectedPreset._id,
        data: {
          label: formData.label.trim(),
          days: Number(formData.days),
        },
      }).unwrap();
      closeEditDialog();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to update expiry preset");
    }
  };

  const handleDelete = async (preset: ExpiryPreset) => {
    if (!preset._id || !confirm(`Delete "${preset.label}"?`)) return;
    try {
      await deletePreset(preset._id).unwrap();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to delete expiry preset");
    }
  };

  const handleToggle = async (preset: ExpiryPreset) => {
    if (!preset._id) return;
    try {
      await togglePreset(preset._id).unwrap();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to toggle expiry preset");
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 text-slate-900">
      <div
        className={`mb-6 flex items-center justify-between rounded-2xl p-6 ${lightSurfaceClassName}`}
      >
        <div>
          <h1 className="text-3xl font-bold">Expiry Presets</h1>
          <p className="mt-1 text-slate-600">
            Manage preset values used in the subscription expiry filter
            dropdown.
          </p>
        </div>
        <Button
          onClick={() => openCreateDialog()}
          className={`cursor-pointer px-6 py-6 text-base font-semibold ${lightButtonClassName}`}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Preset
        </Button>
      </div>

      <div className={`rounded-2xl ${lightSurfaceClassName}`}>
        <ExpiryPresetList
          presets={presets}
          isLoading={isLoading}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      </div>

      <ExpiryPresetFormDialog
        open={isCreateDialogOpen || isEditDialogOpen}
        isEdit={isEditDialogOpen}
        formData={formData}
        isLoading={isCreating || isUpdating}
        onOpenChange={(open) => {
          if (!open) {
            if (isEditDialogOpen) closeEditDialog();
            else closeCreateDialog();
          }
        }}
        onChange={setFormData}
        onSubmit={isEditDialogOpen ? handleUpdate : handleCreate}
      />
    </div>
  );
}
