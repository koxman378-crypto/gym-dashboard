export enum AttendanceStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  AUTO_CLOSED = "auto_closed",
}

export interface Attendance {
  _id: string;
  user: string;
  checkInTime: string;
  checkOutTime?: string;
  duration: number; // in minutes
  status: AttendanceStatus;
  autoCloseAfter: number; // in minutes
  date: string; // format: YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface CheckInDto {
  autoCloseAfter?: number; // 60, 120, 180, 240 (in minutes)
}

export interface UpdateAutoCloseDto {
  autoCloseAfter: number; // 60, 120, 180, 240 (in minutes)
}

export interface AttendanceHistoryResponse {
  data: Attendance[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CheckInLimitStatus {
  limit: number;
  checkInCount: number;
  remainingCheckIns: number;
  canCheckIn: boolean;
  nextAllowedCheckInAt?: string | null;
}

export interface MonthlyStats {
  year: number;
  month: number;
  totalDays: number;
  totalHours: number;
  averageHoursPerDay: number;
  attendanceByDay: Array<{
    date: string;
    count: number;
    totalMinutes: number;
  }>;
}

export interface UserMonthAttendance {
  year: number;
  month: number;
  byDate: Record<string, Attendance[]>;
}
