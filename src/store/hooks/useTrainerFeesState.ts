import { useAppDispatch, useAppSelector } from "./index";
import {
  openEditDialog,
  closeEditDialog,
  updateFeeField,
  type FeeFormItem,
} from "../slices/trainerFeesSlice";
import type { User } from "@/src/types/type";

export function useTrainerFeesState() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.trainerFeesUi);

  return {
    // State
    isEditDialogOpen: state.isEditDialogOpen,
    selectedTrainerId: state.selectedTrainerId,
    formData: state.formData,

    // Actions
    openEditDialog: (trainer: User) => dispatch(openEditDialog(trainer)),
    closeEditDialog: () => dispatch(closeEditDialog()),
    updateFeeField: (
      field: keyof FeeFormItem,
      value: FeeFormItem[keyof FeeFormItem],
    ) => dispatch(updateFeeField({ field, value })),
  };
}
