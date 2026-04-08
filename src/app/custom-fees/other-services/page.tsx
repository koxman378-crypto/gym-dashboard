"use client";

import { useState } from "react";
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

export default function OtherServicesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OtherServiceItem | null>(
    null,
  );
  const [formData, setFormData] = useState<CreateOtherServiceDto>({
    name: "",
    amount: 0,
    isActive: true,
  });

  const { data: serviceItems = [], isLoading } =
    useGetAllOtherServiceItemsQuery({});
  const [createItem] = useCreateOtherServiceItemMutation();
  const [updateItem] = useUpdateOtherServiceItemMutation();
  const [deleteItem] = useDeleteOtherServiceItemMutation();

  const lightSurfaceClassName =
    "border border-black/15 bg-white text-slate-900 shadow-sm";
  const lightButtonClassName =
    "border border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditDialogOpen && selectedItem) {
      await updateItem({ id: selectedItem._id, data: formData }).unwrap();
      setIsEditDialogOpen(false);
      setSelectedItem(null);
    } else {
      await createItem(formData).unwrap();
      setIsCreateDialogOpen(false);
    }
    setFormData({ name: "", amount: 0, isActive: true });
  };

  const handleEdit = (item: OtherServiceItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      amount: item.amount,
      isActive: item.isActive,
    });
    setIsEditDialogOpen(true);
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
        amount: item.amount,
        isActive: !item.isActive,
      },
    }).unwrap();
  };

  return (
    <div className="min-h-screen bg-white p-6 text-slate-900">
      <div
        className={`mb-6 flex items-center justify-between rounded-2xl p-6 ${lightSurfaceClassName}`}
      >
        <div>
          <h1 className="text-3xl font-bold">Other Services</h1>
          <p className="mt-1 text-slate-600">
            Create flat service items with amount only.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className={`cursor-pointer px-6 py-6 text-base font-semibold ${lightButtonClassName}`}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      <div className={`rounded-2xl ${lightSurfaceClassName}`}>
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
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedItem(null);
            setFormData({ name: "", amount: 0, isActive: true });
          }
        }}
        onChange={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
