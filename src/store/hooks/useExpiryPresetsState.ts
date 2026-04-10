import { useAppDispatch, useAppSelector } from "./index";
import {
  openCreateDialog,
  closeCreateDialog,
  openEditDialog,
  closeEditDialog,
  setFormData,
  resetForm,
  type ExpiryPresetFormState,
} from "../slices/expiryPresetsSlice";
import type { ExpiryPreset } from "@/src/types/extended-types";

export function useExpiryPresetsState() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.expiryPresetsUi);

  return {
    isCreateDialogOpen: state.isCreateDialogOpen,
    isEditDialogOpen: state.isEditDialogOpen,
    selectedPresetId: state.selectedPresetId,
    formData: state.formData,

    openCreateDialog: () => dispatch(openCreateDialog()),
    closeCreateDialog: () => dispatch(closeCreateDialog()),
    openEditDialog: (preset: ExpiryPreset) => dispatch(openEditDialog(preset)),
    closeEditDialog: () => dispatch(closeEditDialog()),
    setFormData: (data: Partial<ExpiryPresetFormState>) =>
      dispatch(setFormData(data)),
    resetForm: () => dispatch(resetForm()),
  };
}
