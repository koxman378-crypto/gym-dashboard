"use client";

/**
 * Users Management Page
 *
 * ROLE-BASED ACCESS CONTROL (RBAC):
 * - OWNER: Has full access to all users (staff, trainers, customers)
 * - CASHIER: Can create/delete trainers and customers, can view them
 * - TRAINER: Can view and update only customers assigned to them
 * - CUSTOMER: Cannot access user management
 */

import { useMemo, useState } from "react";
import { Users2 } from "lucide-react";
import {
  useGetAllStaffQuery,
  useGetAllTrainersQuery,
  useGetManageableUsersQuery,
  useGetStatisticsQuery,
  useCreateCustomerMutation,
  useCreateStaffMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateBodyMeasurementsMutation,
} from "@/src/store/services/usersApi";
import { Role, type User, type CreateUserDto } from "@/src/types/type";
import { useAppSelector } from "@/src/store/hooks";
import { useUsersState } from "@/src/store/hooks/useUsersState";
import { useRouter } from "next/navigation";

import { UserCreateDialog } from "@/src/components/users/UserCreateDialog";
import {
  UserEditDialog,
  type EditFormData,
} from "@/src/components/users/UserEditDialog";
import { UserSearchFilters } from "@/src/components/users/UserSearchFilters";
import { UserStatisticsCards } from "@/src/components/users/UserStatisticsCards";
import { UsersTable } from "@/src/components/users/UsersTable";
import { UserAttendanceHistoryDialog } from "@/src/components/users/UserAttendanceHistoryDialog";
import { lightSurfaceClassName } from "@/src/components/users/users.constants";
import { useLanguage } from "@/src/components/language/LanguageContext";
import { useOwnerBranchFilter } from "@/src/components/layout/OwnerBranchFilterContext";
import { PageLoadingState } from "@/src/components/ui/page-loading-state";

