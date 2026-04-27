"use client";

import { Search } from "lucide-react";
import { Role, type MultiGymItem } from "@/src/types/type";
import { type AuthUser } from "@/src/store/slices/authSlice";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  lightInputClassName,
  lightSelectContentClassName,
  lightSelectItemClassName,
  lightSelectTriggerClassName,
  lightSurfaceClassName,
} from "./users.constants";

interface UserSearchFiltersProps {
  searchName: string;
  searchEmail: string;
  filterRole: string;
  currentUser: AuthUser | null;
  onSearchNameChange: (value: string) => void;
  onSearchEmailChange: (value: string) => void;
  onFilterRoleChange: (value: string) => void;
  isOwner?: boolean;
  branches?: MultiGymItem[];
  selectedGymId?: string | null;
  onGymChange?: (gymId: string | null) => void;
}

export function UserSearchFilters({
  searchName,
  searchEmail,
  filterRole,
  currentUser,
  onSearchNameChange,
  onSearchEmailChange,
  onFilterRoleChange,
  isOwner,
  branches = [],
  selectedGymId,
  onGymChange,
}: UserSearchFiltersProps) {
  return (
    <div className={`rounded-xl p-6 shadow-sm ${lightSurfaceClassName}`}>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute text-gray-500 left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => onSearchNameChange(e.target.value)}
            className={`pl-10 transition-colors ${lightInputClassName}`}
          />
        </div>
        <div className="relative flex-1">
          <Search className="absolute text-gray-500 left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={searchEmail}
            onChange={(e) => onSearchEmailChange(e.target.value)}
            className={`pl-10 transition-colors ${lightInputClassName}`}
          />
        </div>
        <Select value={filterRole} onValueChange={onFilterRoleChange}>
          <SelectTrigger
            className={`w-45 transition-colors ${lightSelectTriggerClassName}`}
          >
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className={lightSelectContentClassName}>
            <SelectItem
              value="all"
              className={`cursor-pointer ${lightSelectItemClassName}`}
            >
              All Roles
            </SelectItem>
            <SelectItem
              value={Role.CUSTOMER}
              className={`cursor-pointer ${lightSelectItemClassName}`}
            >
              Customer
            </SelectItem>
            {currentUser &&
              (currentUser.role === Role.OWNER ||
                currentUser.role === Role.CASHIER) && (
                <SelectItem
                  value={Role.TRAINER}
                  className={`cursor-pointer ${lightSelectItemClassName}`}
                >
                  Trainer
                </SelectItem>
              )}
            {currentUser?.role === Role.OWNER && (
              <>
                <SelectItem
                  value={Role.CASHIER}
                  className={`cursor-pointer ${lightSelectItemClassName}`}
                >
                  Cashier
                </SelectItem>
                <SelectItem
                  value={Role.OWNER}
                  className={`cursor-pointer ${lightSelectItemClassName}`}
                >
                  Owner
                </SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
