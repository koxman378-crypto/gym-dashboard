import type { TrainerFeeItem } from "./extended-types";
import type {
  Expense,
  ExpenseCategory,
  ExpenseStatus,
} from "@/src/store/services/expensesApi";
import type { BirthdayUser } from "@/src/store/services/birthdayWishApi";
import type {
  GymNotification,
  NotificationType,
} from "@/src/store/services/notificationsApi";

export enum Role {
  OWNER = "owner",
  CASHIER = "cashier",
  TRAINER = "trainer",
  CUSTOMER = "customer",
}

// Role hierarchy for permission checking (higher number = more permissions)
export const RoleHierarchy: Record<Role, number> = {
  [Role.OWNER]: 4,
  [Role.CASHIER]: 3,
  [Role.TRAINER]: 2,
  [Role.CUSTOMER]: 1,
};

// Who can manage whom
export const RolePermissions: Record<Role, Role[]> = {
  [Role.OWNER]: [Role.CASHIER, Role.TRAINER, Role.CUSTOMER],
  [Role.CASHIER]: [Role.TRAINER, Role.CUSTOMER],
  [Role.TRAINER]: [Role.CUSTOMER],
  [Role.CUSTOMER]: [], // Can only manage their own profile
};

// Permission helper functions
export const canManageRole = (userRole: Role, targetRole: Role): boolean => {
  return RolePermissions[userRole]?.includes(targetRole) ?? false;
};

export const canCreateRole = (userRole: Role, targetRole: Role): boolean => {
  return canManageRole(userRole, targetRole);
};

export const canDeleteRole = (userRole: Role, targetRole: Role): boolean => {
  return canManageRole(userRole, targetRole);
};

export const canViewRole = (userRole: Role, targetRole: Role): boolean => {
  // Owners can view everyone
  if (userRole === Role.OWNER) return true;
  // Cashiers can view trainers and customers
  if (
    userRole === Role.CASHIER &&
    (targetRole === Role.TRAINER || targetRole === Role.CUSTOMER)
  )
    return true;
  // Trainers can view customers (but filtering by assigned customers happens at data level)
  if (userRole === Role.TRAINER && targetRole === Role.CUSTOMER) return true;
  // Customers can only view themselves
  return false;
};

export interface BodyMeasurement {
  _id?: string;
  height?: number | null;
  weight?: number | null;
  bodyFat?: number | null;
  chest?: number | null;
  waist?: number | null;
  biceps?: number | null;
  leg?: number | null;
  date?: Date | string;
  notes?: string | null;
  measuredAt?: Date | null;
  measuredBy?: string | User | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  nickname?: string | null;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  age?: number | null;
  role: Role;
  isActive: boolean;
  lastLoginAt?: Date | null;
  bodyMeasurements?: BodyMeasurement;
  measurementHistory?: BodyMeasurement[];
  assignedTrainer?: User | string | null;
  trainerFees?: TrainerFeeItem[];
  salaryAmount?: number | null;
  gymId?: string | null;
  birthday?: string | Date | null;
  gender?: "male" | "female" | "other" | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  nickname?: string;
  phone?: string;
  address?: string;
  age?: number;
  role: Role;
  assignedTrainer?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  salaryAmount?: number;
  trainerFee?: number;
  gymId?: string;
  birthday?: string;
  gender?: "male" | "female" | "other";
  // Body measurements (optional nested object, defaults to null if not provided)
  bodyMeasurements?: BodyMeasurementDto;
  isActive?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  nickname?: string;
  phone?: string;
  address?: string;
  age?: number;
  role?: Role;
  isActive?: boolean;
  assignedTrainer?: string;
  gymId?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  birthday?: string;
  gender?: "male" | "female" | "other";
  password?: string;
  salaryAmount?: number;
}

export interface BodyMeasurementDto {
  height?: number;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  biceps?: number;
  leg?: number;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byRole: {
    [key in Role]?: number;
  };
  newUsersThisMonth: number;
}

