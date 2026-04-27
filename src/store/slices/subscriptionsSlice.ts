import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  DurationUnit,
  PromotionType,
  Subscription,
} from "@/src/types/extended-types";

export interface ServiceSelectionEntry {
  duration: number;
  durationUnit: DurationUnit;
  promotionType: Exclude<PromotionType, null> | "none";
  promotionValue: number | "";
}

export interface SubscriptionFormData {
  customer: string;
  gymId: string | null;
  startDate: string;
  status: "active" | "expired" | "cancelled";
  paymentStatus: "paid" | "pending" | "partial";
  paidAmount: number;
  trainerId: string | null;
  trainerFeeRowId: string | null;
  trainerDuration: number;
  trainerDurationUnit: DurationUnit;
  trainerPromotionType: Exclude<PromotionType, null> | "none";
  trainerPromotionValue: number | "";
  notes: string | null;
}

export interface SubscriptionsUiState {
  statusFilter: string;
  paymentFilter: string;
  gymFeeExpiryDays: number | "";
  page: number;
  limit: number;
  isCreateDialogOpen: boolean;
  isDetailsDialogOpen: boolean;
  selectedSubscriptionId: string | null;
  isEditMode: boolean;
  subscriptionToEditId: string | null;
  formData: SubscriptionFormData;
  selectedGymFeeId: string;
  selectedServices: Record<string, ServiceSelectionEntry>;
}

const defaultFormData: SubscriptionFormData = {
  customer: "",
  gymId: null,
  startDate: new Date().toISOString().split("T")[0],
  status: "active",
  paymentStatus: "pending",
  paidAmount: 0,
  trainerId: null,
  trainerFeeRowId: null,
  trainerDuration: 1,
  trainerDurationUnit: "months",
  trainerPromotionType: "none",
  trainerPromotionValue: "",
  notes: null,
};

const initialState: SubscriptionsUiState = {
  statusFilter: "all",
  paymentFilter: "all",
  gymFeeExpiryDays: "",
  page: 1,
  limit: 20,
  isCreateDialogOpen: false,
  isDetailsDialogOpen: false,
  selectedSubscriptionId: null,
  isEditMode: false,
  subscriptionToEditId: null,
  formData: defaultFormData,
  selectedGymFeeId: "",
  selectedServices: {},
};

const resolveTrainerId = (trainer: Subscription["trainer"]) => {
  if (!trainer || typeof trainer !== "object") return null;
  const candidate = (trainer as any).trainerId ?? (trainer as any)._id;
  return candidate ? String(candidate) : null;
};

const resolveTrainerFeeId = (trainer: Subscription["trainer"]) => {
  if (!trainer || typeof trainer !== "object") return null;
  const candidate =
    (trainer as any).feeId ??
    (trainer as any).feeRowId ??
    (trainer as any).trainerFeeId ??
    (trainer as any)._id;
  return candidate ? String(candidate) : null;
};