export default function UsersPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const {
    searchName,
    searchEmail,
    filterRole,
    page: userPage,
    limit: userLimit,
    isEditDialogOpen,
    selectedUserId,
    editFormData,
    setSearchName,
    setSearchEmail,
    setFilterRole,
    setPage: setUserPage,
    setLimit: setUserLimit,
    openEditDialog: openEditDialogAction,
    closeEditDialog,
    setEditFormData,
  } = useUsersState();

  // Auth
  const currentUser = useAppSelector((state) => state.auth.user);
  const { isAuthenticated, accessToken } = useAppSelector(
    (state) => state.auth,
  );
  const { isOwner, selectedGymId, branches } = useOwnerBranchFilter();
  const branchQuery = isOwner ? (selectedGymId ?? undefined) : undefined;

  const searchRole = filterRole === "all" ? undefined : filterRole;

  // Queries
  const { data: manageableUsersData, isLoading: manageableUsersLoading } =
    useGetManageableUsersQuery(
      {
        page: userPage,
        limit: userLimit,
        name: searchName || undefined,
        email: searchEmail || undefined,
        role: searchRole,
        gymId: branchQuery,
      },
      { skip: !isAuthenticated || !accessToken },
    );
  const manageableUsers = manageableUsersData?.data ?? [];
  const selectedUser = selectedUserId
    ? (manageableUsers.find((u) => u._id === selectedUserId) ?? null)
    : null;
  const manageableMeta = {
    page: manageableUsersData?.page ?? userPage,
    limit: manageableUsersData?.limit ?? userLimit,
    total: manageableUsersData?.total ?? 0,
    totalPages: manageableUsersData?.totalPages ?? 1,
  };

  const { data: staff = [], isLoading: staffLoading } = useGetAllStaffQuery(
    { gymId: branchQuery },
    {
      skip:
        !isAuthenticated || !accessToken || currentUser?.role !== Role.OWNER,
    },
  );

  const { data: trainers = [], isLoading: trainersLoading } =
    useGetAllTrainersQuery(
      { gymId: branchQuery },
      {
        skip: !isAuthenticated || !accessToken,
      },
    );

  const shouldLoadStatistics =
    !!isAuthenticated &&
    !!accessToken &&
    (currentUser?.role === Role.OWNER || currentUser?.role === Role.CASHIER);

  const { data: statistics, isLoading: statisticsLoading } =
    useGetStatisticsQuery(
      { gymId: branchQuery },
      { skip: !shouldLoadStatistics },
    );

  // Mutations
  const [createCustomer] = useCreateCustomerMutation();
  const [createStaff] = useCreateStaffMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateBodyMeasurements] = useUpdateBodyMeasurementsMutation();
  const [attendanceHistoryUser, setAttendanceHistoryUser] =
    useState<User | null>(null);

  const isLoading = manageableUsersLoading || staffLoading || trainersLoading;
  const isStatisticsLoading = statisticsLoading && shouldLoadStatistics;

  const dashboardStats = useMemo(() => {
    if (statistics) {
      const staffCount =
        currentUser?.role === Role.CASHIER
          ? (statistics.byRole?.[Role.TRAINER] ?? 0)
          : (statistics.byRole?.[Role.CASHIER] ?? 0) +
            (statistics.byRole?.[Role.TRAINER] ?? 0);
      return {
        totalUsers: statistics.totalUsers,
        activeUsers: statistics.activeUsers,
        customers: statistics.byRole?.[Role.CUSTOMER] ?? manageableMeta.total,
        staff: staffCount,
      };
    }
    const fallbackCustomers = manageableUsers.filter(
      (user) => user.role === Role.CUSTOMER,
    ).length;
    const fallbackStaff = manageableUsers.length - fallbackCustomers;
    return {
      totalUsers: manageableUsers.length,
      activeUsers: manageableUsers.filter((u) => u.isActive).length,
      customers: fallbackCustomers,
      staff: fallbackStaff,
    };
  }, [manageableMeta.total, manageableUsers, statistics]);

  if (isLoading && manageableUsers.length === 0) {
    return <PageLoadingState headerActionCount={1} itemCount={5} />;
  }

  // Helpers
  const getAssignedTrainerId = (
    assignedTrainer: User["assignedTrainer"],
  ): string => {
    if (!assignedTrainer) return "none";
    if (typeof assignedTrainer === "string") {
      return (
        trainers.find((t) => t._id === assignedTrainer)?._id ?? assignedTrainer
      );
    }
    return assignedTrainer._id || "none";
  };

  // Handlers
  const handleCreateUser = async (data: CreateUserDto) => {
    try {
      const normalizedData = {
        ...data,
        email: data.email.trim(),
      };
      if (data.role === Role.CUSTOMER) {
        await createCustomer(normalizedData).unwrap();
      } else {
        await createStaff(normalizedData).unwrap();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      if (!user._id) {
        alert(
          "Cannot update user: User ID is missing. Please refresh the page and try again.",
        );
        return;
      }

      await updateUser({
        id: user._id,
        data: { isActive: !user.isActive },
      }).unwrap();
    } catch (error: any) {
      alert(
        `Failed to update user: ${error?.data?.message || error?.message || "Unknown error"}`,
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!userId) {
      alert(
        "Cannot delete user: User ID is missing. Please refresh the page and try again.",
      );
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId).unwrap();
      } catch (error: any) {
        alert(
          `Failed to delete user: ${error?.data?.message || error?.message || "Unknown error"}`,
        );
      }
    }
  };

  const handleEditUser = (user: User) => {
    openEditDialogAction(user, trainers);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const updateData: Record<string, unknown> = {};
      const normalizedEmail = editFormData.email.trim();
      if (normalizedEmail !== selectedUser.email)
        updateData.email = normalizedEmail;
      if (editFormData.name !== selectedUser.name)
        updateData.name = editFormData.name;
      if (editFormData.phone !== (selectedUser.phone || ""))
        updateData.phone = editFormData.phone;
      const normalizedAge =
        editFormData.age === "" ? undefined : editFormData.age;
      if (normalizedAge !== selectedUser.age) updateData.age = normalizedAge;

      const currentTrainerId = getAssignedTrainerId(
        selectedUser.assignedTrainer,
      );
      if (editFormData.assignedTrainer !== currentTrainerId) {
        updateData.assignedTrainer =
          editFormData.assignedTrainer === "none"
            ? null
            : editFormData.assignedTrainer;
      }

      if (Object.keys(updateData).length > 0) {
        await updateUser({ id: selectedUser._id, data: updateData }).unwrap();
      }

      if (
        selectedUser.role === Role.CUSTOMER &&
        editFormData.bodyMeasurements
      ) {
        const hasAny = Object.values(editFormData.bodyMeasurements).some(
          (val) => val !== undefined,
        );
        if (hasAny) {
          await updateBodyMeasurements({
            customerId: selectedUser._id,
            measurements: editFormData.bodyMeasurements,
          }).unwrap();
        }
      }

      closeEditDialog();
    } catch (error: any) {
      const status = error?.status ?? error?.data?.status;
      const message = error?.data?.message || error?.message || "Unknown error";
      if (status === 409 || /already exists|duplicate|email/i.test(message)) {
        alert("Email already exists. Please use a different email.");
        return;
      }
      alert(`Failed to update user: ${message}`);
    }
  };

  const handleViewMeasurements = (userId: string) => {
    router.push(`/users/${userId}/measurements`);
  };

  const handleViewHistory = (user: User) => {
    setAttendanceHistoryUser(user);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className={`rounded-2xl p-8 ${lightSurfaceClassName}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-border bg-background p-3.5">
                <Users2 className="h-8 w-8 text-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {t("users.title")}
                </h1>
                <p className="mt-1.5 text-base text-muted-foreground">
                  {currentUser?.role === Role.TRAINER
                    ? t("users.subtitleTrainer")
                    : t("users.subtitleOwner")}
                </p>
              </div>
            </div>
            {currentUser &&
              (currentUser.role === Role.OWNER ||
                currentUser.role === Role.CASHIER) && (
                <UserCreateDialog
                  currentUserRole={currentUser.role}
                  branches={branches}
                  defaultGymId={branchQuery ?? null}
                  onCreate={handleCreateUser}
                />
              )}
          </div>
        </div>

        {/* Edit Dialog */}
        <UserEditDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeEditDialog();
          }}
          selectedUser={selectedUser}
          formData={editFormData}
          onFormChange={(data) => setEditFormData(data)}
          trainers={trainers}
          onSubmit={handleUpdateUser}
        />

        <UserAttendanceHistoryDialog
          user={attendanceHistoryUser}
          open={attendanceHistoryUser !== null}
          onOpenChange={(open) => {
            if (!open) setAttendanceHistoryUser(null);
          }}
        />

        {/* Search & Filters */}
        <UserSearchFilters
          searchName={searchName}
          searchEmail={searchEmail}
          filterRole={filterRole}
          currentUser={currentUser}
          onSearchNameChange={(v) => setSearchName(v)}
          onSearchEmailChange={(v) => setSearchEmail(v)}
          onFilterRoleChange={(v) => setFilterRole(v)}
        />

        {/* Statistics */}
        <UserStatisticsCards
          stats={dashboardStats}
          isLoading={isStatisticsLoading}
          currentUserRole={currentUser?.role}
        />

        {/* Table */}
        <UsersTable
          users={manageableUsers}
          isLoading={isLoading}
          currentUser={currentUser}
          meta={manageableMeta}
          isMetaLoading={manageableUsersLoading}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onToggleActive={handleToggleActive}
          onViewMeasurements={handleViewMeasurements}
          onViewHistory={handleViewHistory}
          onPageChange={(p) => setUserPage(p)}
          onPageSizeChange={(s) => setUserLimit(s)}
        />
      </div>
    </div>
  );
}
