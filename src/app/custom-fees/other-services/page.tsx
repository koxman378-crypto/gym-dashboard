"use client";

import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  useCreateOtherServiceItemMutation,
  useDeleteOtherServiceItemMutation,
  useGetAllOtherServiceItemsQuery,
  useUpdateOtherServiceItemMutation,
} from "@/src/store/services/customFeesApi";
import type {
  OtherServiceItem,
  CreateOtherServiceDto,
} from "@/src/types/extended-types";
import { OtherServiceFormDialog } from "@/src/components/custom-fees/other-services/OtherServiceFormDialog";
import { OtherServiceList } from "@/src/components/custom-fees/other-services/OtherServiceList";
import { useOtherServicesState } from "@/src/store/hooks/useOtherServicesState";
import { useLanguage } from "@/src/components/language/LanguageContext";
import { useOwnerBranchFilter } from "@/src/components/layout/OwnerBranchFilterContext";
import { PageLoadingState } from "@/src/components/ui/page-loading-state";

export default function OtherServicesPage() {
  const { t } = useLanguage();
  const { isOwner, selectedGymId } = useOwnerBranchFilter();
  const branchQuery = isOwner ? (selectedGymId ?? undefined) : undefined;
  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedItemId,
    formData,
    openCreateDialog,
    openEditDialog,
    closeCreateDialog,
    closeEditDialog,
    setFormData,
  } = useOtherServicesState();

  const { data: serviceItems = [], isLoading } =
    useGetAllOtherServiceItemsQuery({ gymId: branchQuery });
  const selectedItem = selectedItemId
    ? (serviceItems.find((i) => i._id === selectedItemId) ?? null)
    : null;
  const [createItem] = useCreateOtherServiceItemMutation();
  const [updateItem] = useUpdateOtherServiceItemMutation();
  const [deleteItem] = useDeleteOtherServiceItemMutation();

  if (isLoading && serviceItems.length === 0) {
    return <PageLoadingState />;
  }

  const lightSurfaceClassName =
    "border border-border bg-background text-foreground shadow-sm";
  const lightButtonClassName =
    "border border-border bg-background text-foreground hover:bg-muted hover:text-foreground shadow-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amountDays: Number(formData.amountDays || 0),
      amountMonths: Number(formData.amountMonths || 0),
      amountYears: Number(formData.amountYears || 0),
    };
    if (isEditDialogOpen && selectedItem) {
      await updateItem({ id: selectedItem._id, data: payload }).unwrap();
      closeEditDialog();
    } else {
      await createItem({ data: payload, gymId: branchQuery }).unwrap();
      closeCreateDialog();
    }
  };

  const handleEdit = (item: OtherServiceItem) => {
    openEditDialog(item);
  };

  const handleDelete = async (item: OtherServiceItem) => {
    if (confirm(`Delete ${item.name}?`)) {
      await deleteItem(item._id).unwrap();
    }
  };

  const handleToggle = async (item: OtherServiceItem) => {
    await updateItem({
      id: item._id,
      data: {
        name: item.name,
        amountDays: item.amountDays,
        amountMonths: item.amountMonths,
        amountYears: item.amountYears,
        isActive: !item.isActive,
      },
    }).unwrap();
  };

  return (
    <div className="min-h-screen p-6 text-foreground" style={{ backgroundColor: '#FCFCFC' }}>
      <div
        className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-[#F5F5F5] p-6 shadow-sm"
      >
        <div>
          <h1 className="text-3xl font-bold">{t("otherServices.title")}</h1>
          <p className="mt-1 text-muted-foreground">
            {t("otherServices.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => openCreateDialog()}
          className={`cursor-pointer px-6 py-6 text-base font-semibold ${lightButtonClassName}`}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("otherServices.addService")}
        </Button>
      </div>

      <div>
        <OtherServiceList
          items={serviceItems}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      </div>

      <OtherServiceFormDialog
        open={isCreateDialogOpen || isEditDialogOpen}
        isEdit={isEditDialogOpen}
        formData={formData}
        onOpenChange={(open) => {
          if (!open) {
            if (isEditDialogOpen) closeEditDialog();
            else closeCreateDialog();
          }
        }}
        onChange={(data) => setFormData(data)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
