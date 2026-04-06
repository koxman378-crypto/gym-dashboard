"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import {
  useCreateOtherServiceItemMutation,
  useDeleteOtherServiceItemMutation,
  useGetAllOtherServiceItemsQuery,
  useUpdateOtherServiceItemMutation,
} from "@/src/store/services/customFeesApi";
import type { OtherServiceItem, CreateOtherServiceDto } from "@/src/types/extended-types";

export default function OtherServicesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OtherServiceItem | null>(null);
  const [formData, setFormData] = useState<CreateOtherServiceDto>({
    name: "",
    amount: 0,
    isActive: true,
  });

  const { data: serviceItems = [], isLoading } = useGetAllOtherServiceItemsQuery(
    {},
  );
  const [createItem] = useCreateOtherServiceItemMutation();
  const [updateItem] = useUpdateOtherServiceItemMutation();
  const [deleteItem] = useDeleteOtherServiceItemMutation();

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
    <div className="min-h-screen bg-[#0F172B] p-6 text-white">
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800 p-6">
        <div>
          <h1 className="text-3xl font-bold">Other Services</h1>
          <p className="mt-1 text-slate-400">
            Create flat service items with amount only.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-800">
        {isLoading ? (
          <div className="p-6 text-center text-slate-300">Loading...</div>
        ) : serviceItems.length === 0 ? (
          <div className="p-6 text-center text-slate-300">
            No services found
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {serviceItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-slate-400">
                    {item.amount.toLocaleString()} MMK
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggle(item)}
                  >
                    {item.isActive ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedItem(null);
          setFormData({ name: "", amount: 0, isActive: true });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? "Edit Service" : "Add Service"}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? "Update the service item." : "Create a service item with amount only."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
              />
            </div>
            <DialogFooter>
              <Button type="submit">
                {isEditDialogOpen ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
