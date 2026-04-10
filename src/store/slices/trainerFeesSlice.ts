import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/src/types/type";
import type { TrainerFeeItem } from "@/src/types/extended-types";

export interface FeeFormItem {
  amount: number | "";
  isActive: boolean;
}

export interface TrainerFeesUiState {
  isEditDialogOpen: boolean;
  selectedTrainerId: string | null;
  formData: FeeFormItem;
}

const initialState: TrainerFeesUiState = {
  isEditDialogOpen: false,
  selectedTrainerId: null,
  formData: { amount: "", isActive: true },
};

const trainerFeesSlice = createSlice({
  name: "trainerFeesUi",
  initialState,
  reducers: {
    openEditDialog(state, action: PayloadAction<User>) {
      const trainer = action.payload;
      state.isEditDialogOpen = true;
      state.selectedTrainerId = trainer._id ?? null;
      const fee = trainer.trainerFees?.[0] as TrainerFeeItem | undefined;
      state.formData = fee
        ? {
            amount: fee.amount,
            isActive: fee.isActive,
          }
        : { amount: "", isActive: true };
    },
    closeEditDialog(state) {
      state.isEditDialogOpen = false;
      state.selectedTrainerId = null;
      state.formData = { amount: "", isActive: true };
    },
    updateFeeField(
      state,
      action: PayloadAction<{
        field: keyof FeeFormItem;
        value: FeeFormItem[keyof FeeFormItem];
      }>,
    ) {
      state.formData = {
        ...state.formData,
        [action.payload.field]: action.payload.value,
      } as FeeFormItem;
    },
  },
});

export const {
  openEditDialog,
  closeEditDialog,
  updateFeeField,
} = trainerFeesSlice.actions;

export default trainerFeesSlice.reducer;
