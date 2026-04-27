import { api } from "./baseApi";
import type {
  Attendance,
  CheckInDto,
  UpdateAutoCloseDto,
  AttendanceHistoryResponse,
  MonthlyStats,
  UserMonthAttendance,
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

    // [OWNER] Get a specific user's attendance for a given month (lazy, cached per userId+year+month)
    getUserMonthAttendance: builder.query<
      UserMonthAttendance,
      { userId: string; year: number; month: number }
    >({
      query: ({ userId, year, month }) => ({
        url: `/attendance/user/${userId}`,
        params: { year, month },
      }),
      providesTags: (_result, _error, { userId }) => [
        { type: "Attendance", id: `user-${userId}` },
      ],
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
  useGetUserMonthAttendanceQuery,
} = attendanceApi;
