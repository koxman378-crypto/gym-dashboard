import type { TrainerFeeItem } from './extended-types';

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
  phone?: string;
  address?: string;
  age?: number;
  role: Role;
  assignedTrainer?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  // Body measurements (optional nested object, defaults to null if not provided)
  bodyMeasurements?: BodyMeasurementDto;
  isActive?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  phone?: string;
  address?: string;
  age?: number;
  role?: Role;
  isActive?: boolean;
  assignedTrainer?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
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