export interface GymProfile {
  _id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string | null;
  googleMapsUrl?: string | null;
  description?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  images?: string[];
  multiGyms?: MultiGymItem[];
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface MultiGymItem {
  _id?: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateGymProfileDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  latitude?: number;
  longitude?: number;
  locationLabel?: string;
  googleMapsUrl?: string;
  description?: string;
  coverImage?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  images?: string[];
  multiGyms?: MultiGymItem[];
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  age?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Expenses page local types
export type StatusFilter = "all" | ExpenseStatus;
export type CategoryFilter = "all" | ExpenseCategory;
export type MonthFilter = "all" | `${number}`;

export interface ExpenseMonthGroup {
  key: string;
  year: number;
  month: number;
  label: string;
  expenses: Expense[];
  total: number;
  count: number;
}

export interface ExpenseFormState {
  title: string;
  amount: string;
  category: ExpenseCategory;
  note: string;
}

// Birthday wish page
export interface BirthdayWishState {
  message: string;
  initialized: boolean;
  selectedUser: BirthdayUser | null;
  isDialogOpen: boolean;
}

export type BirthdayWishAction =
  | { type: "setMessage"; payload: string }
  | { type: "initializeMessage"; payload: string }
  | { type: "openDialog"; payload: BirthdayUser }
  | { type: "closeDialog" };

// Attendance history page
export interface AttendanceHistoryState {
  search: string;
  debouncedSearch: string;
  page: number;
  selectedUser: User | null;
}

export type AttendanceHistoryAction =
  | { type: "setSearch"; payload: string }
  | { type: "setDebouncedSearch"; payload: string }
  | { type: "setPage"; payload: number }
  | { type: "prevPage" }
  | { type: "nextPage" }
  | { type: "setSelectedUser"; payload: User | null };

// Attendance page
export interface AttendanceLocalState {
  limit: number;
  selectedUserId: string;
  selectedDate: string;
  searchName: string;
  currentDuration: number;
  nowTs: number;
}

export type AttendanceLocalAction =
  | { type: "setLimit"; payload: number }
  | { type: "setSelectedUserId"; payload: string }
  | { type: "setSelectedDate"; payload: string }
  | { type: "setSearchName"; payload: string }
  | { type: "setCurrentDuration"; payload: number }
  | { type: "setNowTs"; payload: number }
  | { type: "resetFilters" };

// Profile page
export type GymProfileFormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  latitude: string;
  longitude: string;
  locationLabel: string;
  googleMapsUrl: string;
  description: string;
  coverImage: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  isActive: boolean;
  isEditing: boolean;
  uploadingImage: boolean;
  uploadingGallery: boolean;
  uploadError: string | null;
  successMessage: string | null;
  multiGyms: MultiGymItem[];
  galleryImages: string[];
};

export type EditableGymProfileField = keyof Omit<
  GymProfileFormState,
  | "isEditing"
  | "uploadingImage"
  | "uploadingGallery"
  | "uploadError"
  | "successMessage"
  | "multiGyms"
  | "galleryImages"
>;

export type GymProfileAction =
  | { type: "hydrate"; payload?: GymProfile }
  | {
      type: "set_field";
      field: EditableGymProfileField;
      value: string | boolean;
    }
  | { type: "set_editing"; value: boolean }
  | { type: "set_uploading"; value: boolean }
  | { type: "set_uploading_gallery"; value: boolean }
  | { type: "set_error"; value: string | null }
  | { type: "set_success"; value: string | null }
  | { type: "set_branches"; value: MultiGymItem[] }
  | { type: "set_gallery"; value: string[] }
  | { type: "add_gallery_image"; value: string }
  | { type: "remove_gallery_image"; index: number }
  | { type: "reset"; payload?: GymProfile };

// Payment requests page
export type PaymentRequestStatusFilter = "" | "pending" | "approved" | "rejected";
export type PaymentRequestStatusFilterAction = {
  type: "set";
  value: PaymentRequestStatusFilter;
};

// Shared dashboard notification grouping
export type NotificationListItem = {
  key: string;
  subscriptionId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string | null;
  expiryItems: Array<{
    notification: GymNotification;
    type: NotificationType;
    targetName: string | null;
    daysLeft: number;
  }>;
  payment?: GymNotification;
  relatedIds: string[];
  isUnread: boolean;
  offDayName?: string | null;
  offDayDaysAdded?: number | null;
  offDayAppliedAt?: string | null;
};
