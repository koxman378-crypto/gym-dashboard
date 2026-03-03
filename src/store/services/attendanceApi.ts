import { api } from "./baseApi";
import type {
  Attendance,
  CheckInDto,
  UpdateAutoCloseDto,
  AttendanceHistoryResponse,
  MonthlyStats,
} from "@/src/types/attendance";

export const attendanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Check in - Start attendance tracking
    checkIn: builder.mutation<Attendance, CheckInDto>({
      query: (data) => ({
        url: "/attendance/check-in",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // Check out - End attendance tracking
    checkOut: builder.mutation<Attendance, void>({
      query: () => ({
        url: "/attendance/check-out",
        method: "POST",
      }),
      invalidatesTags: ["Attendance"],
    }),

    // Get today's attendance
    getTodayAttendance: builder.query<Attendance | null, void>({
      query: () => "/attendance/today",
      providesTags: ["Attendance"],
    }),

    // Get active attendance
    getActiveAttendance: builder.query<Attendance | null, void>({
      query: () => "/attendance/active",
      providesTags: ["Attendance"],
    }),

    // Get attendance history
    getAttendanceHistory: builder.query<
      AttendanceHistoryResponse,
      {
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ startDate, endDate, page = 1, limit = 30 }) => ({
        url: "/attendance/history",
        params: { startDate, endDate, page, limit },
      }),
      providesTags: ["Attendance"],
    }),

    // Update auto-close duration
    updateAutoClose: builder.mutation<Attendance, UpdateAutoCloseDto>({
      query: (data) => ({
        url: "/attendance/auto-close",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // Get monthly statistics
    getMonthlyStats: builder.query<
      MonthlyStats,
      { year?: number; month?: number }
    >({
      query: ({ year, month }) => ({
        url: "/attendance/stats/monthly",
        params: { year, month },
      }),
      providesTags: ["Attendance"],
    }),
  }),
});

export const {
  useCheckInMutation,
  useCheckOutMutation,
  useGetTodayAttendanceQuery,
  useGetActiveAttendanceQuery,
  useGetAttendanceHistoryQuery,
  useUpdateAutoCloseMutation,
  useGetMonthlyStatsQuery,
} = attendanceApi;
