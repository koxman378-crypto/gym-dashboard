"use client";

import { useState, useMemo } from "react";
import { Filter, Plus, Calendar, History, List } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { calculateGymFinalPrice } from "@/src/lib/priceCalculations";
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
  useGetAllGymFeeRecordsQuery,
  useGetAllOtherServiceItemsQuery,
} from "@/src/store/services/customFeesApi";
import {
  useGetAllCustomersQuery,
  useGetAllTrainersQuery,
} from "@/src/store/services/usersApi";
import { useAppSelector } from "@/src/store/hooks";
import {
  Subscription,
  CreateSubscriptionDto,
  OtherServiceItem,
  DurationUnit,
  PromotionType,
} from "@/src/types/extended-types";
import { Role } from "@/src/types/type";

// Remove mock data
export default function SubscriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    trainerFeeRowId: undefined as string | undefined,
    trainerDuration: 1,
    trainerDurationUnit: "months" as DurationUnit,
    trainerPromotionType: "none" as Exclude<PromotionType, null> | "none",
    trainerPromotionValue: "" as number | "",
    notes: undefined as string | undefined,
  });
  const [selectedGymFeeId, setSelectedGymFeeId] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<
    Record<
      string,
      {
        duration: number;
        durationUnit: DurationUnit;
        promotionType: Exclude<PromotionType, null> | "none";
        promotionValue: number | "";
      }
    >
  >({});

  const currentUser = useAppSelector((state) => state.auth.user);
  const { isAuthenticated, accessToken } = useAppSelector(
    (state) => state.auth,
  );
  const trainerIdFilter =
    searchParams.get("trainerId") ||
    (currentUser?.role === Role.TRAINER ? currentUser._id : undefined);

  // Fetch subscriptions with filters
  const {
    data: subscriptionsData,
    isLoading,
    refetch,
  } = useGetAllSubscriptionsQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit,
    trainerId: trainerIdFilter || undefined,
  });
  const subscriptions = subscriptionsData?.data ?? [];
  const paginationMeta = {
    page: subscriptionsData?.page ?? page,
    limit: subscriptionsData?.limit ?? limit,
    total: subscriptionsData?.total ?? 0,
    totalPages: subscriptionsData?.totalPages ?? 1,
  };

  // Fetch customers for dropdown
  const {
    data: customersData_,
    isLoading: isLoadingCustomers,
    error: customersError,
  } = useGetAllCustomersQuery(
    { limit: 100 },
    {
      skip: !isAuthenticated || !accessToken,
    },
  );
  const customers = customersData_?.data ?? [];

  // Fetch active gym fees
  const { data: gymFees = [] } = useGetAllGymFeeRecordsQuery(
    { active: true },
    {
      skip: !isAuthenticated || !accessToken || !isCreateDialogOpen,
    },
  );

  // Fetch active service items
  const { data: serviceItems = [] } = useGetAllOtherServiceItemsQuery(
    { active: true },
    {
      skip: !isAuthenticated || !accessToken || !isCreateDialogOpen,
    },
  );

  // Fetch trainers for dropdown
  const { data: trainers = [] } = useGetAllTrainersQuery(undefined, {
    skip: !isAuthenticated || !accessToken,
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

    // Calculate gym fee total
    if (selectedGymFeeId) {
      const selectedFee = gymFees.find((fee) => fee._id === selectedGymFeeId);
      if (selectedFee) {
        gymPriceTotal = calculateGymFinalPrice(selectedFee);
      }
    }

    // Calculate other services total
    Object.entries(selectedServices).forEach(([serviceId, values]) => {
      const service = serviceItems.find((item) => item._id === serviceId);
      if (!service) return;
      const baseTotal = service.amount * values.duration;
      let finalPrice = baseTotal;
      if (values.promotionType && values.promotionValue !== "") {
        if (values.promotionType === "percentage") {
          finalPrice = Math.round(
            baseTotal - (baseTotal * Number(values.promotionValue)) / 100,
          );
        } else if (values.promotionType === "mmk") {
          finalPrice = Math.max(0, baseTotal - Number(values.promotionValue));
        }
      }
      otherServiceTotal += finalPrice;
    });

    // Calculate trainer fee
    if (formData.trainerId && formData.trainerFeeRowId) {
      const selectedTrainer = trainers.find(
        (t) => t._id === formData.trainerId,
      );
      if (selectedTrainer && selectedTrainer.trainerFees) {
        const selectedFee = selectedTrainer.trainerFees.find(
          (f) => f._id === formData.trainerFeeRowId,
        );
        if (selectedFee) {
          const baseTotal = selectedFee.amount * formData.trainerDuration;
          let finalPrice = baseTotal;
          if (
            formData.trainerPromotionType &&
            formData.trainerPromotionValue !== ""
          ) {
            if (formData.trainerPromotionType === "percentage") {
              finalPrice = Math.round(
                baseTotal -
                  (baseTotal * Number(formData.trainerPromotionValue)) / 100,
              );
            } else if (formData.trainerPromotionType === "mmk") {
              finalPrice = Math.max(
                0,
                baseTotal - Number(formData.trainerPromotionValue),
              );
            }
          }
          trainerFeeTotal = finalPrice;
        }
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
    selectedGymFeeId,
    selectedServices,
    formData.trainerId,
    formData.trainerFeeRowId,
    formData.trainerDuration,
    formData.trainerDurationUnit,
    formData.trainerPromotionType,
    formData.trainerPromotionValue,
    formData.paidAmount,
    gymFees,
    serviceItems,
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
          trainerFeeRowId: undefined,
          trainerDuration: 1,
          trainerDurationUnit: "months",
          trainerPromotionType: "none",
          trainerPromotionValue: "",
          notes: undefined,
        });
      } else {
        // Create new subscription
        const dto: CreateSubscriptionDto = {
          customer: formData.customer,
          startDate: formData.startDate,
          paymentStatus: formData.paymentStatus as any,
          paidAmount: formData.paidAmount,
          notes: formData.notes,
        };

        // Add gym fee selection if any
        if (selectedGymFeeId) {
          dto.gymFee = {
            feeId: selectedGymFeeId,
          };
        }

        // Add service selections if any
        if (Object.keys(selectedServices).length > 0) {
          dto.services = Object.entries(selectedServices).map(
            ([serviceId, values]) => ({
              serviceId,
              duration: values.duration,
              durationUnit: values.durationUnit,
              promotionType:
                values.promotionType === "none"
                  ? undefined
                  : values.promotionType,
              promotionValue:
                values.promotionValue === ""
                  ? undefined
                  : values.promotionValue,
            }),
          );
        }

        // Add trainer if selected
        if (formData.trainerId && formData.trainerFeeRowId) {
          dto.trainer = {
            trainerId: formData.trainerId,
            trainerFeeId: formData.trainerFeeRowId,
            duration: formData.trainerDuration,
            durationUnit: formData.trainerDurationUnit,
            promotionType:
              formData.trainerPromotionType === "none"
                ? undefined
                : formData.trainerPromotionType,
            promotionValue:
              formData.trainerPromotionValue === ""
                ? undefined
                : formData.trainerPromotionValue,
          };
        }

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
          trainerFeeRowId: undefined,
          trainerDuration: 1,
          trainerDurationUnit: "months",
          trainerPromotionType: "none",
          trainerPromotionValue: "",
          notes: undefined,
        });
        setSelectedGymFeeId("");
        setSelectedServices({});
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        `Failed to ${isEditMode ? "update" : "create"} subscription. Please try again.`;
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) => {
      if (prev[serviceId]) {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      }

      return {
        ...prev,
        [serviceId]: {
          duration: 1,
          durationUnit: "months",
          promotionType: "none",
          promotionValue: "",
        },
      };
    });
  };

  const canCreateSubscription =
    currentUser &&
    (currentUser.role === Role.OWNER || currentUser.role === Role.CASHIER);
  const isTrainerView = currentUser?.role === Role.TRAINER;

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
      trainerFeeRowId: undefined, // Not editable in update mode
      trainerDuration:
        subscription.trainer && typeof subscription.trainer === "object"
          ? subscription.trainer.duration ?? 1
          : 1,
      trainerDurationUnit:
        subscription.trainer && typeof subscription.trainer === "object"
          ? (subscription.trainer.durationUnit as DurationUnit) ?? "months"
          : "months",
      trainerPromotionType:
        subscription.trainer && typeof subscription.trainer === "object"
          ? ((subscription.trainer.promotionType as PromotionType) ??
              "none")
          : "none",
      trainerPromotionValue:
        subscription.trainer && typeof subscription.trainer === "object"
          ? (subscription.trainer.promotionValue ?? "")
          : "",
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

  const subscriptionsWithTrainerInfo = useMemo(() => {
    if (!subscriptions.length) return subscriptions;

    const trainerById = new Map(
      trainers.map((trainer) => [trainer._id, trainer]),
    );

    return subscriptions.map((subscription) => {
      if (!subscription.trainer) return subscription;

      const trainerId = subscription.trainer.trainerId;
      const matchedTrainer = trainerId ? trainerById.get(trainerId) : undefined;

      return {
        ...subscription,
        trainer: {
          ...subscription.trainer,
          trainerName:
            subscription.trainer.trainerName ||
            matchedTrainer?.name ||
            "Unknown",
          trainerEmail:
            subscription.trainer.trainerEmail || matchedTrainer?.email,
          trainerAvatar:
            subscription.trainer.trainerAvatar ||
            matchedTrainer?.avatar ||
            null,
        },
      };
    });
  }, [subscriptions, trainers]);

  return (
    <div className="min-h-screen bg-[#0F172B]">
      <div className="flex flex-col gap-6 p-6">
        {/* Header Section */}
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-slate-700 rounded-xl">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Subscriptions
                </h1>
              </div>
              <p className="text-slate-400 mt-1.5 text-base">
                {isTrainerView
                  ? "View subscriptions linked to your trainer account"
                  : "Manage member subscriptions and renewals"}
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
                      className="bg-slate-100 text-slate-900 hover:bg-white shadow-sm font-semibold px-6 py-6 text-base"
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

                      {/* GYM FEE SELECTION - Only in create mode */}
                      {!isEditMode && gymFees.length > 0 && (
                        <div className="space-y-3">
                          <Label>Gym Fee</Label>
                          <Select
                            value={selectedGymFeeId}
                            onValueChange={setSelectedGymFeeId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a gym fee" />
                            </SelectTrigger>
                            <SelectContent>
                              {gymFees.map((fee) => (
                                <SelectItem key={fee._id} value={fee._id}>
                                  {fee.name} - {fee.amount.toLocaleString()} MMK
                                  /{fee.duration} {fee.durationUnit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedGymFeeId && (
                            <div className="rounded-lg border border-slate-700 bg-[#0F172B] p-3 text-sm text-slate-300">
                              Selected fee will run for the configured duration
                              and promotion in the backend.
                            </div>
                          )}
                        </div>
                      )}

                      {/* OTHER SERVICES SELECTION - Only in create mode */}
                      {!isEditMode && serviceItems.length > 0 && (
                        <div className="space-y-3">
                          <Label>Additional Services (Optional)</Label>
                          <div className="space-y-2">
                            {serviceItems
                              .filter((service) => service.isActive)
                              .map((service: OtherServiceItem) => {
                                const selected = selectedServices[service._id];
                                const total = selected
                                  ? (() => {
                                      const baseTotal =
                                        service.amount * selected.duration;
                                      if (
                                        !selected.promotionType ||
                                        selected.promotionValue === ""
                                      ) {
                                        return baseTotal;
                                      }
                                      if (selected.promotionType === "percentage") {
                                        return Math.round(
                                          baseTotal -
                                            (baseTotal *
                                              Number(selected.promotionValue)) /
                                              100,
                                        );
                                      }
                                      return Math.max(
                                        0,
                                        baseTotal - Number(selected.promotionValue),
                                      );
                                    })()
                                  : 0;

                                return (
                                  <div
                                    key={service._id}
                                    className="rounded-lg border border-slate-700 p-4 space-y-3"
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        id={`service-${service._id}`}
                                        checked={!!selected}
                                        onChange={() =>
                                          handleServiceToggle(service._id)
                                        }
                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                      />
                                      <label
                                        htmlFor={`service-${service._id}`}
                                        className="text-sm font-medium cursor-pointer"
                                      >
                                        {service.name} - {Number(service.amount ?? 0).toLocaleString()} MMK
                                      </label>
                                    </div>

                                    {selected && (
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                          <Label>Duration</Label>
                                          <Input
                                            type="number"
                                            min="1"
                                            value={selected.duration}
                                            onChange={(e) =>
                                              setSelectedServices((prev) => ({
                                                ...prev,
                                                [service._id]: {
                                                  ...prev[service._id],
                                                  duration: Number(e.target.value),
                                                },
                                              }))
                                            }
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Duration Unit</Label>
                                          <Select
                                            value={selected.durationUnit}
                                            onValueChange={(value: DurationUnit) =>
                                              setSelectedServices((prev) => ({
                                                ...prev,
                                                [service._id]: {
                                                  ...prev[service._id],
                                                  durationUnit: value,
                                                },
                                              }))
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="days">Days</SelectItem>
                                              <SelectItem value="months">Months</SelectItem>
                                              <SelectItem value="years">Years</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Discount Type</Label>
                                          <Select
                                            value={selected.promotionType || "none"}
                                            onValueChange={(value: string) =>
                                              setSelectedServices((prev) => ({
                                                ...prev,
                                                [service._id]: {
                                                  ...prev[service._id],
                                                  promotionType: value as
                                                    | Exclude<
                                                        PromotionType,
                                                        null
                                                      >
                                                    | "none",
                                                  promotionValue: "",
                                                },
                                              }))
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="none">No Discount</SelectItem>
                                              <SelectItem value="percentage">Percentage</SelectItem>
                                              <SelectItem value="mmk">MMK</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Discount Value</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            disabled={selected.promotionType === "none"}
                                            value={selected.promotionValue}
                                            onChange={(e) =>
                                              setSelectedServices((prev) => ({
                                                ...prev,
                                                [service._id]: {
                                                  ...prev[service._id],
                                                  promotionValue: e.target.value === "" ? "" : Number(e.target.value),
                                                },
                                              }))
                                            }
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {selected && (
                                      <div className="text-sm text-emerald-400 font-semibold">
                                        Total: {total.toLocaleString()} MMK
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
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
                              trainerFeeRowId: undefined, // Reset trainer fee item when trainer changes
                              trainerDuration: 1,
                              trainerDurationUnit: "months",
                              trainerPromotionType: "none",
                              trainerPromotionValue: "",
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

                        {/* Selected trainer preview card */}
                        {formData.trainerId &&
                          (() => {
                            const selectedTrainer = trainers.find(
                              (t) => t._id === formData.trainerId,
                            );
                            if (!selectedTrainer) return null;
                            return (
                              <div className="flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-800/60 px-4 py-3">
                                {selectedTrainer.avatar ? (
                                  <img
                                    src={selectedTrainer.avatar}
                                    alt={selectedTrainer.name}
                                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold text-white uppercase select-none">
                                    {selectedTrainer.name.trim().charAt(0)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-white leading-none truncate">
                                    {selectedTrainer.name}
                                  </p>
                                  <p className="text-xs text-slate-400 truncate mt-0.5">
                                    {selectedTrainer.email}
                                  </p>
                                </div>
                              </div>
                            );
                          })()}
                      </div>

                      {/* TRAINER FEE ITEM SELECTION - Show when trainer is selected */}
                      {formData.trainerId &&
                        (() => {
                          const selectedTrainer = trainers.find(
                            (t) => t._id === formData.trainerId,
                          );
                          const trainerFees =
                            selectedTrainer?.trainerFees?.filter(
                              (f) => f.isActive,
                            ) || [];

                          if (trainerFees.length === 0) {
                            return (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-sm text-amber-800">
                                  ⚠️ This trainer has no active fee items
                                  configured. Please configure trainer fees
                                  first.
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="trainerFeeRowId">
                                  Trainer Fee Item *
                                </Label>
                                <Select
                                  value={formData.trainerFeeRowId || ""}
                                  onValueChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      trainerFeeRowId: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a fee item" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {trainerFees.map((fee) => (
                                      <SelectItem key={fee._id} value={fee._id}>
                                        {fee.amount.toLocaleString()} MMK
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="trainerDuration">
                                    Duration *
                                  </Label>
                                  <Input
                                    id="trainerDuration"
                                    type="number"
                                    min={1}
                                    value={formData.trainerDuration}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        trainerDuration:
                                          Number(e.target.value) || 1,
                                      })
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="trainerDurationUnit">
                                    Duration Unit *
                                  </Label>
                                  <Select
                                    value={formData.trainerDurationUnit}
                                    onValueChange={(value: DurationUnit) =>
                                      setFormData({
                                        ...formData,
                                        trainerDurationUnit: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="days">Days</SelectItem>
                                      <SelectItem value="months">
                                        Months
                                      </SelectItem>
                                      <SelectItem value="years">
                                        Years
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="trainerPromotionType">
                                    Discount Type
                                  </Label>
                                  <Select
                                    value={formData.trainerPromotionType}
                                    onValueChange={(value) =>
                                      setFormData({
                                        ...formData,
                                        trainerPromotionType:
                                          value as
                                          Exclude<PromotionType, null> | "none",
                                        trainerPromotionValue: "",
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">
                                        No Discount
                                      </SelectItem>
                                      <SelectItem value="percentage">
                                        Percentage (%)
                                      </SelectItem>
                                      <SelectItem value="mmk">
                                        Fixed Amount (MMK)
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="trainerPromotionValue">
                                    Discount Value
                                  </Label>
                                  <Input
                                    id="trainerPromotionValue"
                                    type="number"
                                    min={0}
                                    disabled={
                                      formData.trainerPromotionType === "none"
                                    }
                                    value={formData.trainerPromotionValue}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        trainerPromotionValue:
                                          e.target.value === ""
                                            ? ""
                                            : Number(e.target.value),
                                      })
                                    }
                                    placeholder={
                                      formData.trainerPromotionType ===
                                      "percentage"
                                        ? "10"
                                        : "5000"
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })()}

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
                              <span className="ml-2 text-xs font-normal text-slate-400">
                                (Total:{" "}
                                {calculatedTotals.grandTotal.toLocaleString()}{" "}
                                MMK)
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
                        <div className="rounded-xl p-5 space-y-3 bg-slate-800/80 border border-slate-600">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-5 w-5 text-slate-300" />
                            <h3 className="text-lg font-bold text-white">
                              Subscription Summary
                            </h3>
                          </div>

                          {/* Gym Price */}
                          {calculatedTotals.gymPriceTotal > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-slate-700">
                              <span className="text-sm font-medium text-slate-300">
                                Gym Membership
                              </span>
                              <span className="text-sm font-bold text-white">
                                {calculatedTotals.gymPriceTotal.toLocaleString()}{" "}
                                MMK
                              </span>
                            </div>
                          )}

                          {/* Other Services */}
                          {calculatedTotals.otherServiceTotal > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-slate-700">
                              <span className="text-sm font-medium text-slate-300">
                                Additional Services
                              </span>
                              <span className="text-sm font-bold text-white">
                                {calculatedTotals.otherServiceTotal.toLocaleString()}{" "}
                                MMK
                              </span>
                            </div>
                          )}

                          {/* Trainer Fee */}
                          {calculatedTotals.trainerFeeTotal > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-slate-700">
                              <span className="text-sm font-medium text-slate-300">
                                Trainer Fee
                              </span>
                              <span className="text-sm font-bold text-white">
                                {calculatedTotals.trainerFeeTotal.toLocaleString()}{" "}
                                MMK
                              </span>
                            </div>
                          )}

                          {/* Grand Total */}
                          <div className="flex justify-between items-center pt-3 border-t border-slate-500">
                            <span className="text-base font-bold text-white">
                              Total Amount
                            </span>
                            <span className="text-xl font-bold text-white">
                              {calculatedTotals.grandTotal.toLocaleString()} MMK
                            </span>
                          </div>

                          {/* Paid Amount */}
                          {formData.paidAmount > 0 && (
                            <div className="flex justify-between items-center py-2 rounded-lg px-3 bg-slate-700/50 border border-slate-600">
                              <span className="text-sm font-medium text-slate-300">
                                Paid Amount
                              </span>
                              <span className="text-sm font-bold text-white">
                                {formData.paidAmount.toLocaleString()} MMK
                              </span>
                            </div>
                          )}

                          {/* Remaining Amount */}
                          {formData.paidAmount > 0 &&
                            calculatedTotals.remainingAmount !== 0 && (
                              <div className="flex justify-between items-center py-2 rounded-lg px-3 bg-red-950/50 border border-red-800">
                                <span className="text-sm font-medium text-red-300">
                                  {calculatedTotals.remainingAmount > 0
                                    ? "Remaining Balance"
                                    : "Overpaid"}
                                </span>
                                <span className="text-sm font-bold text-red-400">
                                  {Math.abs(
                                    calculatedTotals.remainingAmount,
                                  ).toLocaleString()}{" "}
                                  MMK
                                </span>
                              </div>
                            )}

                          {/* Payment Status Indicator */}
                          {formData.paidAmount > 0 && (
                            <div className="text-center pt-2">
                              {calculatedTotals.remainingAmount === 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-900/30 border border-emerald-700 px-3 py-1 rounded-full">
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Fully Paid
                                </span>
                              )}
                              {calculatedTotals.remainingAmount > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-900/30 border border-amber-700 px-3 py-1 rounded-full">
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Partial Payment
                                </span>
                              )}
                              {calculatedTotals.remainingAmount < 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-900/30 border border-red-700 px-3 py-1 rounded-full">
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                      clipRule="evenodd"
                                    />
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
        <div className="bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2.5 bg-slate-700 rounded-xl">
                <Filter className="h-5 w-5 text-slate-300" />
              </div>
              <span className="text-sm font-semibold text-white">
                Filter by Status:
              </span>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1); // Reset to first page when filter changes
                }}
              >
                <SelectTrigger className="w-48 border-slate-600">
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
              <div className="p-2.5 bg-slate-700 rounded-xl">
                <History className="h-5 w-5 text-slate-300" />
              </div>
              <span className="text-sm font-semibold text-white">
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
                <SelectTrigger className="w-64 border-slate-600">
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
        <div className="rounded-2xl bg-slate-800 shadow-sm overflow-hidden border border-slate-700">
          <DataTable
            columns={columns}
            data={subscriptionsWithTrainerInfo}
            isLoading={isLoading}
            getRowId={(row) => row._id}
            emptyMessage="No subscriptions found."
            onRowClick={(subscription) => {
              // router.push(`/subscriptions/${subscription._id}`);
            }}
          />
          {paginationMeta.total > 0 && (
            <div className="border-t border-slate-700 p-4">
              <DataTablePagination
                meta={paginationMeta}
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
