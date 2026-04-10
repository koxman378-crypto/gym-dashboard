import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/src/types/type";

export interface UsersEditFormData {
  email: string;
  name: string;
  phone: string;
  age: number | "";
  assignedTrainer: string;
  bodyMeasurements?: {
    height?: number;
    weight?: number;
    bodyFat?: number;
    chest?: number;
    waist?: number;
    biceps?: number;
    leg?: number;
  };
}

const defaultEditForm: UsersEditFormData = {
  email: "",
  name: "",
  phone: "",
  age: "",
  assignedTrainer: "none",
  bodyMeasurements: undefined,
};

export interface UsersUiState {
  // Search & filter
  searchName: string;
  searchEmail: string;
  filterRole: string;
  // Pagination
  page: number;
  limit: number;
  // Edit dialog
  isEditDialogOpen: boolean;
  selectedUserId: string | null;
  editFormData: UsersEditFormData;
}

const initialState: UsersUiState = {
  searchName: "",
  searchEmail: "",
  filterRole: "all",
  page: 1,
  limit: 20,
  isEditDialogOpen: false,
  selectedUserId: null,
  editFormData: defaultEditForm,
};

const usersSlice = createSlice({
  name: "usersUi",
  initialState,
  reducers: {
    setSearchName(state, action: PayloadAction<string>) {
      state.searchName = action.payload;
      state.page = 1;
    },
    setSearchEmail(state, action: PayloadAction<string>) {
      state.searchEmail = action.payload;
      state.page = 1;
    },
    setFilterRole(state, action: PayloadAction<string>) {
      state.filterRole = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.page = 1;
    },
    openEditDialog(
      state,
      action: PayloadAction<{ user: User; trainers: User[] }>,
    ) {
      const { user, trainers } = action.payload;
      state.isEditDialogOpen = true;
      state.selectedUserId = user._id ?? null;
      const assignedTrainerId = (() => {
        const at = user.assignedTrainer;
        if (!at) return "none";
        if (typeof at === "string") {
          return trainers.find((t) => t._id === at)?._id ?? at;
        }
        return (at as User)._id ?? "none";
      })();
      state.editFormData = {
        email: user.email ?? "",
        name: user.name ?? "",
        phone: user.phone ?? "",
        age: user.age ?? "",
        assignedTrainer: assignedTrainerId,
        bodyMeasurements: user.bodyMeasurements
          ? {
              height: user.bodyMeasurements.height ?? undefined,
              weight: user.bodyMeasurements.weight ?? undefined,
              bodyFat: user.bodyMeasurements.bodyFat ?? undefined,
              chest: user.bodyMeasurements.chest ?? undefined,
              waist: user.bodyMeasurements.waist ?? undefined,
              biceps: user.bodyMeasurements.biceps ?? undefined,
              leg: user.bodyMeasurements.leg ?? undefined,
            }
          : undefined,
      };
    },
    closeEditDialog(state) {
      state.isEditDialogOpen = false;
      state.selectedUserId = null;
      state.editFormData = defaultEditForm;
    },
    setEditFormData(state, action: PayloadAction<Partial<UsersEditFormData>>) {
      state.editFormData = { ...state.editFormData, ...action.payload };
    },
    resetFilters(state) {
      state.searchName = "";
      state.searchEmail = "";
      state.filterRole = "all";
      state.page = 1;
    },
  },
});

export const {
  setSearchName,
  setSearchEmail,
  setFilterRole,
  setPage,
  setLimit,
  openEditDialog,
  closeEditDialog,
  setEditFormData,
  resetFilters,
} = usersSlice.actions;

export default usersSlice.reducer;