const subscriptionsSlice = createSlice({
  name: "subscriptionsUi",
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<string>) {
      state.statusFilter = action.payload;
      state.page = 1;
    },
    setPaymentFilter(state, action: PayloadAction<string>) {
      state.paymentFilter = action.payload;
      state.page = 1;
    },
    setGymFeeExpiryDays(state, action: PayloadAction<number | "">) {
      state.gymFeeExpiryDays = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.page = 1;
    },
    openCreateDialog(state) {
      state.isCreateDialogOpen = true;
      state.isEditMode = false;
      state.subscriptionToEditId = null;
    },
    closeCreateDialog(state) {
      state.isCreateDialogOpen = false;
      state.isEditMode = false;
      state.subscriptionToEditId = null;
      state.formData = {
        ...defaultFormData,
        startDate: new Date().toISOString().split("T")[0],
      };
      state.selectedGymFeeId = "";
      state.selectedServices = {};
    },
    openDetailsDialog(state, action: PayloadAction<string>) {
      state.selectedSubscriptionId = action.payload;
      state.isDetailsDialogOpen = true;
    },
    closeDetailsDialog(state) {
      state.isDetailsDialogOpen = false;
      state.selectedSubscriptionId = null;
    },
    openEditDialog(state, action: PayloadAction<Subscription>) {
      const sub = action.payload;
      state.isEditMode = true;
      state.subscriptionToEditId = sub._id;
      state.isCreateDialogOpen = true;
      const selectedServices = Array.isArray(sub.services)
        ? sub.services.reduce(
            (acc, service: any) => {
              if (!service?.serviceId) return acc;
              acc[String(service.serviceId)] = {
                duration: Number(service.duration ?? 1),
                durationUnit: (service.durationUnit ??
                  "months") as DurationUnit,
                promotionType: ((service.promotionType as PromotionType) ??
                  "none") as Exclude<PromotionType, null> | "none",
                promotionValue:
                  service.promotionValue === undefined ||
                  service.promotionValue === null
                    ? ""
                    : Number(service.promotionValue),
              };
              return acc;
            },
            {} as Record<string, ServiceSelectionEntry>,
          )
        : {};

      state.formData = {
        customer:
          typeof sub.customer === "string"
            ? sub.customer
            : sub.customer?._id || "",
        gymId: sub.gymId ?? null,
        startDate:
          typeof sub.startDate === "string"
            ? sub.startDate.split("T")[0]
            : new Date(sub.startDate).toISOString().split("T")[0],
        status: sub.status,
        paymentStatus: sub.paymentStatus,
        paidAmount: sub.paidAmount,
        trainerId: resolveTrainerId(sub.trainer),
        trainerFeeRowId: resolveTrainerFeeId(sub.trainer),
        trainerDuration: (sub.trainer as any)?.duration ?? 1,
        trainerDurationUnit:
          (((sub.trainer as any)?.durationUnit as DurationUnit) ??
            "months") as DurationUnit,
        trainerPromotionType:
          ((((sub.trainer as any)?.promotionType as PromotionType) ??
            "none") as Exclude<PromotionType, null> | "none"),
        trainerPromotionValue: (sub.trainer as any)?.promotionValue ?? "",
        notes: sub.notes || null,
      };
      state.selectedGymFeeId =
        sub.gymFee && typeof sub.gymFee === "object"
          ? String(
              (sub.gymFee as any).feeId ?? (sub.gymFee as any).priceRowId ?? "",
            )
          : "";
      state.selectedServices = selectedServices;
    },
    setFormData(state, action: PayloadAction<Partial<SubscriptionFormData>>) {
      Object.assign(state.formData, action.payload);
    },
    setSelectedGymFeeId(state, action: PayloadAction<string>) {
      state.selectedGymFeeId = action.payload;
    },
    toggleService(state, action: PayloadAction<string>) {
      const serviceId = action.payload;
      if (state.selectedServices[serviceId]) {
        delete state.selectedServices[serviceId];
      } else {
        state.selectedServices[serviceId] = {
          duration: 1,
          durationUnit: "months",
          promotionType: "none",
          promotionValue: "",
        };
      }
    },
    updateServiceEntry(
      state,
      action: PayloadAction<{
        serviceId: string;
        entry: Partial<ServiceSelectionEntry>;
      }>,
    ) {
      const { serviceId, entry } = action.payload;
      if (state.selectedServices[serviceId]) {
        Object.assign(state.selectedServices[serviceId], entry);
      }
    },
    resetCreateForm(state) {
      state.formData = {
        ...defaultFormData,
        startDate: new Date().toISOString().split("T")[0],
      };
      state.selectedGymFeeId = "";
      state.selectedServices = {};
      state.isEditMode = false;
      state.subscriptionToEditId = null;
    },
  },
});

export const {
  setStatusFilter,
  setPaymentFilter,
  setGymFeeExpiryDays,
  setPage,
  setLimit,
  openCreateDialog,
  closeCreateDialog,
  openDetailsDialog,
  closeDetailsDialog,
  openEditDialog,
  setFormData,
  setSelectedGymFeeId,
  toggleService,
  updateServiceEntry,
  resetCreateForm,
} = subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;
