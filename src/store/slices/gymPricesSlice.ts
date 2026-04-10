import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  DurationUnit,
  PromotionType,
  GymFeeRecord,
} from "@/src/types/extended-types";

export interface GymFeeFormState {
  name: string;
  amount: number | "";
  duration: number | "";
  durationUnit: DurationUnit;
  promotionType: Exclude<PromotionType, null> | "none";
  promotionValue: number | "";
  isActive: boolean;
}

export interface GymPricesUiState {
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  selectedFeeId: string | null;
  formData: GymFeeFormState;
}

const defaultFormData: GymFeeFormState = {
  name: "",
  amount: "",
  duration: "",
  durationUnit: "months",
  promotionType: "none",
  promotionValue: "",
  isActive: true,
};

const initialState: GymPricesUiState = {
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  selectedFeeId: null,
  formData: defaultFormData,
};

const gymPricesSlice = createSlice({
  name: "gymPricesUi",
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
    openEditDialog(state, action: PayloadAction<GymFeeRecord>) {
      const fee = action.payload;
      state.isEditDialogOpen = true;
      state.selectedFeeId = fee._id ?? null;
      state.formData = {
        name: fee.name,
        amount: fee.amount,
        duration: fee.duration,
        durationUnit: fee.durationUnit,
        promotionType: fee.promotionType ?? "none",
        promotionValue: fee.promotionValue ?? "",
        isActive: fee.isActive,
      };
    },
    closeEditDialog(state) {
      state.isEditDialogOpen = false;
      state.selectedFeeId = null;
      state.formData = { ...defaultFormData };
    },
    setFormData(state, action: PayloadAction<Partial<GymFeeFormState>>) {
      Object.assign(state.formData, action.payload);
    },
    resetForm(state) {
      state.formData = { ...defaultFormData };
      state.selectedFeeId = null;
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
} = gymPricesSlice.actions;

export default gymPricesSlice.reducer;
