import { useAppDispatch, useAppSelector } from "./index";
import {
  openCreateDialog,
  closeCreateDialog,
  openEditDialog,
  closeEditDialog,
  setFormData,
  resetForm,
  type GymFeeFormState,
} from "../slices/gymPricesSlice";
import type { GymFeeRecord } from "@/src/types/extended-types";

export function useGymPricesState() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.gymPricesUi);

  return {
    // State
    isCreateDialogOpen: state.isCreateDialogOpen,
    isEditDialogOpen: state.isEditDialogOpen,
    selectedFeeId: state.selectedFeeId,
    formData: state.formData,

    // Actions
    openCreateDialog: () => dispatch(openCreateDialog()),
    closeCreateDialog: () => dispatch(closeCreateDialog()),
    openEditDialog: (fee: GymFeeRecord) => dispatch(openEditDialog(fee)),
    closeEditDialog: () => dispatch(closeEditDialog()),
    setFormData: (data: Partial<GymFeeFormState>) =>
      dispatch(setFormData(data)),
    resetForm: () => dispatch(resetForm()),
  };
}
