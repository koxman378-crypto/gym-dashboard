"use client";

import { useMemo } from "react";
import { Filter, Plus, Calendar, History, List } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { calculateGymFinalPrice } from "@/src/lib/priceCalculations";
import { DataTable } from "@/src/components/data-table/table-data";
import { DataTablePagination } from "@/src/components/data-table/data-table-pagination";
import { createSubscriptionColumns } from "./columns";
import { SubscriptionDetailsDialog } from "@/src/components/subscriptions/SubscriptionDetailsDialog";
import { useGetExpiryPresetsQuery } from "@/src/store/services/expiryPresetsApi";
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
import { PageLoadingState } from "@/src/components/ui/page-loading-state";
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
import { useSubscriptionsState } from "@/src/store/hooks/useSubscriptionsState";
import { useLanguage } from "@/src/components/language/LanguageContext";
import { useOwnerBranchFilter } from "@/src/components/layout/OwnerBranchFilterContext";
import {
  Subscription,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  OtherServiceItem,
  DurationUnit,
  PromotionType,
} from "@/src/types/extended-types";
import { Role } from "@/src/types/type";

// Remove mock data
export default function SubscriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { isOwner, selectedGymId, setSelectedGymId, branches } =
    useOwnerBranchFilter();
  const branchQuery = isOwner ? (selectedGymId ?? undefined) : undefined;

  const {
    statusFilter,
    paymentFilter,
    gymFeeExpiryDays,
    page,
    limit,
    isCreateDialogOpen,
    isDetailsDialogOpen,
    selectedSubscriptionId,
    isEditMode,
    subscriptionToEditId,
    formData,
    selectedGymFeeId,
    selectedServices,
    setStatusFilter,
    setPaymentFilter,
    setGymFeeExpiryDays,
    setPage,
    setLimit,
    openCreateDialog,
    closeCreateDialog,
    openDetailsDialog,
    closeDetailsDialog,
    openEditDialog: openEditDialogAction,
    setFormData,
    setSelectedGymFeeId,
    toggleService: handleServiceToggle,
    updateServiceEntry,
    resetCreateForm,
  } = useSubscriptionsState();

  const currentUser = useAppSelector((state) => state.auth.user);
  const { isAuthenticated, accessToken } = useAppSelector(
    (state) => state.auth,
  );
  const trainerIdFilter =
    searchParams.get("trainerId") ||
    (currentUser?.role === Role.TRAINER ? currentUser._id : undefined);
  const trainerFilterSelectValue =
    searchParams.get("trainerId") ||
    (currentUser?.role === Role.TRAINER ? (currentUser._id ?? "all") : "all");

  const getServiceUnitPrice = (
    service: OtherServiceItem,
    durationUnit: DurationUnit,
  ) => {
    if (durationUnit === "days") return Number(service.amountDays ?? 0);
    if (durationUnit === "months") return Number(service.amountMonths ?? 0);
    if (durationUnit === "years") return Number(service.amountYears ?? 0);
    return 0;
  };
  const handleTrainerFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete("trainerId");
    } else {
      params.set("trainerId", value);
    }
    const query = params.toString();
    router.push(query ? `/subscriptions?${query}` : "/subscriptions");
  };

  const handleBranchChange = (value: string) => {
    const nextGymId = value === "none" ? null : value;
    setFormData({
      gymId: nextGymId,
      trainerId: null,
      trainerFeeRowId: null,
      trainerDuration: 1,
      trainerDurationUnit: "months",
      trainerPromotionType: "none",
      trainerPromotionValue: "",
    });
    setSelectedGymFeeId("");
  };

  const handleTrainerChange = (value: string) => {
    const nextTrainerId = value === "none" ? null : value;
    if (!nextTrainerId) {
      setFormData({
        trainerId: null,
        trainerFeeRowId: null,
        trainerDuration: 1,
        trainerDurationUnit: "months",
        trainerPromotionType: "none",
        trainerPromotionValue: "",
      });
      return;
    }

    const selectedTrainer = trainers.find((t) => t._id === nextTrainerId);
    const activeFees =
      selectedTrainer?.trainerFees?.filter((fee) => fee.isActive) || [];
    const autoSelectedFeeId =
      activeFees.length === 1 ? activeFees[0]?._id ?? null : null;

    setFormData({
      trainerId: nextTrainerId,
      trainerFeeRowId: autoSelectedFeeId,
      trainerDuration: 1,
      trainerDurationUnit: "months",
      trainerPromotionType: "none",
      trainerPromotionValue: "",
    });
  };

  const resolvePaymentStatus = (grandTotal: number, paidAmount: number) => {
    if (grandTotal <= 0) return "paid";
    if (paidAmount <= 0) return "pending";
    if (paidAmount >= grandTotal) return "paid";
    return "partial";
  };

  // Fetch subscriptions with filters
  const {
    data: subscriptionsData,
    isLoading,
    refetch,
  } = useGetAllSubscriptionsQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    paymentStatus: paymentFilter !== "all" ? paymentFilter : undefined,
    gymFeeExpiringWithinDays:
      gymFeeExpiryDays !== "" && gymFeeExpiryDays > 0
        ? gymFeeExpiryDays
        : undefined,
    page,
    limit,
    trainerId: trainerIdFilter || undefined,
    gymId: branchQuery,
  });
  const subscriptions = subscriptionsData?.data ?? [];
  const selectedSubscription = selectedSubscriptionId
    ? (subscriptions.find((s) => s._id === selectedSubscriptionId) ?? null)
    : null;
  const subscriptionToEdit = subscriptionToEditId
    ? (subscriptions.find((s) => s._id === subscriptionToEditId) ?? null)
    : null;
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
    { limit: 100, gymId: branchQuery },
    {
      skip: !isAuthenticated || !accessToken,
    },
  );
  const customers = customersData_?.data ?? [];

  // When creating, use formData.gymId; otherwise use the header branch filter
  const createGymId = isCreateDialogOpen
    ? formData.gymId || branchQuery
    : branchQuery;

  // Fetch active gym fees
  const { data: gymFees = [] } = useGetAllGymFeeRecordsQuery(
    { active: true, gymId: createGymId },
    {
      skip: !isAuthenticated || !accessToken || !isCreateDialogOpen,
    },
  );

  // Fetch active service items
  const { data: serviceItems = [] } = useGetAllOtherServiceItemsQuery(
    { active: true, gymId: createGymId },
    {
      skip: !isAuthenticated || !accessToken || !isCreateDialogOpen,
    },
  );

  // Fetch trainers for dropdown
  const { data: trainers = [], isLoading: isLoadingTrainers } =
    useGetAllTrainersQuery(
      { gymId: createGymId },
      {
        skip: !isAuthenticated || !accessToken,
      },
    );

  // Fetch expiry presets for gymFee filter dropdown
  const { data: expiryPresets = [] } = useGetExpiryPresetsQuery(
    { active: true },
    { skip: !isAuthenticated || !accessToken },
  );

  const [createSubscription] = useCreateSubscriptionMutation();
  const [updateSubscription] = useUpdateSubscriptionMutation();
  const [deleteSubscription] = useDeleteSubscriptionMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();

  // Calculate totals for selected packages
  const calculatedTotals = useMemo(() => {
    let gymPriceTotal = 0;
    let otherServiceTotal = 0;
    let trainerFeeTotal = 0;

    // Defensive: ensure formData fields are numbers
    const paidAmount = Number(formData?.paidAmount ?? 0);
    const trainerDuration = Number(formData?.trainerDuration ?? 0);
    const trainerPromotionValue = Number(formData?.trainerPromotionValue ?? 0);

    // Calculate gym fee total
    if (selectedGymFeeId) {
      const selectedFee = gymFees?.find?.(
        (fee) => fee._id === selectedGymFeeId,
      );
      if (selectedFee) {
        try {
          gymPriceTotal = calculateGymFinalPrice(selectedFee);
        } catch (e) {
          gymPriceTotal = 0;
        }
      }
    }

    // Calculate other services total
    if (selectedServices && typeof selectedServices === "object") {
      Object.entries(selectedServices).forEach(([serviceId, values]) => {
        const service = serviceItems?.find?.((item) => item._id === serviceId);
        if (!service) return;
        const basePrice = getServiceUnitPrice(service, values.durationUnit);
        const duration = Number(values.duration ?? 0);
        const baseTotal = basePrice * duration;
        let finalPrice = baseTotal;
        if (values.promotionType && values.promotionValue !== "") {
          const promoValue = Number(values.promotionValue ?? 0);
          if (values.promotionType === "percentage") {
            finalPrice = Math.round(baseTotal - (baseTotal * promoValue) / 100);
          } else if (values.promotionType === "mmk") {
            finalPrice = Math.max(0, baseTotal - promoValue);
          }
        }
        otherServiceTotal += finalPrice;
      });
    }

    // Calculate trainer fee
    if (formData?.trainerId && formData?.trainerFeeRowId) {
      const selectedTrainer = trainers?.find?.(
        (t) => t._id === formData.trainerId,
      );
      if (selectedTrainer && Array.isArray(selectedTrainer.trainerFees)) {
        const selectedFee = selectedTrainer.trainerFees.find(
          (f) => f._id === formData.trainerFeeRowId,
        );
        if (selectedFee) {
          const baseTotal = Number(selectedFee.amount ?? 0) * trainerDuration;
          let finalPrice = baseTotal;
          if (
            formData.trainerPromotionType &&
            formData.trainerPromotionValue !== ""
          ) {
            if (formData.trainerPromotionType === "percentage") {
              finalPrice = Math.round(
                baseTotal - (baseTotal * trainerPromotionValue) / 100,
              );
            } else if (formData.trainerPromotionType === "mmk") {
              finalPrice = Math.max(0, baseTotal - trainerPromotionValue);
            }
          }
          trainerFeeTotal = finalPrice;
        }
      }
    }

    const grandTotal = gymPriceTotal + otherServiceTotal + trainerFeeTotal;
    const remainingAmount = grandTotal - paidAmount;

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
    formData?.trainerId,
    formData?.trainerFeeRowId,
    formData?.trainerDuration,
    formData?.trainerDurationUnit,
    formData?.trainerPromotionType,
    formData?.trainerPromotionValue,
    formData?.paidAmount,
    gymFees,
    serviceItems,
    trainers,
  ]);

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer) {
      alert("Please select a customer.");
      return;
    }

    if (isOwner && branches.length > 0 && !formData.gymId && !branchQuery) {
      alert("Please select a branch for this subscription.");
      return;
    }

    try {
      const normalizedPaymentStatus = resolvePaymentStatus(
        calculatedTotals.grandTotal,
        Number(formData.paidAmount || 0),
      );

      if (isEditMode && subscriptionToEdit) {
        // Update existing subscription
        const updateDto: UpdateSubscriptionDto = {
          startDate: formData.startDate,
          status: formData.status,
          paymentStatus: normalizedPaymentStatus,
          paidAmount: formData.paidAmount,
          notes: formData.notes || undefined,
          gymFee:
            selectedGymFeeId && selectedGymFeeId !== "none"
              ? { feeId: selectedGymFeeId }
              : null,
          services: Object.entries(selectedServices).map(
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
          ),
          trainer:
            formData.trainerId && formData.trainerFeeRowId
              ? {
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
                }
              : null,
        };

        await updateSubscription({
          id: subscriptionToEdit._id,
          data: updateDto,
        }).unwrap();

        // Manually refetch subscriptions to ensure the list updates
        await refetch();

        closeCreateDialog();
      } else {
        // Create new subscription
        const dto: CreateSubscriptionDto = {
          customer: formData.customer,
          startDate: formData.startDate,
          paymentStatus: normalizedPaymentStatus as any,
          paidAmount: formData.paidAmount,
          notes: formData.notes ?? undefined,
        };

        // Add gym fee selection if any
        if (selectedGymFeeId && selectedGymFeeId !== "none") {
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

        closeCreateDialog();
        resetCreateForm();
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        `Failed to ${isEditMode ? "update" : "create"} subscription. Please try again.`;
      alert(`Error: ${errorMessage}`);
    }
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
    openDetailsDialog(subscription._id);
  };

  const handleUpdate = (subscription: Subscription) => {
    openEditDialogAction(subscription);
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
        showDaysLeft: gymFeeExpiryDays !== "",
      }),
    [canCreateSubscription, currentUser, gymFeeExpiryDays],
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

  if (isLoading && subscriptions.length === 0) {
    return <PageLoadingState headerActionCount={1} itemCount={5} />;
  }

  const lightSurfaceClassName =
    "border border-zinc-200 bg-white text-card-foreground shadow-sm";
  const lightButtonClassName =
    "border border-zinc-200 bg-white text-foreground hover:bg-zinc-50 hover:text-foreground shadow-sm";
  const lightDialogContentClassName =
    "max-h-[90vh] max-w-2xl overflow-y-auto border border-zinc-200 bg-white text-card-foreground shadow-xl";
  const lightDialogFooterClassName = "border-zinc-200 bg-white";
  const lightSelectTriggerClassName =
    "border-zinc-200 bg-white text-foreground hover:border-zinc-300 focus:border-zinc-300 focus:ring-black/5";
  const lightSelectContentClassName =
    "border border-gray-200 focus-visible:outline-none focus-visible:ring-0 bg-white text-popover-foreground shadow-sm";
  const lightSelectItemClassName =
    "text-foreground focus-visible:outline-none focus-visible:ring-0";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col gap-6 p-6">
        {/* Header Section */}
        <div className={`rounded-2xl p-8 ${lightSurfaceClassName}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-xl border border-border bg-card p-2.5">
                  <Calendar className="h-8 w-8 text-foreground" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {t("subscriptions.title")}
                </h1>
              </div>
              <p className="mt-1.5 text-base text-muted-foreground">
                {isTrainerView
                  ? t("subscriptions.subtitleTrainer")
                  : t("subscriptions.subtitleOwner")}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-4 lg:ml-auto">
              {isOwner && branches.length > 0 && (
                <Select
                  value={selectedGymId ?? "all"}
                  onValueChange={(v) => {
                    setSelectedGymId(v === "all" ? null : v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger
                    className={`w-44 ${lightSelectTriggerClassName}`}
                  >
                    <SelectValue placeholder="All Gyms" />
                  </SelectTrigger>
                  <SelectContent className={lightSelectContentClassName}>
                    <SelectItem
                      value="all"
                      className={lightSelectItemClassName}
                    >
                      All Gyms
                    </SelectItem>
                    {branches.map((b) => (
                      <SelectItem
                        key={b._id}
                        value={b._id!}
                        className={lightSelectItemClassName}
                      >
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  Payment:
                </span>
                <Select
                  value={paymentFilter}
                  onValueChange={(value) => setPaymentFilter(value)}
                >
                  <SelectTrigger
                    className={`w-40 ${lightSelectTriggerClassName}`}
                  >
                    <SelectValue placeholder="All payments" />
                  </SelectTrigger>
                  <SelectContent className={lightSelectContentClassName}>
                    <SelectItem
                      value="all"
                      className={lightSelectItemClassName}
                    >
                      All Payments
                    </SelectItem>
                    <SelectItem
                      value="paid"
                      className={lightSelectItemClassName}
                    >
                      Paid
                    </SelectItem>
                    <SelectItem
                      value="pending"
                      className={lightSelectItemClassName}
                    >
                      Pending
                    </SelectItem>
                    <SelectItem
                      value="partial"
                      className={lightSelectItemClassName}
                    >
                      Partial
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  GymFee Expiring:
                </span>
                <Select
                  value={
                    gymFeeExpiryDays !== "" ? String(gymFeeExpiryDays) : "none"
                  }
                  onValueChange={(value) => {
                    if (value === "none") {
                      setGymFeeExpiryDays("");
                    } else if (value === "custom") {
                      setGymFeeExpiryDays("");
                    } else {
                      setGymFeeExpiryDays(Number(value));
                    }
                  }}
                >
                  <SelectTrigger
                    className={`w-44 ${lightSelectTriggerClassName}`}
                  >
                    <SelectValue placeholder="Any expiry" />
                  </SelectTrigger>
                  <SelectContent className={lightSelectContentClassName}>
                    <SelectItem
                      value="none"
                      className={lightSelectItemClassName}
                    >
                      Any Expiry
                    </SelectItem>
                    {expiryPresets.map((preset) => (
                      <SelectItem
                        key={preset._id}
                        value={String(preset.days)}
                        className={lightSelectItemClassName}
                      >
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  placeholder="Custom days"
                  value={gymFeeExpiryDays}
                  onChange={(e) => {
                    const v = e.target.value;
                    setGymFeeExpiryDays(v === "" ? "" : Number(v));
                  }}
                  className="w-28 border-border bg-background text-foreground placeholder:text-muted-foreground hover:border-ring focus-visible:border-ring focus-visible:ring-ring/20"
                />
              </div>

              {canCreateSubscription && (
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={(open) => {
                    if (open) openCreateDialog();
                    else closeCreateDialog();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      className={`px-6 py-6 cursor-pointer text-base font-semibold ${lightButtonClassName}`}
                      onClick={() => {
                        openCreateDialog();
                      }}
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Create Subscription
                    </Button>
                  </DialogTrigger>
                  <DialogContent className={lightDialogContentClassName}>
                    <DialogHeader>
                      <DialogTitle>
                        {isEditMode
                          ? "Edit Subscription"
                          : "Create New Subscription"}
                      </DialogTitle>
                      <DialogDescription>
                        {isEditMode
                          ? "Update subscription package, payment status, amount, notes, and status"
                          : "Create a new subscription for a customer"}
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={handleCreateSubscription}
                      className="space-y-4 [&_label]:text-foreground **:data-[slot=input]:border-border **:data-[slot=input]:bg-background **:data-[slot=input]:text-foreground **:data-[slot=input]:placeholder:text-muted-foreground **:data-[slot=input]:hover:border-ring **:data-[slot=input]:focus-visible:border-ring **:data-[slot=input]:focus-visible:ring-ring/20 **:data-[slot=textarea]:border-border **:data-[slot=textarea]:bg-background **:data-[slot=textarea]:text-foreground **:data-[slot=textarea]:placeholder:text-muted-foreground **:data-[slot=textarea]:hover:border-ring **:data-[slot=textarea]:focus-visible:border-ring **:data-[slot=textarea]:focus-visible:ring-ring/20"
                    >
                      <div className="space-y-2">
                        {isOwner && branches.length > 0 && (
                          <div className="space-y-2">
                            <Label htmlFor="gymId">
                              Branch <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={formData.gymId ?? branchQuery ?? "none"}
                              onValueChange={handleBranchChange}
                              required
                              disabled={isEditMode}
                            >
                              <SelectTrigger
                                className={lightSelectTriggerClassName}
                              >
                                <SelectValue placeholder="Select a branch" />
                              </SelectTrigger>
                              <SelectContent
                                className={lightSelectContentClassName}
                              >
                                <SelectItem
                                  value="none"
                                  className={lightSelectItemClassName}
                                >
                                  No Branch
                                </SelectItem>
                                {branches.map((b) => (
                                  <SelectItem
                                    key={b._id}
                                    value={b._id!}
                                    className={lightSelectItemClassName}
                                  >
                                    {b.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <Label htmlFor="customer">Customer *</Label>
                        <Select
                          value={formData.customer}
                          onValueChange={(value) => {
                            setFormData({ customer: value });
                            if (!value) {
                              setFormData({
                                customer: "",
                                gymId: formData.gymId,
                                trainerId: null,
                                trainerFeeRowId: null,
                              });
                              setSelectedGymFeeId("");
                            }
                          }}
                          required
                          disabled={isEditMode}
                        >
                          <SelectTrigger
                            className={lightSelectTriggerClassName}
                          >
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                          <SelectContent
                            className={lightSelectContentClassName}
                          >
                            {isLoadingCustomers ? (
                              <SelectItem
                                value="loading"
                                disabled
                                className={lightSelectItemClassName}
                              >
                                Loading customers...
                              </SelectItem>
                            ) : customers.length === 0 ? (
                              <SelectItem
                                value="empty"
                                disabled
                                className={lightSelectItemClassName}
                              >
                                No customers found
                              </SelectItem>
                            ) : (
                              customers.map((customer) => (
                                <SelectItem
                                  key={customer._id}
                                  value={customer._id}
                                  className={lightSelectItemClassName}
                                >
                                  {customer.name} ({customer.email})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* GYM ID SELECTION */}

                      {/* GYM FEE SELECTION */}
                      {gymFees.length > 0 && (
                        <div className="space-y-3">
                          <Label>
                            Gym Fee {isEditMode ? "(Editable)" : ""}
                          </Label>
                          <Select
                            value={selectedGymFeeId}
                            onValueChange={setSelectedGymFeeId}
                          >
                            <SelectTrigger
                              className={lightSelectTriggerClassName}
                            >
                              <SelectValue placeholder="Select a gym fee" />
                            </SelectTrigger>
                            <SelectContent
                              className={lightSelectContentClassName}
                            >
                              <SelectItem
                                value="none"
                                className={lightSelectItemClassName}
                              >
                                No Gym Fee
                              </SelectItem>
                              {gymFees.map((fee) => (
                                <SelectItem
                                  key={fee._id}
                                  value={fee._id}
                                  className={`cursor-pointer ${lightSelectItemClassName}`}
                                >
                                  <span>{fee.name} - </span>
                                  <span className="font-semibold text-zinc-800">
                                    {fee.amount.toLocaleString()} MMK
                                  </span>
                                  <span>
                                    {" "}
                                    /{fee.duration} {fee.durationUnit}
                                  </span>
                                  {fee.promotionType === "percentage" ? (
                                    <span className="ml-1 text-zinc-700">
                                      ({fee.promotionValue}% off)
                                    </span>
                                  ) : fee.promotionType === "mmk" ? (
                                    <span className="ml-1 text-zinc-700">
                                      (
                                      {Number(
                                        fee.promotionValue ?? 0,
                                      ).toLocaleString()}{" "}
                                      MMK off)
                                    </span>
                                  ) : null}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedGymFeeId && selectedGymFeeId !== "none" && (
                            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-muted-foreground">
                              Selected fee will run for the configured duration
                              and promotion in the backend.
                            </div>
                          )}
                        </div>
                      )}

                      {/* OTHER SERVICES SELECTION */}
                      {serviceItems.length > 0 && (
                        <div className="space-y-3">
                          <Label>
                            Additional Services{" "}
                            {isEditMode ? "(Editable)" : "(Optional)"}
                          </Label>
                          <div className="space-y-2">
                            {serviceItems
                              .filter((service) => service.isActive)
                              .map((service: OtherServiceItem) => {
                                const selected = selectedServices[service._id];
                                const total = selected
                                  ? (() => {
                                      const basePrice = getServiceUnitPrice(
                                        service,
                                        selected.durationUnit,
                                      );
                                      const baseTotal =
                                        basePrice * selected.duration;
                                      if (
                                        !selected.promotionType ||
                                        selected.promotionValue === ""
                                      ) {
                                        return baseTotal;
                                      }
                                      if (
                                        selected.promotionType === "percentage"
                                      ) {
                                        return Math.round(
                                          baseTotal -
                                            (baseTotal *
                                              Number(selected.promotionValue)) /
                                              100,
                                        );
                                      }
                                      return Math.max(
                                        0,
                                        baseTotal -
                                          Number(selected.promotionValue),
                                      );
                                    })()
                                  : 0;

                                return (
                                  <div
                                    key={service._id}
                                    className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4"
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        id={`service-${service._id}`}
                                        checked={!!selected}
                                        onChange={() =>
                                          handleServiceToggle(service._id)
                                        }
                                        className="h-4 w-4 rounded border-zinc-300 text-zinc-700 focus:ring-zinc-400"
                                      />
                                      <label
                                        htmlFor={`service-${service._id}`}
                                        className="text-sm font-medium cursor-pointer"
                                      >
                                        {service.name}
                                      </label>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                      <div>
                                        Day:{" "}
                                        {service.amountDays.toLocaleString()}{" "}
                                        MMK
                                      </div>
                                      <div>
                                        Month:{" "}
                                        {service.amountMonths.toLocaleString()}{" "}
                                        MMK
                                      </div>
                                      <div>
                                        Year:{" "}
                                        {service.amountYears.toLocaleString()}{" "}
                                        MMK
                                      </div>
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
                                              updateServiceEntry(service._id, {
                                                duration: Number(
                                                  e.target.value,
                                                ),
                                              })
                                            }
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Duration Unit</Label>
                                          <Select
                                            value={selected.durationUnit}
                                            onValueChange={(
                                              value: DurationUnit,
                                            ) =>
                                              updateServiceEntry(service._id, {
                                                durationUnit: value,
                                              })
                                            }
                                          >
                                            <SelectTrigger
                                              className={
                                                lightSelectTriggerClassName
                                              }
                                            >
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent
                                              className={
                                                lightSelectContentClassName
                                              }
                                            >
                                              <SelectItem
                                                value="days"
                                                className={
                                                  lightSelectItemClassName
                                                }
                                              >
                                                Days
                                              </SelectItem>
                                              <SelectItem
                                                value="months"
                                                className={
                                                  lightSelectItemClassName
                                                }
                                              >
                                                Months
                                              </SelectItem>
                                              <SelectItem
                                                value="years"
                                                className={
                                                  lightSelectItemClassName
                                                }
                                              >
                                                Years
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Discount Type</Label>
                                          <Select
                                            value={
                                              selected.promotionType || "none"
                                            }
                                            onValueChange={(value: string) =>
                                              updateServiceEntry(service._id, {
                                                promotionType: value as
                                                  | Exclude<PromotionType, null>
                                                  | "none",
                                                promotionValue: "",
                                              })
                                            }
                                          >
                                            <SelectTrigger
                                              className={
                                                lightSelectTriggerClassName
                                              }
                                            >
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent
                                              className={
                                                lightSelectContentClassName
                                              }
                                            >
                                              <SelectItem
                                                value="none"
                                                className={
                                                  lightSelectItemClassName
                                                }
                                              >
                                                No Discount
                                              </SelectItem>
                                              <SelectItem
                                                value="percentage"
                                                className={
                                                  lightSelectItemClassName
                                                }
                                              >
                                                Percentage
                                              </SelectItem>
                                              <SelectItem
                                                value="mmk"
                                                className={
                                                  lightSelectItemClassName
                                                }
                                              >
                                                MMK
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Discount Value</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            disabled={
                                              selected.promotionType === "none"
                                            }
                                            value={selected.promotionValue}
                                            onChange={(e) =>
                                              updateServiceEntry(service._id, {
                                                promotionValue:
                                                  e.target.value === ""
                                                    ? ""
                                                    : Number(e.target.value),
                                              })
                                            }
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {selected && (
                                      <div className="text-sm font-semibold text-zinc-800">
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
                          onValueChange={handleTrainerChange}
                        >
                          <SelectTrigger
                            className={lightSelectTriggerClassName}
                          >
                            <SelectValue placeholder="Select a trainer (optional)" />
                          </SelectTrigger>
                          <SelectContent
                            className={lightSelectContentClassName}
                          >
                            <SelectItem
                              value="none"
                              className={lightSelectItemClassName}
                            >
                              No Trainer
                            </SelectItem>
                            {trainers.map((trainer) => (
                              <SelectItem
                                key={trainer._id}
                                value={trainer._id}
                                className={lightSelectItemClassName}
                              >
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
                              <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                                {selectedTrainer.avatar ? (
                                  <img
                                    src={selectedTrainer.avatar}
                                    alt={selectedTrainer.name}
                                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-semibold uppercase text-foreground select-none">
                                    {selectedTrainer.name.trim().charAt(0)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="truncate font-semibold leading-none text-foreground">
                                    {selectedTrainer.name}
                                  </p>
                                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
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
                          const autoSelectedFee =
                            trainerFees.length === 1 ? trainerFees[0] : null;

                          if (trainerFees.length === 0) {
                            return (
                              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                                <p className="text-sm text-zinc-700">
                                  ⚠️ This trainer has no active fee items
                                  configured. Please configure trainer fees
                                  first.
                                </p>
                              </div>
                            );
                          }

                          if (trainerFees.length === 1 && autoSelectedFee) {
                            return (
                              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-emerald-900">
                                      Fee auto-selected
                                    </p>
                                    <p className="text-xs text-emerald-700">
                                      This trainer has one active fee item, so
                                      the system selected it for you.
                                    </p>
                                  </div>
                                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm">
                                    {autoSelectedFee.amount.toLocaleString()}{" "}
                                    MMK
                                  </span>
                                </div>
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
                                      trainerFeeRowId: value,
                                    })
                                  }
                                >
                                  <SelectTrigger
                                    className={lightSelectTriggerClassName}
                                  >
                                    <SelectValue placeholder="Select a fee item" />
                                  </SelectTrigger>
                                  <SelectContent
                                    className={lightSelectContentClassName}
                                  >
                                    {trainerFees.map((fee) => (
                                      <SelectItem
                                        key={fee._id}
                                        value={fee._id}
                                        className={lightSelectItemClassName}
                                      >
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
                                        trainerDurationUnit: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger
                                      className={lightSelectTriggerClassName}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent
                                      className={lightSelectContentClassName}
                                    >
                                      <SelectItem
                                        value="days"
                                        className={lightSelectItemClassName}
                                      >
                                        Days
                                      </SelectItem>
                                      <SelectItem
                                        value="months"
                                        className={lightSelectItemClassName}
                                      >
                                        Months
                                      </SelectItem>
                                      <SelectItem
                                        value="years"
                                        className={lightSelectItemClassName}
                                      >
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
                                        trainerPromotionType: value as
                                          | Exclude<PromotionType, null>
                                          | "none",
                                        trainerPromotionValue: "",
                                      })
                                    }
                                  >
                                    <SelectTrigger
                                      className={lightSelectTriggerClassName}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent
                                      className={lightSelectContentClassName}
                                    >
                                      <SelectItem
                                        value="none"
                                        className={lightSelectItemClassName}
                                      >
                                        No Discount
                                      </SelectItem>
                                      <SelectItem
                                        value="percentage"
                                        className={lightSelectItemClassName}
                                      >
                                        Percentage (%)
                                      </SelectItem>
                                      <SelectItem
                                        value="mmk"
                                        className={lightSelectItemClassName}
                                      >
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
                                startDate: e.target.value,
                              })
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="paymentStatus">
                            Payment Status *
                          </Label>
                          <Select
                            value={formData.paymentStatus}
                            onValueChange={(value: any) =>
                              setFormData({ paymentStatus: value })
                            }
                          >
                            <SelectTrigger
                              className={lightSelectTriggerClassName}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className={lightSelectContentClassName}
                            >
                              <SelectItem
                                value="paid"
                                className={lightSelectItemClassName}
                              >
                                Paid
                              </SelectItem>
                              <SelectItem
                                value="pending"
                                className={lightSelectItemClassName}
                              >
                                Pending
                              </SelectItem>
                              <SelectItem
                                value="partial"
                                className={lightSelectItemClassName}
                              >
                                Partial
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {isEditMode && (
                        <div className="space-y-2">
                          <Label htmlFor="subscriptionStatus">
                            Subscription Status *
                          </Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: any) =>
                              setFormData({ status: value })
                            }
                          >
                            <SelectTrigger
                              className={lightSelectTriggerClassName}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className={lightSelectContentClassName}
                            >
                              <SelectItem
                                value="active"
                                className={lightSelectItemClassName}
                              >
                                Active
                              </SelectItem>
                              <SelectItem
                                value="expired"
                                className={lightSelectItemClassName}
                              >
                                Expired
                              </SelectItem>
                              <SelectItem
                                value="cancelled"
                                className={lightSelectItemClassName}
                              >
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {(formData.paymentStatus === "paid" ||
                        formData.paymentStatus === "partial") && (
                        <div className="space-y-2">
                          <Label htmlFor="paidAmount">
                            Paid Amount *
                            {!isEditMode && calculatedTotals.grandTotal > 0 && (
                              <span className="ml-2 text-xs font-normal text-muted-foreground">
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
                                  paidAmount: Number(e.target.value),
                                })
                              }
                              placeholder="0000"
                              required
                              className="flex-1"
                            />
                            {!isEditMode && calculatedTotals.grandTotal > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  setFormData({
                                    paidAmount: calculatedTotals.grandTotal,
                                  })
                                }
                                className={`whitespace-nowrap ${lightButtonClassName}`}
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
                            setFormData({ notes: e.target.value })
                          }
                          placeholder="Additional notes..."
                          rows={3}
                        />
                      </div>

                      {/* TOTAL SUMMARY */}
                      {calculatedTotals.grandTotal > 0 && (
                        <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-bold text-foreground">
                              {isEditMode
                                ? "Updated Subscription Summary"
                                : "Subscription Summary"}
                            </h3>
                          </div>

                          {/* Gym Price */}
                          {calculatedTotals.gymPriceTotal > 0 && (
                            <div className="flex items-center justify-between border-b border-border py-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Gym Membership
                              </span>
                              <span className="text-sm font-bold text-foreground">
                                {calculatedTotals.gymPriceTotal.toLocaleString()}{" "}
                                MMK
                              </span>
                            </div>
                          )}

                          {/* Other Services */}
                          {calculatedTotals.otherServiceTotal > 0 && (
                            <div className="flex items-center justify-between border-b border-border py-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Additional Services
                              </span>
                              <span className="text-sm font-bold text-foreground">
                                {calculatedTotals.otherServiceTotal.toLocaleString()}{" "}
                                MMK
                              </span>
                            </div>
                          )}

                          {/* Trainer Fee */}
                          {calculatedTotals.trainerFeeTotal > 0 && (
                            <div className="flex items-center justify-between border-b border-border py-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Trainer Fee
                              </span>
                              <span className="text-sm font-bold text-foreground">
                                {calculatedTotals.trainerFeeTotal.toLocaleString()}{" "}
                                MMK
                              </span>
                            </div>
                          )}

                          {/* Grand Total */}
                          <div className="flex items-center justify-between border-t border-border pt-3">
                            <span className="text-base font-bold text-foreground">
                              Total Amount
                            </span>
                            <span className="text-xl font-bold text-foreground">
                              {calculatedTotals.grandTotal.toLocaleString()} MMK
                            </span>
                          </div>

                          {/* Paid Amount */}
                          {formData.paidAmount > 0 && (
                            <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Paid Amount
                              </span>
                              <span className="text-sm font-bold text-foreground">
                                {formData.paidAmount.toLocaleString()} MMK
                              </span>
                            </div>
                          )}

                          {/* Remaining Amount */}
                          {formData.paidAmount > 0 &&
                            calculatedTotals.remainingAmount !== 0 && (
                              <div className="flex items-center justify-between rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2">
                                <span className="text-sm font-medium text-zinc-700">
                                  {calculatedTotals.remainingAmount > 0
                                    ? "Remaining Balance"
                                    : "Overpaid"}
                                </span>
                                <span className="text-sm font-bold text-zinc-800">
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
                                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800">
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
                                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800">
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
                                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800">
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

                      <DialogFooter className={lightDialogFooterClassName}>
                        <DialogClose asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={lightButtonClassName}
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          className={`min-w-44 cursor-pointer font-semibold ${lightButtonClassName}`}
                        >
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
        <div className={`rounded-2xl p-6 ${lightSurfaceClassName}`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5">
                <Filter className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Filter by Status:
              </span>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                }}
              >
                <SelectTrigger
                  className={`w-48 ${lightSelectTriggerClassName}`}
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className={lightSelectContentClassName}>
                  <SelectItem value="all" className={lightSelectItemClassName}>
                    All Statuses
                  </SelectItem>
                  <SelectItem
                    value="active"
                    className={lightSelectItemClassName}
                  >
                    Active
                  </SelectItem>
                  <SelectItem
                    value="expired"
                    className={lightSelectItemClassName}
                  >
                    Expired
                  </SelectItem>
                  <SelectItem
                    value="cancelled"
                    className={lightSelectItemClassName}
                  >
                    Cancelled
                  </SelectItem>
                  <SelectItem
                    value="pending"
                    className={lightSelectItemClassName}
                  >
                    Pending
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5">
                <List className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Trainer:
              </span>
              {currentUser?.role === Role.TRAINER ? (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700">
                  Your trainer account only
                </div>
              ) : (
                <Select
                  value={trainerFilterSelectValue}
                  onValueChange={handleTrainerFilterChange}
                >
                  <SelectTrigger
                    className={`w-64 ${lightSelectTriggerClassName}`}
                  >
                    <SelectValue placeholder="All trainers" />
                  </SelectTrigger>
                  <SelectContent className={lightSelectContentClassName}>
                    <SelectItem
                      value="all"
                      className={lightSelectItemClassName}
                    >
                      All Trainers
                    </SelectItem>
                    {isLoadingTrainers ? (
                      <SelectItem
                        value="loading"
                        disabled
                        className={lightSelectItemClassName}
                      >
                        Loading trainers...
                      </SelectItem>
                    ) : trainers.length === 0 ? (
                      <SelectItem
                        value="empty"
                        disabled
                        className={lightSelectItemClassName}
                      >
                        No trainers found
                      </SelectItem>
                    ) : (
                      trainers.map((trainer) => (
                        <SelectItem
                          key={trainer._id}
                          value={trainer._id}
                          className={lightSelectItemClassName}
                        >
                          {trainer.name} ({trainer.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Customer History Selector */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5">
                <History className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">
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
                <SelectTrigger
                  className={`w-64 ${lightSelectTriggerClassName}`}
                >
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent className={lightSelectContentClassName}>
                  {isLoadingCustomers ? (
                    <SelectItem
                      value="loading"
                      disabled
                      className={lightSelectItemClassName}
                    >
                      Loading customers...
                    </SelectItem>
                  ) : customers.length === 0 ? (
                    <SelectItem
                      value="empty"
                      disabled
                      className={lightSelectItemClassName}
                    >
                      No customers found
                    </SelectItem>
                  ) : (
                    customers.map((customer) => (
                      <SelectItem
                        key={customer._id}
                        value={customer._id}
                        className={lightSelectItemClassName}
                      >
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
        <div className={`overflow-hidden rounded-2xl ${lightSurfaceClassName}`}>
          <DataTable
            columns={columns}
            data={subscriptionsWithTrainerInfo}
            isLoading={isLoading}
            getRowId={(row) => row._id}
            emptyMessage="No subscriptions found."
            tableWrapperClassName="border-zinc-200"
            tableContainerClassName="border-zinc-200 bg-white shadow-none"
            tableHeaderClassName="bg-white [&_tr]:border-zinc-200"
            paginationTone="light"
            onRowClick={(subscription) => {
              // router.push(`/subscriptions/${subscription._id}`);
            }}
          />
          {paginationMeta.total > 0 && (
            <div className="border-t border-zinc-200 bg-white p-4">
              <DataTablePagination
                meta={paginationMeta}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newLimit) => setLimit(newLimit)}
                isLoading={isLoading}
                tone="light"
              />
            </div>
          )}
        </div>

        <SubscriptionDetailsDialog
          subscription={selectedSubscription}
          isOpen={isDetailsDialogOpen}
          onClose={() => closeDetailsDialog()}
        />
      </div>
    </div>
  );
}
