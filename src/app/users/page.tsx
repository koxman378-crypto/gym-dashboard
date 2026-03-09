"use client";

/**
 * Users Management Page
 *
 * ROLE-BASED ACCESS CONTROL (RBAC):
 * - OWNER: Has full access to all users (staff, trainers, customers)
 * - CASHIER: Can create/delete trainers and customers, can view them
 * - TRAINER: Can view and update only customers assigned to them
 * - CUSTOMER: Cannot access user management
 *
 * BODY MEASUREMENTS:
 * When creating a user, body measurement fields (height, weight, bodyFat, chest, waist, biceps, leg)
 * are optional and will default to null if not provided during user creation.
 * These can be updated later via the body measurements API endpoints.
 */

import { useState, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, Users2 } from "lucide-react";
import {
  useGetAllCustomersQuery,
  useGetAllStaffQuery,
  useGetAllTrainersQuery,
  useCreateCustomerMutation,
  useCreateStaffMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateBodyMeasurementsMutation,
} from "@/src/store/services/usersApi";
import {
  Role,
  type User,
  type CreateUserDto,
  canCreateRole,
  canDeleteRole,
} from "@/src/types/type";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useAppSelector } from "@/src/store/hooks";
import { UserActionsDropdown } from "@/src/components/users/UserActionsDropdown";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<{
    email: string;
    name: string;
    phone: string;
    age: number | undefined;
    assignedTrainer: string;
    bodyMeasurements?: {
      height?: number;
      weight?: number;
      bodyFat?: number;
      chest?: number;
      waist?: number;
      biceps?: number;
      leg?: number;
    };
  }>({
    email: "",
    name: "",
    phone: "",
    age: undefined,
    assignedTrainer: "none",
    bodyMeasurements: undefined,
  });

  const getAssignedTrainerId = (
    assignedTrainer: User["assignedTrainer"],
  ): string => {
    if (!assignedTrainer) return "none";
    if (typeof assignedTrainer === "string") {
      const matchedTrainer = trainers.find(
        (trainer) => trainer._id === assignedTrainer,
      );
      return matchedTrainer?._id || assignedTrainer;
    }
    // Backend always returns _id as string, no need to check id
    return assignedTrainer._id || "none";
  };

  const getAssignedTrainerName = (
    assignedTrainer: User["assignedTrainer"],
  ): string => {
    if (!assignedTrainer) return "No Trainer";
    if (typeof assignedTrainer === "string") {
      const matchedTrainer = trainers.find(
        (trainer) => trainer._id === assignedTrainer,
      );
      return matchedTrainer?.name || assignedTrainer || "No Trainer";
    }
    return assignedTrainer.name || "No Trainer";
  };

  // Get current logged-in user
  const currentUser = useAppSelector((state) => state.auth.user);
  const { isAuthenticated, accessToken } = useAppSelector(
    (state) => state.auth,
  );

  // Fetch data based on role
  // - OWNER: Fetches all staff (cashiers + trainers) + customers
  // - CASHIER: Fetches only trainers + customers (can't see other cashiers/owners)
  // - TRAINER:Fetches all customers (can see all, but can only update assigned ones)
  const { data: customers = [], isLoading: customersLoading } =
    useGetAllCustomersQuery(
      {},
      {
        skip: !isAuthenticated || !accessToken, // Wait for authentication
      },
    );
  const { data: staff = [], isLoading: staffLoading } = useGetAllStaffQuery(
    undefined,
    {
      skip:
        !isAuthenticated || !accessToken || currentUser?.role !== Role.OWNER, // Only OWNER can access /users/staff endpoint
    },
  );
  const { data: trainers = [], isLoading: trainersLoading } =
    useGetAllTrainersQuery(undefined, {
      skip: !isAuthenticated || !accessToken, // All roles need trainers list for dropdown
    });

  // Mutations
  const [createCustomer] = useCreateCustomerMutation();
  const [createStaff] = useCreateStaffMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateBodyMeasurements] = useUpdateBodyMeasurementsMutation();

  // Combine and filter users based on current user's role
  const allUsers = useMemo(() => {
    if (!currentUser) return [];

    // OWNER: Can see everyone (staff includes both cashiers and trainers)
    if (currentUser.role === Role.OWNER) {
      return [...customers, ...staff];
    }

    // CASHIER: Can see trainers and customers (trainers fetched separately)
    if (currentUser.role === Role.CASHIER) {
      return [...customers, ...trainers];
    }

    // TRAINER: Can only see customers assigned to them (backend already filters this)
    if (currentUser.role === Role.TRAINER) {
      return customers; // Backend filters by assignedTrainer
    }

    // CUSTOMER: Cannot access this page
    return [];
  }, [customers, staff, trainers, currentUser]);

  const isLoading = customersLoading || staffLoading || trainersLoading;

  // Filter users by search and role
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesName = searchName
        ? user.name.toLowerCase().includes(searchName.toLowerCase())
        : true;

      const matchesEmail = searchEmail
        ? user.email.toLowerCase().includes(searchEmail.toLowerCase())
        : true;

      const matchesRole = filterRole === "all" || user.role === filterRole;

      return matchesName && matchesEmail && matchesRole;
    });
  }, [allUsers, searchName, searchEmail, filterRole]);

  // Form state
  const [formData, setFormData] = useState<CreateUserDto>({
    email: "",
    password: "",
    name: "",
    phone: "",
    age: undefined,
    role: Role.CUSTOMER,
    assignedTrainer: undefined,
    bodyMeasurements: undefined,
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Clean up bodyMeasurements - if all values are undefined, send undefined
      const cleanedFormData = { ...formData };
      if (cleanedFormData.bodyMeasurements) {
        const hasAnyMeasurement = Object.values(
          cleanedFormData.bodyMeasurements,
        ).some((val) => val !== undefined);
        if (!hasAnyMeasurement) {
          cleanedFormData.bodyMeasurements = undefined;
        }
      }

      if (formData.role === Role.CUSTOMER) {
        await createCustomer(cleanedFormData).unwrap();
      } else {
        await createStaff(cleanedFormData).unwrap();
      }
      setIsCreateDialogOpen(false);
      setFormData({
        email: "",
        password: "",
        name: "",
        phone: "",
        age: undefined,
        role: Role.CUSTOMER,
        assignedTrainer: undefined,
        bodyMeasurements: undefined,
      });
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      // Debug logging
      console.log("Full user object:", user);
      console.log("User ID (_id):", user._id);
      console.log("User keys:", Object.keys(user));

      if (!user._id) {
        console.error("Error: user._id is undefined!");
        alert(
          "Cannot update user: User ID is missing. Please refresh the page and try again.",
        );
        return;
      }

      console.log("Updating user:", user._id, "with data:", {
        isActive: !user.isActive,
      });
      await updateUser({
        id: user._id,
        data: { isActive: !user.isActive },
      }).unwrap();
      console.log("User updated successfully");
    } catch (error: any) {
      console.error("Failed to update user:", error);
      console.error("Error details:", {
        status: error?.status,
        data: error?.data,
        message: error?.data?.message || error?.message,
      });
      alert(
        `Failed to update user: ${error?.data?.message || error?.message || "Unknown error"}`,
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!userId) {
      console.error("Error: userId is undefined!");
      alert(
        "Cannot delete user: User ID is missing. Please refresh the page and try again.",
      );
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        console.log("Deleting user:", userId);
        await deleteUser(userId).unwrap();
        console.log("User deleted successfully");
      } catch (error: any) {
        console.error("Failed to delete user:", error);
        alert(
          `Failed to delete user: ${error?.data?.message || error?.message || "Unknown error"}`,
        );
      }
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    // Initialize edit form with current user data
    setEditFormData({
      email: user.email,
      name: user.name,
      phone: user.phone || "",
      age: user.age ?? undefined,
      assignedTrainer: getAssignedTrainerId(user.assignedTrainer),
      bodyMeasurements: user.bodyMeasurements
        ? {
            height: user.bodyMeasurements.height ?? undefined,
            weight: user.bodyMeasurements.weight ?? undefined,
            bodyFat: user.bodyMeasurements.bodyFat ?? undefined,
            chest: user.bodyMeasurements.chest ?? undefined,
            waist: user.bodyMeasurements.waist ?? undefined,
            biceps: user.bodyMeasurements.biceps ?? undefined,
            leg: user.bodyMeasurements.leg ?? undefined,
          }
        : undefined,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const updateData: any = {};

      // Collect all editable fields
      if (editFormData.email !== selectedUser.email) {
        updateData.email = editFormData.email;
      }
      if (editFormData.name !== selectedUser.name) {
        updateData.name = editFormData.name;
      }
      if (editFormData.phone !== (selectedUser.phone || "")) {
        updateData.phone = editFormData.phone;
      }
      if (editFormData.age !== selectedUser.age) {
        updateData.age = editFormData.age;
      }

      // Handle assigned trainer
      const currentTrainerId = getAssignedTrainerId(
        selectedUser.assignedTrainer,
      );

      if (editFormData.assignedTrainer !== currentTrainerId) {
        updateData.assignedTrainer =
          editFormData.assignedTrainer === "none"
            ? null
            : editFormData.assignedTrainer;
      }

      // Only update if there's data to update
      if (Object.keys(updateData).length > 0) {
        await updateUser({
          id: selectedUser._id,
          data: updateData,
        }).unwrap();
        console.log("User updated successfully");
      }

      // Handle body measurements separately (only for customers)
      if (
        selectedUser.role === Role.CUSTOMER &&
        editFormData.bodyMeasurements
      ) {
        const hasAnyMeasurement = Object.values(
          editFormData.bodyMeasurements,
        ).some((val) => val !== undefined);
        if (hasAnyMeasurement) {
          await updateBodyMeasurements({
            customerId: selectedUser._id,
            measurements: editFormData.bodyMeasurements,
          }).unwrap();
          console.log("Body measurements updated successfully");
        }
      }

      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error("Failed to update user:", error);
      alert(
        `Failed to update user: ${error?.data?.message || error?.message || "Unknown error"}`,
      );
    }
  };

  const router = useRouter();

  const handleViewMeasurements = (userId: string) => {
    // Navigate to body measurements page/modal
    // For now, just show an alert - you can implement a modal or separate page
    router.push(`/users/${userId}/measurements`);
  };

  const handleViewHistory = (user: User) => {
    // Navigate to dedicated subscription history page
    router.push(`/subscriptions/customer/${user._id}`);
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case Role.OWNER:
        return "destructive";
      case Role.CASHIER:
        return "default";
      case Role.TRAINER:
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-slate-100 p-3.5">
                <Users2 className="h-8 w-8 text-slate-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Users Management
                </h1>
                <p className="text-slate-600 mt-1.5 text-base">
                  {currentUser?.role === Role.TRAINER
                    ? "Manage your assigned customers"
                    : "Manage all users, staff, and customers"}
                </p>
              </div>
            </div>
            {/* Only show Create button for Owner and Cashier */}
            {currentUser &&
              (currentUser.role === Role.OWNER ||
                currentUser.role === Role.CASHIER) && (
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm font-semibold px-6 py-6 text-base">
                      <Plus className="mr-2 h-5 w-5" />
                      Create User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                      <DialogDescription>
                        Add a new user to the system. Fill in the required
                        information below.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              age: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value: Role) =>
                            setFormData({ ...formData, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Always show Customer - both Owner and Cashier can create */}
                            <SelectItem value={Role.CUSTOMER}>
                              Customer
                            </SelectItem>

                            {/* Both Owner and Cashier can create Trainers */}
                            {currentUser &&
                              (currentUser.role === Role.OWNER ||
                                currentUser.role === Role.CASHIER) && (
                                <SelectItem value={Role.TRAINER}>
                                  Trainer
                                </SelectItem>
                              )}

                            {/* Only Owner can create Cashiers */}
                            {currentUser?.role === Role.OWNER && (
                              <SelectItem value={Role.CASHIER}>
                                Cashier
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Personal Trainer Assignment (only for customers) */}
                      {formData.role === Role.CUSTOMER && (
                        <div className="space-y-2">
                          <Label htmlFor="assignedTrainer">
                            Assign Trainer (Optional)
                          </Label>
                          <Select
                            value={formData.assignedTrainer || "none"}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                assignedTrainer:
                                  value === "none" ? undefined : value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a trainer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Trainer</SelectItem>
                              {trainers.map((trainer) => (
                                <SelectItem key={trainer._id} value={trainer._id}>
                                  {trainer.nickname || trainer.name} ({trainer.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Body Measurements Section (Optional) */}
                      <div className="space-y-3 border-t pt-4">
                        <h4 className="text-sm font-medium">
                          Body Measurements (Optional)
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input
                              id="height"
                              type="number"
                              placeholder="170"
                              value={formData.bodyMeasurements?.height || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  bodyMeasurements: {
                                    ...formData.bodyMeasurements,
                                    height: e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                              id="weight"
                              type="number"
                              placeholder="70"
                              value={formData.bodyMeasurements?.weight || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  bodyMeasurements: {
                                    ...formData.bodyMeasurements,
                                    weight: e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bodyFat">Body Fat (%)</Label>
                            <Input
                              id="bodyFat"
                              type="number"
                              placeholder="15"
                              value={formData.bodyMeasurements?.bodyFat || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  bodyMeasurements: {
                                    ...formData.bodyMeasurements,
                                    bodyFat: e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="chest">Chest (cm)</Label>
                            <Input
                              id="chest"
                              type="number"
                              placeholder="100"
                              value={formData.bodyMeasurements?.chest || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  bodyMeasurements: {
                                    ...formData.bodyMeasurements,
                                    chest: e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="waist">Waist (cm)</Label>
                            <Input
                              id="waist"
                              type="number"
                              placeholder="80"
                              value={formData.bodyMeasurements?.waist || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  bodyMeasurements: {
                                    ...formData.bodyMeasurements,
                                    waist: e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="biceps">Biceps (cm)</Label>
                            <Input
                              id="biceps"
                              type="number"
                              placeholder="35"
                              value={formData.bodyMeasurements?.biceps || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  bodyMeasurements: {
                                    ...formData.bodyMeasurements,
                                    biceps: e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="leg">Leg (cm)</Label>
                            <Input
                              id="leg"
                              type="number"
                              placeholder="55"
                              value={formData.bodyMeasurements?.leg || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  bodyMeasurements: {
                                    ...formData.bodyMeasurements,
                                    leg: e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button type="submit">Create User</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
          </div>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information. Edit name, email, phone, and age.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <form onSubmit={handleUpdateUser} className="space-y-4">
                {/* Editable: Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Editable: Email */}
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* Editable: Phone and Age */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={editFormData.age || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          age: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Read-only: Role */}
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={selectedUser.role}
                    disabled
                    className="capitalize"
                  />
                </div>

                {/* Read-only: Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Input
                    value={selectedUser.isActive ? "Active" : "Inactive"}
                    disabled
                  />
                </div>

                {/* Editable: Assigned Trainer (only for customers) */}
                {selectedUser.role === Role.CUSTOMER && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-assignedTrainer">
                      Assign Trainer (Optional)
                    </Label>
                    <Select
                      value={editFormData.assignedTrainer}
                      onValueChange={(value) =>
                        setEditFormData({
                          ...editFormData,
                          assignedTrainer: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a trainer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Trainer</SelectItem>
                        {trainers.map((trainer) => (
                          <SelectItem key={trainer._id} value={trainer._id}>
                            {trainer.nickname || trainer.name} ({trainer.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Editable: Body Measurements (only for customers) */}
                {selectedUser.role === Role.CUSTOMER && (
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="text-sm font-medium">
                      Body Measurements (Optional)
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Update the customer's body measurements
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="edit-height">Height (cm)</Label>
                        <Input
                          id="edit-height"
                          type="number"
                          placeholder="170"
                          value={editFormData.bodyMeasurements?.height || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              bodyMeasurements: {
                                ...editFormData.bodyMeasurements,
                                height: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-weight">Weight (kg)</Label>
                        <Input
                          id="edit-weight"
                          type="number"
                          placeholder="70"
                          value={editFormData.bodyMeasurements?.weight || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              bodyMeasurements: {
                                ...editFormData.bodyMeasurements,
                                weight: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-bodyFat">Body Fat (%)</Label>
                        <Input
                          id="edit-bodyFat"
                          type="number"
                          placeholder="15"
                          value={editFormData.bodyMeasurements?.bodyFat || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              bodyMeasurements: {
                                ...editFormData.bodyMeasurements,
                                bodyFat: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-chest">Chest (cm)</Label>
                        <Input
                          id="edit-chest"
                          type="number"
                          placeholder="100"
                          value={editFormData.bodyMeasurements?.chest || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              bodyMeasurements: {
                                ...editFormData.bodyMeasurements,
                                chest: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-waist">Waist (cm)</Label>
                        <Input
                          id="edit-waist"
                          type="number"
                          placeholder="80"
                          value={editFormData.bodyMeasurements?.waist || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              bodyMeasurements: {
                                ...editFormData.bodyMeasurements,
                                waist: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-biceps">Biceps (cm)</Label>
                        <Input
                          id="edit-biceps"
                          type="number"
                          placeholder="35"
                          value={editFormData.bodyMeasurements?.biceps || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              bodyMeasurements: {
                                ...editFormData.bodyMeasurements,
                                biceps: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-leg">Leg (cm)</Label>
                        <Input
                          id="edit-leg"
                          type="number"
                          placeholder="55"
                          value={editFormData.bodyMeasurements?.leg || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              bodyMeasurements: {
                                ...editFormData.bodyMeasurements,
                                leg: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Search and Filters */}
        <div className="rounded-xl bg-white p-6 shadow-lg border border-slate-200">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-10 border-slate-300 hover:border-slate-400 focus-visible:border-slate-500 transition-colors"
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="pl-10 border-slate-300 hover:border-slate-400 focus-visible:border-slate-500 transition-colors"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-45 border-slate-300 hover:border-slate-400 transition-colors">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value={Role.CUSTOMER}>Customer</SelectItem>
                {/* Only show Trainer filter for Owner and Cashier */}
                {currentUser &&
                  (currentUser.role === Role.OWNER ||
                    currentUser.role === Role.CASHIER) && (
                    <SelectItem value={Role.TRAINER}>Trainer</SelectItem>
                  )}
                {/* Only show Cashier filter for Owner */}
                {currentUser?.role === Role.OWNER && (
                  <SelectItem value={Role.CASHIER}>Cashier</SelectItem>
                )}
                {/* Only show Owner filter for Owner */}
                {currentUser?.role === Role.OWNER && (
                  <SelectItem value={Role.OWNER}>Owner</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-1">
              Total Users
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {allUsers.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-1">
              Active Users
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {allUsers.filter((u) => u.isActive).length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-1">
              Customers
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {customers.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-1">
              {currentUser?.role === Role.CASHIER ? "Trainers" : "Staff"}
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {currentUser?.role === Role.CASHIER
                ? trainers.length
                : staff.length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Trainer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow key="loading">
                  <TableCell colSpan={7} className="text-center">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow key="empty">
                  <TableCell colSpan={7} className="text-center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === Role.CUSTOMER
                        ? getAssignedTrainerName(user.assignedTrainer)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "warning"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {/* All Actions in Dropdown */}
                        {currentUser && (
                          <UserActionsDropdown
                            user={user}
                            currentUserRole={currentUser.role}
                            onEdit={handleEditUser}
                            onDelete={handleDeleteUser}
                            onViewMeasurements={handleViewMeasurements}
                            onToggleActive={handleToggleActive}
                            onViewHistory={handleViewHistory}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

