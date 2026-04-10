import { useAppDispatch, useAppSelector } from "./index";
import {
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
  type SubscriptionFormData,
  type ServiceSelectionEntry,
} from "../slices/subscriptionsSlice";
import type { Subscription } from "@/src/types/extended-types";

export function useSubscriptionsState() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.subscriptionsUi);

  return {
    // State
    statusFilter: state.statusFilter,
    paymentFilter: state.paymentFilter,
    gymFeeExpiryDays: state.gymFeeExpiryDays,
    page: state.page,
    limit: state.limit,
    isCreateDialogOpen: state.isCreateDialogOpen,
    isDetailsDialogOpen: state.isDetailsDialogOpen,
    selectedSubscriptionId: state.selectedSubscriptionId,
    isEditMode: state.isEditMode,
    subscriptionToEditId: state.subscriptionToEditId,
    formData: state.formData,
    selectedGymFeeId: state.selectedGymFeeId,
    selectedServices: state.selectedServices,

    // Actions
    setStatusFilter: (v: string) => dispatch(setStatusFilter(v)),
    setPaymentFilter: (v: string) => dispatch(setPaymentFilter(v)),
    setGymFeeExpiryDays: (v: number | "") => dispatch(setGymFeeExpiryDays(v)),
    setPage: (v: number) => dispatch(setPage(v)),
    setLimit: (v: number) => dispatch(setLimit(v)),
    openCreateDialog: () => dispatch(openCreateDialog()),
    closeCreateDialog: () => dispatch(closeCreateDialog()),
    openDetailsDialog: (id: string) => dispatch(openDetailsDialog(id)),
    closeDetailsDialog: () => dispatch(closeDetailsDialog()),
    openEditDialog: (sub: Subscription) => dispatch(openEditDialog(sub)),
    setFormData: (data: Partial<SubscriptionFormData>) =>
      dispatch(setFormData(data)),
    setSelectedGymFeeId: (id: string) => dispatch(setSelectedGymFeeId(id)),
    toggleService: (serviceId: string) => dispatch(toggleService(serviceId)),
    updateServiceEntry: (
      serviceId: string,
      entry: Partial<ServiceSelectionEntry>,
    ) => dispatch(updateServiceEntry({ serviceId, entry })),
    resetCreateForm: () => dispatch(resetCreateForm()),
  };
}
