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
import { useLanguage } from "@/src/components/language/LanguageContext";
import { useOwnerBranchFilter } from "@/src/components/layout/OwnerBranchFilterContext";
import { PageLoadingState } from "@/src/components/ui/page-loading-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

const lightSurfaceClassName =
  "border border-border bg-background text-foreground shadow-sm";
const lightButtonClassName =
  "border border-border bg-background text-foreground hover:bg-muted hover:text-foreground shadow-sm";

export default function ExpiryPresetsPage() {
  const { t } = useLanguage();
  const { isOwner, selectedGymId, setSelectedGymId, branches } =
    useOwnerBranchFilter();
  const branchQuery = isOwner ? (selectedGymId ?? undefined) : undefined;
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

  const { data: presets = [], isLoading } = useGetExpiryPresetsQuery({
    gymId: branchQuery,
  });
  const selectedPreset =
    presets.find((p) => p._id === selectedPresetId) ?? null;

  const [createPreset, { isLoading: isCreating }] =
    useCreateExpiryPresetMutation();
  const [updatePreset, { isLoading: isUpdating }] =
    useUpdateExpiryPresetMutation();
  const [togglePreset] = useToggleExpiryPresetMutation();
  const [deletePreset] = useDeleteExpiryPresetMutation();

  if (isLoading && presets.length === 0) {
    return <PageLoadingState headerActionCount={isOwner ? 2 : 1} />;
  }

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
    <div
      className="min-h-screen p-6 text-foreground"
      style={{ backgroundColor: "#FCFCFC" }}
    >
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-[#F5F5F5] p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold">{t("expiryPresets.title")}</h1>
          <p className="mt-1 text-muted-foreground">
            {t("expiryPresets.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isOwner && branches.length > 0 && (
            <Select
              value={selectedGymId ?? "all"}
              onValueChange={(v) => setSelectedGymId(v === "all" ? null : v)}
            >
              <SelectTrigger className="w-44 border-border bg-background text-sm">
                <SelectValue placeholder="All Gyms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gyms</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b._id} value={b._id!}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={() => openCreateDialog()}
            className={`cursor-pointer px-6 py-6 text-base font-semibold ${lightButtonClassName}`}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("expiryPresets.addPreset")}
          </Button>
        </div>
      </div>

      <div>
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
