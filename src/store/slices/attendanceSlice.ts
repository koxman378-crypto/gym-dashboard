import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AttendanceUiState {
  autoCloseAfter: number;
  selectedMonth: number;
  selectedYear: number;
  page: number;
}

const initialState: AttendanceUiState = {
  autoCloseAfter: 120,
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  page: 1,
};

const attendanceSlice = createSlice({
  name: "attendanceUi",
  initialState,
  reducers: {
    setAutoCloseAfter(state, action: PayloadAction<number>) {
      state.autoCloseAfter = action.payload;
    },
    setSelectedMonth(state, action: PayloadAction<number>) {
      state.selectedMonth = action.payload;
    },
    setSelectedYear(state, action: PayloadAction<number>) {
      state.selectedYear = action.payload;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
});

export const { setAutoCloseAfter, setSelectedMonth, setSelectedYear, setPage } =
  attendanceSlice.actions;

export default attendanceSlice.reducer;
