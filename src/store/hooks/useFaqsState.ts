import { useAppDispatch, useAppSelector } from "./index";
import {
  openCreateDialog,
  closeCreateDialog,
  openEditDialog,
  closeEditDialog,
  setFormData,
  resetForm,
  type FaqFormState,
} from "../slices/faqsSlice";
import type { Faq } from "@/src/types/extended-types";

export function useFaqsState() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.faqsUi);

  return {
    // State
    isCreateDialogOpen: state.isCreateDialogOpen,
    isEditDialogOpen: state.isEditDialogOpen,
    selectedFaqId: state.selectedFaqId,
    formData: state.formData,

    // Actions
    openCreateDialog: () => dispatch(openCreateDialog()),
    closeCreateDialog: () => dispatch(closeCreateDialog()),
    openEditDialog: (faq: Faq) => dispatch(openEditDialog(faq)),
    closeEditDialog: () => dispatch(closeEditDialog()),
    setFormData: (data: Partial<FaqFormState>) => dispatch(setFormData(data)),
    resetForm: () => dispatch(resetForm()),
  };
}
