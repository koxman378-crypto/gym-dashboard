import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ExpiryPreset } from "@/src/types/extended-types";

export interface ExpiryPresetFormState {
  label: string;
  days: number | "";
}

export interface ExpiryPresetsUiState {
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  selectedPresetId: string | null;
  formData: ExpiryPresetFormState;
}

const defaultFormData: ExpiryPresetFormState = {
  label: "",
  days: "",
};

const initialState: ExpiryPresetsUiState = {
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  selectedPresetId: null,
  formData: defaultFormData,
};

const expiryPresetsSlice = createSlice({
  name: "expiryPresetsUi",
  initialState,
  reducers: {
    openCreateDialog(state) {
      state.isCreateDialogOpen = true;
      state.formData = { ...defaultFormData };
    },
    closeCreateDialog(state) {
      state.isCreateDialogOpen = false;
      state.formData = { ...defaultFormData };
    },
    openEditDialog(state, action: PayloadAction<ExpiryPreset>) {
      const preset = action.payload;
      state.isEditDialogOpen = true;
      state.selectedPresetId = preset._id;
      state.formData = {
        label: preset.label,
        days: preset.days,
      };
    },
    closeEditDialog(state) {
      state.isEditDialogOpen = false;
      state.selectedPresetId = null;
      state.formData = { ...defaultFormData };
    },
    setFormData(state, action: PayloadAction<Partial<ExpiryPresetFormState>>) {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetForm(state) {
      state.formData = { ...defaultFormData };
    },
  },
});

export const {
  openCreateDialog,
  closeCreateDialog,
  openEditDialog,
  closeEditDialog,
  setFormData,
  resetForm,
} = expiryPresetsSlice.actions;

export default expiryPresetsSlice.reducer;
