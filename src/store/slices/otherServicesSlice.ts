import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  OtherServiceItem,
  CreateOtherServiceDto,
} from "@/src/types/extended-types";

export interface OtherServicesUiState {
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  selectedItemId: string | null;
  formData: CreateOtherServiceDto;
}

const defaultFormData: CreateOtherServiceDto = {
  name: "",
  amountDays: "",
  amountMonths: "",
  amountYears: "",
  isActive: true,
};

const initialState: OtherServicesUiState = {
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  selectedItemId: null,
  formData: defaultFormData,
};

const otherServicesSlice = createSlice({
  name: "otherServicesUi",
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
    openEditDialog(state, action: PayloadAction<OtherServiceItem>) {
      const item = action.payload;
      state.isEditDialogOpen = true;
      state.selectedItemId = item._id;
      state.formData = {
        name: item.name,
        amountDays: item.amountDays,
        amountMonths: item.amountMonths,
        amountYears: item.amountYears,
        isActive: item.isActive,
      };
    },
    closeEditDialog(state) {
      state.isEditDialogOpen = false;
      state.selectedItemId = null;
      state.formData = { ...defaultFormData };
    },
    setFormData(state, action: PayloadAction<Partial<CreateOtherServiceDto>>) {
      Object.assign(state.formData, action.payload);
    },
  },
});

export const {
  openCreateDialog,
  closeCreateDialog,
  openEditDialog,
  closeEditDialog,
  setFormData,
} = otherServicesSlice.actions;

export default otherServicesSlice.reducer;
