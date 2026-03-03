"use client";

import { useState, useMemo } from "react";
import { Filter, Plus, Calendar, History, List } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  calculateGymFinalPrice,
  calculateServiceFinalPrice,
} from "@/src/lib/priceCalculations";
import { DataTable } from "@/src/components/data-table/table-data";
import { DataTablePagination } from "@/src/components/data-table/data-table-pagination";
import { createSubscriptionColumns } from "./columns";
import { SubscriptionDetailsDialog } from "@/src/components/subscriptions/SubscriptionDetailsDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
  useGetAllSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useDeleteSubscriptionMutation,
} from "@/src/store/services/subscriptionsApi";
import {
  useGetAllGymPriceGroupsQuery,
  useGetAllOtherServiceGroupsQuery,
} from "@/src/store/services/customFeesApi";
import {
  useGetAllCustomersQuery,
  useGetAllTrainersQuery,
} from "@/src/store/services/usersApi";
import { useAppSelector } from "@/src/store/hooks";
import {
  Subscription,
  CreateSubscriptionDto,
  GymPriceGroup,
  OtherServiceGroup,
} from "@/src/types/extended-types";
import { Role } from "@/src/types/type";

// Remove mock data
export default function SubscriptionsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [subscriptionToEdit, setSubscriptionToEdit] =
    useState<Subscription | null>(null);
  const [formData, setFormData] = useState({
    customer: "",
    startDate: new Date().toISOString().split("T")[0],
    paymentStatus: "pending" as "paid" | "pending" | "partial",
    paidAmount: 0,
    trainerId: undefined as string | undefined,
    notes: undefined as string | undefined,
  });
  const [selectedGymPriceGroupId, setSelectedGymPriceGroupId] =
    useState<string>("");
  const [selectedGymPriceRowId, setSelectedGymPriceRowId] =
    useState<string>("");
  const [selectedServiceRows, setSelectedServiceRows] = useState<{
    [groupId: string]: string[];
  }>({});

  const currentUser = useAppSelector((state) => state.auth.user);
  const { isAuthenticated, accessToken } = useAppSelector(
    (state) => state.auth,
  );

  // Fetch subscriptions with filters
  const {
    data: subscriptionsData,
    isLoading,
    refetch,
  } = useGetAllSubscriptionsQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page: undefined, // Get all results for client-side pagination
    limit: undefined,
  });
  const subscriptions = Array.isArray(subscriptionsData)
    ? subscriptionsData
    : [];

  // Fetch customers for dropdown
  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
    error: customersError,
  } = useGetAllCustomersQuery(
    {},
    {
      skip: !isAuthenticated || !accessToken,
    },
  );

  // Fetch active gym price groups
  const { data: gymPriceGroups = [] } = useGetAllGymPriceGroupsQuery(
    { active: true },
    {
      skip: !isAuthenticated || !accessToken || !isCreateDialogOpen,
    },
  );

  // Fetch active service groups
  const { data: serviceGroups = [] } = useGetAllOtherServiceGroupsQuery(
    { active: true },
    {
      skip: !isAuthenticated || !accessToken || !isCreateDialogOpen,
    },
  );

  // Fetch trainers for dropdown
  const { data: trainers = [] } = useGetAllTrainersQuery(undefined, {
    skip: !isAuthenticated || !accessToken || !isCreateDialogOpen,
  });

  const [createSubscription] = useCreateSubscriptionMutation();
  const [updateSubscription] = useUpdateSubscriptionMutation();
  const [deleteSubscription] = useDeleteSubscriptionMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();

  // Calculate totals for selected packages
  const calculatedTotals = useMemo(() => {
    let gymPriceTotal = 0;
    let otherServiceTotal = 0;
    let trainerFeeTotal = 0;

    // Calculate gym price total
    if (selectedGymPriceGroupId && selectedGymPriceRowId) {
      const selectedGroup = gymPriceGroups.find(
        (g) => g._id === selectedGymPriceGroupId
      );
      if (selectedGroup) {
        const selectedPrice = selectedGroup.prices.find(
          (p) => p._id === selectedGymPriceRowId
        );
        if (selectedPrice) {
          gymPriceTotal = calculateGymFinalPrice(selectedPrice);
        }
      }
    }

    // Calculate other services total
    Object.entries(selectedServiceRows).forEach(([groupId, serviceIds]) => {
      const group = serviceGroups.find((g) => g._id === groupId);
      if (group) {
        serviceIds.forEach((serviceId) => {
          const service = group.services.find((s) => s._id === serviceId);
          if (service) {
            otherServiceTotal += calculateServiceFinalPrice(service);
          }
        });
      }
    });

    // Calculate trainer fee
    if (formData.trainerId) {
      const selectedTrainer = trainers.find((t) => t._id === formData.trainerId);
      if (selectedTrainer && selectedTrainer.trainerFee) {
        trainerFeeTotal = selectedTrainer.trainerFee;
      }
    }

    const grandTotal = gymPriceTotal + otherServiceTotal + trainerFeeTotal;
    const remainingAmount = grandTotal - formData.paidAmount;

    return {
      gymPriceTotal,
      otherServiceTotal,
      trainerFeeTotal,
      grandTotal,
      remainingAmount,
    };
  }, [
    selectedGymPriceGroupId,
    selectedGymPriceRowId,
    selectedServiceRows,
    formData.trainerId,
    formData.paidAmount,
    gymPriceGroups,
    serviceGroups,
    trainers,
  ]);

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && subscriptionToEdit) {
        // Update existing subscription
        const updateDto: any = {
          paymentStatus: formData.paymentStatus,
          paidAmount: formData.paidAmount,
          notes: formData.notes || undefined,
        };

        console.log(
          "Updating subscription with DTO:",
          JSON.stringify(updateDto, null, 2),
        );
        await updateSubscription({
          id: subscriptionToEdit._id,
          data: updateDto,
        }).unwrap();

        // Manually refetch subscriptions to ensure the list updates
        await refetch();

        setIsCreateDialogOpen(false);
        setIsEditMode(false);
        setSubscriptionToEdit(null);

        // Reset form
        setFormData({
          customer: "",
          startDate: new Date().toISOString().split("T")[0],
          paymentStatus: "pending",
          paidAmount: 0,
          trainerId: undefined,
          notes: undefined,
        });
      } else {
        // Create new subscription
        // Calculate end date based on selected gym price duration
        let endDate = new Date(formData.startDate);

        if (selectedGymPriceGroupId && selectedGymPriceRowId) {
          // Find the selected gym price to get duration
          const selectedGroup = gymPriceGroups.find(
            (g) => g._id === selectedGymPriceGroupId,
          );
          const selectedPrice = selectedGroup?.prices.find(
            (p) => p._id === selectedGymPriceRowId,
          );

          if (selectedPrice) {
            if (selectedPrice.durationUnit === "days") {
              endDate.setDate(endDate.getDate() + selectedPrice.duration);
            } else if (selectedPrice.durationUnit === "months") {
              endDate.setMonth(endDate.getMonth() + selectedPrice.duration);
            } else if (selectedPrice.durationUnit === "years") {
              endDate.setFullYear(
                endDate.getFullYear() + selectedPrice.duration,
              );
            }
          }
        } else {
          // Default to 1 month if no gym price selected
          endDate.setMonth(endDate.getMonth() + 1);
        }

        const dto: CreateSubscriptionDto = {
          customer: formData.customer,
          startDate: formData.startDate,
          endDate: endDate.toISOString().split("T")[0],
          paymentStatus: formData.paymentStatus as any,
          paidAmount: formData.paidAmount,
          notes: formData.notes,
        };

        // Add gym price group selection if any
        if (selectedGymPriceGroupId && selectedGymPriceRowId) {
          dto.gymPrice = {
            groupId: selectedGymPriceGroupId,
            priceRowId: selectedGymPriceRowId,
          };
        }

        // Add service selections if any
        if (Object.keys(selectedServiceRows).length > 0) {
          dto.otherServices = Object.entries(selectedServiceRows).map(
            ([groupId, serviceRowIds]) => ({
              groupId,
              serviceRowIds,
            }),
          );
        }

        // Add trainer if selected
        if (formData.trainerId) {
          dto.trainerId = formData.trainerId;
        }

        console.log(
          "Creating subscription with DTO:",
          JSON.stringify(dto, null, 2),
        );
        const result = await createSubscription(dto).unwrap();

        // Manually refetch subscriptions to ensure the list updates
        await refetch();

        // Show success message

        setIsCreateDialogOpen(false);

        // Reset form
        setFormData({
          customer: "",
          startDate: new Date().toISOString().split("T")[0],
          paymentStatus: "pending",
          paidAmount: 0,
          trainerId: undefined,
          notes: undefined,
        });
        setSelectedGymPriceGroupId("");
        setSelectedGymPriceRowId("");
        setSelectedServiceRows({});
      }
    } catch (error: any) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} subscription:`,
        error,
      );
      console.error("Error details:", JSON.stringify(error, null, 2));
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        `Failed to ${isEditMode ? "update" : "create"} subscription. Please try again.`;
      alert(`Error: ${errorMessage}`);
    }
  };

  // Handle service row selection
  const handleServiceRowToggle = (groupId: string, serviceRowId: string) => {
    setSelectedServiceRows((prev) => {
      const currentSelections = prev[groupId] || [];
      const isSelected = currentSelections.includes(serviceRowId);

      if (isSelected) {
        // Remove from selection
        const newSelections = currentSelections.filter(
          (id) => id !== serviceRowId,
        );
        if (newSelections.length === 0) {
          const { [groupId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [groupId]: newSelections };
      } else {
        // Add to selection
        return { ...prev, [groupId]: [...currentSelections, serviceRowId] };
      }
    });
  };

  const canCreateSubscription =
    currentUser &&
    (currentUser.role === Role.OWNER || currentUser.role === Role.CASHIER);

  const handleCancelSubscription = async (subscription: Subscription) => {
    const customerName =
      typeof subscription.customer === "object"
        ? subscription.customer?.name
        : "this customer";
    if (
      confirm(
        `Cancel subscription for ${customerName}? This will mark the subscription as cancelled.`,
      )
    ) {
      try {
        await cancelSubscription(subscription._id).unwrap();
      } catch (error) {
        console.error("Failed to cancel subscription:", error);
        alert("Failed to cancel subscription. Please try again.");
      }
    }
  };

  const handleDeleteSubscription = async (subscription: Subscription) => {
    const customerName =
      typeof subscription.customer === "object"
        ? subscription.customer?.name
        : "this customer";
    if (
      confirm(
        `Permanently delete subscription for ${customerName}? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteSubscription(subscription._id).unwrap();
      } catch (error) {
        console.error("Failed to delete subscription:", error);
        alert("Failed to delete subscription. Please try again.");
      }
    }
  };

  const handleViewDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdate = (subscription: Subscription) => {
    setSubscriptionToEdit(subscription);
    setIsEditMode(true);
    // Pre-populate form data with editable fields
    setFormData({
      customer:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?._id || "",
      startDate:
        typeof subscription.startDate === "string"
          ? subscription.startDate.split("T")[0]
          : new Date(subscription.startDate).toISOString().split("T")[0],
      paymentStatus: subscription.paymentStatus,
      paidAmount: subscription.paidAmount,
      trainerId: subscription.trainer
        ? typeof subscription.trainer === "object" &&
          "_id" in subscription.trainer
          ? String(subscription.trainer._id)
          : undefined
        : undefined,
      notes: subscription.notes || undefined,
    });
    // Note: We cannot change gym price, services, dates, or customer in update mode
    // Only paymentStatus, paidAmount, notes, and status can be updated
    setIsCreateDialogOpen(true);
  };

  // Memoize columns with action handlers
  const columns = useMemo(
    () =>
      createSubscriptionColumns({
        onCancel: canCreateSubscription ? handleCancelSubscription : undefined,
        onDelete:
          currentUser?.role === Role.OWNER
            ? handleDeleteSubscription
            : undefined,
        onViewDetails: handleViewDetails,
        onUpdate: canCreateSubscription ? handleUpdate : undefined,
      }),
    [canCreateSubscription, currentUser],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  <Calendar className="h-8 w-8 text-slate-900 dark:text-slate-100" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Subscriptions
                </h1>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Manage member subscriptions and renewals
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {canCreateSubscription && (
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={(open) => {
                    setIsCreateDialogOpen(open);
                    if (!open) {
                      // Reset edit mode when dialog closes
                      setIsEditMode(false);
                      setSubscriptionToEdit(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-sm font-semibold px-6 py-6 text-base"
                      onClick={() => {
                        setIsEditMode(false);
                        setSubscriptionToEdit(null);
                      }}
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Create Subscription
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {isEditMode
                          ? "Edit Subscription"
                          : "Create New Subscription"}
                      </DialogTitle>
                      <DialogDescription>
                        {isEditMode
                          ? "Update payment status, amount, and notes for this subscription"
                          : "Create a new subscription for a customer"}
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={handleCreateSubscription}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="customer">Customer *</Label>
                        <Select
                          value={formData.customer}
                          onValueChange={(value) =>
                            setFormData({ ...formData, customer: value })
                          }
                          required
                          disabled={isEditMode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingCustomers ? (
                              <SelectItem value="loading" disabled>
                                Loading customers...
                              </SelectItem>
                            ) : customers.length === 0 ? (
                              <SelectItem value="empty" disabled>
                                No customers found
                              </SelectItem>
                            ) : (
                              customers.map((customer) => (
                                <SelectItem
                                  key={customer._id}
                                  value={customer._id}
                                >
                                  {customer.name} ({customer.email})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* GYM PRICE PACKAGE SELECTION - Only in create mode */}
                      {!isEditMode && gymPriceGroups.length > 0 && (
                        <div className="space-y-3">
                          {gymPriceGroups.map((group: GymPriceGroup) => (
                            <div
                              key={group._id}
                              className="border rounded-lg p-3 space-y-2"
                            >
                              <div className="font-medium text-sm">
                                {group.name}
                              </div>
                              <div className="space-y-2">
                                {group.prices
                                  .filter((p) => p.isActive)
                                  .map((priceItem) => (
                                    <div
                                      key={priceItem._id}
                                      className="flex items-center space-x-2"
                                    >
                                      <input
                                        type="radio"
                                        id={`price-${priceItem._id}`}
                                        name="gymPrice"
                                        checked={
                                          selectedGymPriceGroupId ===
                                            group._id &&
                                          selectedGymPriceRowId ===
                                            priceItem._id
                                        }
                                        onChange={() => {
                                          setSelectedGymPriceGroupId(group._id);
                                          setSelectedGymPriceRowId(
                                            priceItem._id,
                                          );
                                        }}
                                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                                      />
                                      <label
                                        htmlFor={`price-${priceItem._id}`}
                                        className="text-sm flex-1 cursor-pointer"
                                      >
                                        <div className="flex flex-col">
                                          <span>
                                            {priceItem.duration}{" "}
                                            {priceItem.durationUnit} -{" "}
                                            {priceItem.amount.toLocaleString()}{" "}
                                            MMK/
                                            {priceItem.durationUnit === "months"
                                              ? "month"
                                              : priceItem.durationUnit ===
                                                  "days"
                                                ? "day"
                                                : "year"}
                                          </span>
                                          <span className="font-semibold text-emerald-600">
                                            Total:{" "}
                                            {calculateGymFinalPrice(
                                              priceItem,
                                            ).toLocaleString()}{" "}
                                            MMK
                                          </span>
                                          {priceItem.promotionType &&
                                            priceItem.promotionValue && (
                                              <span className="text-green-600 text-xs">
                                                (Promo:{" "}
                                                {priceItem.promotionType ===
                                                "percentage"
                                                  ? `${priceItem.promotionValue}%`
                                                  : `${priceItem.promotionValue} MMK`}{" "}
                                                off)
                                              </span>
                                            )}
                                        </div>
                                      </label>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* OTHER SERVICES SELECTION - Only in create mode */}
                      {!isEditMode && serviceGroups.length > 0 && (
                        <div className="space-y-3">
                          <Label>Additional Services (Optional)</Label>
                          {serviceGroups.map((group: OtherServiceGroup) => (
                            <div
                              key={group._id}
                              className="border rounded-lg p-3 space-y-2"
                            >
                              <div className="font-medium text-sm">
                                {group.name}
                              </div>
                              <div className="space-y-2">
                                {group.services
                                  .filter((s) => s.isActive)
                                  .map((service) => (
                                    <div
                                      key={service._id}
                                      className="flex items-center space-x-2"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`service-${service._id}`}
                                        checked={
                                          selectedServiceRows[
                                            group._id
                                          ]?.includes(service._id!) || false
                                        }
                                        onChange={() =>
                                          handleServiceRowToggle(
                                            group._id,
                                            service._id!,
                                          )
                                        }
                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                      />
                                      <label
                                        htmlFor={`service-${service._id}`}
                                        className="text-sm flex-1 cursor-pointer"
                                      >
                                        <div className="flex flex-col">
                                          <span>
                                            {service.name} - {service.duration}{" "}
                                            {service.durationUnit} -{" "}
                                            {service.price.toLocaleString()}{" "}
                                            MMK/
                                            {service.durationUnit === "months"
                                              ? "month"
                                              : service.durationUnit === "days"
                                                ? "day"
                                                : "year"}
                                          </span>
                                          <span className="font-semibold text-emerald-600">
                                            Total:{" "}
                                            {calculateServiceFinalPrice(
                                              service,
                                            ).toLocaleString()}{" "}
                                            MMK
                                          </span>
                                          {service.promotionType &&
                                            service.promotionValue && (
                                              <span className="text-green-600 text-xs">
                                                (Promo:{" "}
                                                {service.promotionType ===
                                                "percentage"
                                                  ? `${service.promotionValue}%`
                                                  : `${service.promotionValue} MMK`}{" "}
                                                off)
                                              </span>
                                            )}
                                        </div>
                                      </label>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* TRAINER SELECTION */}
                      <div className="space-y-2">
                        <Label htmlFor="trainerId">Trainer (Optional)</Label>
                        <Select
                          value={formData.trainerId || ""}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              trainerId: value === "none" ? undefined : value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a trainer (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Trainer</SelectItem>
                            {trainers.map((trainer) => (
                              <SelectItem key={trainer._id} value={trainer._id}>
                                {trainer.name} ({trainer.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date *</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                startDate: e.target.value,
                              })
                            }
                            required
                            disabled={isEditMode}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="paymentStatus">
                            Payment Status *
                          </Label>
                          <Select
                            value={formData.paymentStatus}
                            onValueChange={(value: any) =>
                              setFormData({ ...formData, paymentStatus: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="partial">Partial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {(formData.paymentStatus === "paid" ||
                        formData.paymentStatus === "partial") && (
                        <div className="space-y-2">
                          <Label htmlFor="paidAmount">
                            Paid Amount *
                            {!isEditMode && calculatedTotals.grandTotal > 0 && (
                              <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                                (Total: {calculatedTotals.grandTotal.toLocaleString()} MMK)
                              </span>
                            )}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="paidAmount"
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.paidAmount || 0}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  paidAmount: Number(e.target.value),
                                })
                              }
                              placeholder="Enter paid amount"
                              required
                              className="flex-1"
                            />
                            {!isEditMode && calculatedTotals.grandTotal > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    paidAmount: calculatedTotals.grandTotal,
                                  })
                                }
                                className="whitespace-nowrap"
                              >
                                Pay Full
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          placeholder="Additional notes..."
                          rows={3}
                        />
                      </div>

                      {/* TOTAL SUMMARY - Only show in create mode */}
                      {!isEditMode && calculatedTotals.grandTotal > 0 && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-5 space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                              Subscription Summary
                            </h3>
                          </div>

                          {/* Gym Price */}
                          {calculatedTotals.gymPriceTotal > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-800/50">
                              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                Gym Membership
                              </span>
                              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                                {calculatedTotals.gymPriceTotal.toLocaleString()} MMK
                              </span>
                            </div>
                          )}

                          {/* Other Services */}
                          {calculatedTotals.otherServiceTotal > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-800/50">
                              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                Additional Services
                              </span>
                              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                                {calculatedTotals.otherServiceTotal.toLocaleString()} MMK
                              </span>
                            </div>
                          )}

                          {/* Trainer Fee */}
                          {calculatedTotals.trainerFeeTotal > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-800/50">
                              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                Trainer Fee
                              </span>
                              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                                {calculatedTotals.trainerFeeTotal.toLocaleString()} MMK
                              </span>
                            </div>
                          )}

                          {/* Grand Total */}
                          <div className="flex justify-between items-center pt-3 border-t-2 border-emerald-300 dark:border-emerald-700">
                            <span className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                              Total Amount
                            </span>
                            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                              {calculatedTotals.grandTotal.toLocaleString()} MMK
                            </span>
                          </div>

                          {/* Paid Amount */}
                          {formData.paidAmount > 0 && (
                            <div className="flex justify-between items-center py-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg px-3">
                              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Paid Amount
                              </span>
                              <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                {formData.paidAmount.toLocaleString()} MMK
                              </span>
                            </div>
                          )}

                          {/* Remaining Amount */}
                          {formData.paidAmount > 0 && calculatedTotals.remainingAmount !== 0 && (
                            <div className={`flex justify-between items-center py-2 rounded-lg px-3 ${
                              calculatedTotals.remainingAmount > 0
                                ? "bg-amber-50 dark:bg-amber-950/30"
                                : "bg-green-50 dark:bg-green-950/30"
                            }`}>
                              <span className={`text-sm font-medium ${
                                calculatedTotals.remainingAmount > 0
                                  ? "text-amber-800 dark:text-amber-200"
                                  : "text-green-800 dark:text-green-200"
                              }`}>
                                {calculatedTotals.remainingAmount > 0 ? "Remaining Balance" : "Overpaid"}
                              </span>
                              <span className={`text-sm font-bold ${
                                calculatedTotals.remainingAmount > 0
                                  ? "text-amber-900 dark:text-amber-100"
                                  : "text-green-900 dark:text-green-100"
                              }`}>
                                {Math.abs(calculatedTotals.remainingAmount).toLocaleString()} MMK
                              </span>
                            </div>
                          )}

                          {/* Payment Status Indicator */}
                          {formData.paidAmount > 0 && (
                            <div className="text-center pt-2">
                              {calculatedTotals.remainingAmount === 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Fully Paid
                                </span>
                              )}
                              {calculatedTotals.remainingAmount > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  Partial Payment
                                </span>
                              )}
                              {calculatedTotals.remainingAmount < 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  Overpayment
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button type="submit">
                          {isEditMode
                            ? "Update Subscription"
                            : "Create Subscription"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm p-6 mb-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl">
                <Filter className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Filter by Status:
              </span>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1); // Reset to first page when filter changes
                }}
              >
                <SelectTrigger className="w-48 border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customer History Selector */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl">
                <History className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                View History:
              </span>
              <Select
                value=""
                onValueChange={(customerId) => {
                  if (customerId) {
                    router.push(`/subscriptions/customer/${customerId}`);
                  }
                }}
              >
                <SelectTrigger className="w-64 border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCustomers ? (
                    <SelectItem value="loading" disabled>
                      Loading customers...
                    </SelectItem>
                  ) : customers.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No customers found
                    </SelectItem>
                  ) : (
                    customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.name} ({customer.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-950 shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
          <DataTable
            columns={columns}
            data={subscriptions.slice((page - 1) * limit, page * limit)}
            isLoading={isLoading}
            getRowId={(row) => row._id}
            emptyMessage="No subscriptions found."
            onRowClick={(subscription) => {
              console.log("Clicked subscription:", subscription._id);
              // router.push(`/subscriptions/${subscription._id}`);
            }}
          />
          {subscriptions.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-800 p-4">
              <DataTablePagination
                meta={{
                  page,
                  limit,
                  total: subscriptions.length,
                  totalPages: Math.ceil(subscriptions.length / limit),
                }}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        {/* Subscription Details Dialog */}
        <SubscriptionDetailsDialog
          subscription={selectedSubscription}
          isOpen={isDetailsDialogOpen}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedSubscription(null);
          }}
        />
      </div>
    </div>
  );
}
