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
  useAddTrainerFeeItemMutation,
} from "@/src/store/services/usersApi";
import { Role, type User, type CreateUserDto } from "@/src/types/type";
import { useAppSelector } from "@/src/store/hooks";
import { useUsersState } from "@/src/store/hooks/useUsersState";
import { useRouter } from "next/navigation";

import { UserCreateDialog } from "@/src/components/users/UserCreateDialog";
import { UserEditDialog } from "@/src/components/users/UserEditDialog";
import { UserSearchFilters } from "@/src/components/users/UserSearchFilters";
import { UserStatisticsCards } from "@/src/components/users/UserStatisticsCards";
import { UsersTable } from "@/src/components/users/UsersTable";
import { UserAttendanceHistoryDialog } from "@/src/components/users/UserAttendanceHistoryDialog";
import { lightSurfaceClassName } from "@/src/components/users/users.constants";
import { useLanguage } from "@/src/components/language/LanguageContext";
import { OwnerBranchSelect } from "@/src/components/layout/OwnerBranchSelect";
import { useOwnerBranchFilter } from "@/src/components/layout/OwnerBranchFilterContext";
import { PageLoadingState } from "@/src/components/ui/page-loading-state";

export default function UsersPage() {
  const getErrorState = (error: unknown) => {
    const candidate = error as {
      status?: number;
      message?: string;
      data?: { status?: number; message?: string };
    };
    return {
      status: candidate?.status ?? candidate?.data?.status,
      message:
        candidate?.data?.message ?? candidate?.message ?? "Unknown error",
    };
  };

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
  const { isOwner, selectedGymId, setSelectedGymId, branches } =
    useOwnerBranchFilter();
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

  const { isLoading: staffLoading } = useGetAllStaffQuery(
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
  const [addTrainerFeeItem] = useAddTrainerFeeItemMutation();
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
  }, [currentUser?.role, manageableMeta.total, manageableUsers, statistics]);

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
      const { trainerFee, ...restData } = data;
      const normalizedData = {
        ...restData,
        email: restData.email.trim(),
      };
      let createdUser: User;
      if (data.role === Role.CUSTOMER) {
        createdUser = await createCustomer(normalizedData).unwrap();
      } else {
        createdUser = await createStaff(normalizedData).unwrap();
      }
      if (data.role === Role.TRAINER && trainerFee && trainerFee > 0 && createdUser._id) {
        await addTrainerFeeItem({
          trainerId: createdUser._id,
          feeData: { amount: trainerFee, isActive: true },
        }).unwrap();
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
    } catch (error) {
      const { message } = getErrorState(error);
      alert(`Failed to update user: ${message}`);
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
      } catch (error) {
        const { message } = getErrorState(error);
        alert(`Failed to delete user: ${message}`);
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
      if (currentUser?.role === Role.OWNER && editFormData.password.trim()) {
        updateData.password = editFormData.password.trim();
      }
      const normalizedAge =
        editFormData.age === "" ? undefined : editFormData.age;
      if (normalizedAge !== selectedUser.age) updateData.age = normalizedAge;

      // Birthday
      const newBirthday = editFormData.birthday || undefined;
      const existingBirthday = selectedUser.birthday
        ? typeof selectedUser.birthday === "string"
          ? selectedUser.birthday.split("T")[0]
          : new Date(selectedUser.birthday).toISOString().split("T")[0]
        : undefined;
      if (newBirthday !== existingBirthday)
        updateData.birthday = newBirthday ?? null;

      // Gender
      const newGender = editFormData.gender || undefined;
      if (newGender !== (selectedUser.gender ?? undefined))
        updateData.gender = newGender ?? null;

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

      // Salary update for trainer/cashier
      if (
        (selectedUser.role === Role.TRAINER ||
          selectedUser.role === Role.CASHIER) &&
        editFormData.salaryAmount !== undefined
      ) {
        const newSalary =
          typeof editFormData.salaryAmount === "number" ? editFormData.salaryAmount : undefined;
        if (newSalary !== (selectedUser.salaryAmount ?? undefined)) {
          await updateUser({
            id: selectedUser._id,
            data: { salaryAmount: newSalary },
          }).unwrap();
        }
      }

      // Trainer fee update
      if (selectedUser.role === Role.TRAINER && editFormData.trainerFee !== undefined) {
        const newFee =
          typeof editFormData.trainerFee === "number" ? editFormData.trainerFee : undefined;
        if (newFee !== undefined && newFee > 0) {
          const existingFee =
            selectedUser.trainerFees?.find((f) => f.isActive) ??
            selectedUser.trainerFees?.[0];
          if (!existingFee || existingFee.amount !== newFee) {
            await addTrainerFeeItem({
              trainerId: selectedUser._id,
              feeData: { amount: newFee, isActive: true },
            }).unwrap();
          }
        }
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
    } catch (error) {
      const { status, message } = getErrorState(error);
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
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
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
            <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto">
              {isOwner && branches.length > 0 && (
                <OwnerBranchSelect
                  branches={branches}
                  selectedGymId={selectedGymId}
                  onChange={(gymId) => {
                    setSelectedGymId(gymId);
                    setUserPage(1);
                  }}
                  className="min-w-45"
                />
              )}

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
          currentUserRole={currentUser?.role}
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
          branches={branches}
        />
      </div>
    </div>
  );
}
