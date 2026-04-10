import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Faq } from "@/src/types/extended-types";

export interface FaqFormState {
  question: string;
  answer: string;
}

export interface FaqsUiState {
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  selectedFaqId: string | null;
  formData: FaqFormState;
}

const defaultFormData: FaqFormState = {
  question: "",
  answer: "",
};

const initialState: FaqsUiState = {
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  selectedFaqId: null,
  formData: defaultFormData,
};

const faqsSlice = createSlice({
  name: "faqsUi",
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
    openEditDialog(state, action: PayloadAction<Faq>) {
      const faq = action.payload;
      state.isEditDialogOpen = true;
      state.selectedFaqId = faq._id;
      state.formData = {
        question: faq.question,
        answer: faq.answer,
      };
    },
    closeEditDialog(state) {
      state.isEditDialogOpen = false;
      state.selectedFaqId = null;
      state.formData = { ...defaultFormData };
    },
    setFormData(state, action: PayloadAction<Partial<FaqFormState>>) {
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
} = faqsSlice.actions;

export default faqsSlice.reducer;
