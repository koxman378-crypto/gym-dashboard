import { useAppDispatch, useAppSelector } from "./index";
import {
  setSearchName,
  setSearchEmail,
  setFilterRole,
  setPage,
  setLimit,
  openEditDialog,
  closeEditDialog,
  setEditFormData,
  resetFilters,
  type UsersEditFormData,
} from "../slices/usersSlice";
import type { User } from "@/src/types/type";

export function useUsersState() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.usersUi);

  return {
    // State
    searchName: state.searchName,
    searchEmail: state.searchEmail,
    filterRole: state.filterRole,
    page: state.page,
    limit: state.limit,
    isEditDialogOpen: state.isEditDialogOpen,
    selectedUserId: state.selectedUserId,
    editFormData: state.editFormData,

    // Actions
    setSearchName: (v: string) => dispatch(setSearchName(v)),
    setSearchEmail: (v: string) => dispatch(setSearchEmail(v)),
    setFilterRole: (v: string) => dispatch(setFilterRole(v)),
    setPage: (v: number) => dispatch(setPage(v)),
    setLimit: (v: number) => dispatch(setLimit(v)),
    openEditDialog: (user: User, trainers: User[]) =>
      dispatch(openEditDialog({ user, trainers })),
    closeEditDialog: () => dispatch(closeEditDialog()),
    setEditFormData: (data: Partial<UsersEditFormData>) =>
      dispatch(setEditFormData(data)),
    resetFilters: () => dispatch(resetFilters()),
  };
}
