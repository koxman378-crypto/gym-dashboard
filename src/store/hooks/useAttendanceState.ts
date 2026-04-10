import { useAppDispatch, useAppSelector } from "./index";
import {
  setAutoCloseAfter,
  setSelectedMonth,
  setSelectedYear,
  setPage,
} from "../slices/attendanceSlice";

export function useAttendanceState() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.attendanceUi);

  return {
    // State
    autoCloseAfter: state.autoCloseAfter,
    selectedMonth: state.selectedMonth,
    selectedYear: state.selectedYear,
    page: state.page,

    // Actions
    setAutoCloseAfter: (v: number) => dispatch(setAutoCloseAfter(v)),
    setSelectedMonth: (v: number) => dispatch(setSelectedMonth(v)),
    setSelectedYear: (v: number) => dispatch(setSelectedYear(v)),
    setPage: (v: number) => dispatch(setPage(v)),
  };
}
