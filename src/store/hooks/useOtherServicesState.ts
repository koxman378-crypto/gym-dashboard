import { useAppDispatch, useAppSelector } from "./index";
import {
  openCreateDialog,
  closeCreateDialog,
  openEditDialog,
  closeEditDialog,
  setFormData,
} from "../slices/otherServicesSlice";
import type {
  OtherServiceItem,
  CreateOtherServiceDto,
} from "@/src/types/extended-types";

export function useOtherServicesState() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.otherServicesUi);

  return {
    // State
    isCreateDialogOpen: state.isCreateDialogOpen,
    isEditDialogOpen: state.isEditDialogOpen,
    selectedItemId: state.selectedItemId,
    formData: state.formData,

    // Actions
    openCreateDialog: () => dispatch(openCreateDialog()),
    closeCreateDialog: () => dispatch(closeCreateDialog()),
    openEditDialog: (item: OtherServiceItem) => dispatch(openEditDialog(item)),
    closeEditDialog: () => dispatch(closeEditDialog()),
    setFormData: (data: Partial<CreateOtherServiceDto>) =>
      dispatch(setFormData(data)),
  };
}
