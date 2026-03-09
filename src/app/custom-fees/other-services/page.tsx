"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { calculateServiceFinalPrice } from "@/src/lib/priceCalculations";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  useGetAllOtherServiceGroupsQuery,
  useCreateOtherServiceGroupMutation,
  useUpdateOtherServiceGroupMutation,
  useDeleteOtherServiceGroupMutation,
  useToggleOtherServiceGroupMutation,
  useToggleOtherServiceItemMutation,
} from "@/src/store/services/customFeesApi";
import type {
  OtherServiceGroup,
  OtherServiceItem,
  CreateOtherServiceDto,
  DurationUnit,
  PromotionType,
} from "@/src/types/extended-types";

export default function OtherServicesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<OtherServiceGroup | null>(
    null,
  );
  const [formData, setFormData] = useState<CreateOtherServiceDto>({
    name: "",
    services: [],
    isActive: false,
  });

  const { data: serviceGroups = [], isLoading } =
    useGetAllOtherServiceGroupsQuery({});
  const [createGroup] = useCreateOtherServiceGroupMutation();
  const [updateGroup] = useUpdateOtherServiceGroupMutation();
  const [deleteGroup] = useDeleteOtherServiceGroupMutation();
  const [toggleGroup] = useToggleOtherServiceGroupMutation();
  const [toggleItem] = useToggleOtherServiceItemMutation();

  const calculateFinalPrice = (item: Omit<OtherServiceItem, "_id">) => {
    return calculateServiceFinalPrice(item);
  };

  const addServiceRow = () => {
    setFormData({
      ...formData,
      services: [
        ...formData.services,
        {
          name: "",
          duration: 1,
          durationUnit: "months" as DurationUnit,
          price: 0,
          promotionType: null,
          promotionValue: null,
          isActive: true,
        },
      ],
    });
  };

  const updateServiceRow = (
    index: number,
    field: keyof OtherServiceItem,
    value: any,
  ) => {
    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setFormData({ ...formData, services: newServices });
  };

  const removeServiceRow = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const handleCreate = async () => {
    try {
      await createGroup(formData).unwrap();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create service group:", error);
    }
  };

  const handleEdit = (group: OtherServiceGroup) => {
    if (!group._id) {
      console.error("❌ Cannot edit group without ID:", group);
      alert("Cannot edit group - ID is missing");
      return;
    }

    setSelectedGroup(group);
    setFormData({
      name: group.name,
      services: group.services.map((s) => ({
        name: s.name,
        duration: s.duration,
        durationUnit: s.durationUnit,
        price: s.price,
        promotionType: s.promotionType,
        promotionValue: s.promotionValue,
        isActive: s.isActive,
      })),
      isActive: group.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedGroup) {
      console.error("❌ No group selected");
      return;
    }

    if (!selectedGroup._id) {
      console.error("❌ Selected group has no ID:", selectedGroup);
      alert("Cannot update group - ID is missing");
      return;
    }

    try {
      await updateGroup({ id: selectedGroup._id, data: formData }).unwrap();
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("❌ Failed to update service group:", error);
      alert(error?.data?.message || "Failed to update service group");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service group?")) return;
    try {
      await deleteGroup(id).unwrap();
    } catch (error) {
      console.error("Failed to delete service group:", error);
    }
  };

  const handleToggleGroup = async (group: OtherServiceGroup) => {
    if (!group?._id) {
      console.error("❌ Service group ID is missing:", group);
      alert("Invalid service group - ID is missing");
      return;
    }

    // If trying to activate this group, check if another is already active
    if (!group.isActive) {
      const activeGroup = serviceGroups.find((g) => g._id !== group._id && g.isActive);
      if (activeGroup) {
        const confirmActivate = confirm(
          `Only one service group can be active at a time.\n\nCurrently active: "${activeGroup.name}"\n\nDo you want to deactivate "${activeGroup.name}" and activate "${group.name}" instead?`
        );
        if (!confirmActivate) {
          return;
        }
        // Deactivate the current active group first
        try {
          await toggleGroup(activeGroup._id).unwrap();
        } catch (error: any) {
          console.error("❌ Failed to deactivate current active group:", error);
          alert(error?.data?.message || "Failed to deactivate current active group. Please try again.");
          return;
        }
      }
    }

    try {
      await toggleGroup(group._id).unwrap();
    } catch (error: any) {
      console.error("❌ Failed to toggle service group:", error);
      alert(error?.data?.message || "Failed to toggle service group");
    }
  };

  const handleToggleItem = async (groupId: string, itemId: string) => {
    if (!groupId || !itemId) {
      console.error("❌ Group ID or Item ID is missing:", { groupId, itemId });
      alert("Invalid service item");
      return;
    }

    try {
      await toggleItem({ groupId, itemId }).unwrap();
    } catch (error: any) {
      console.error("❌ Failed to toggle service item:", error);
      alert(error?.data?.message || "Failed to toggle service item");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      services: [],
      isActive: false,
    });
    setSelectedGroup(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Sort groups: active ones first, then by creation date
  const sortedServiceGroups = [...serviceGroups].sort((a, b) => {
    // Active groups come first
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    // Then sort by creation date (newest first)
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">  
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Other Services
              </h1>
              <p className="text-slate-600 mt-2 text-base">
                Configure additional services like sauna, pool, and other
                amenities
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm font-semibold px-6 py-6"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Group
            </Button>
          </div>
        </div>

        {/* Service Groups Grid */}
        <div className="grid gap-6">
          {sortedServiceGroups.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="rounded-full bg-slate-100 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Service Groups Yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Create your first service group to get started
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Group
                </Button>
              </div>
            </div>
          ) : (
            sortedServiceGroups.map((group) => (
              <div
                key={group._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Group Header */}
                <div className="bg-linear-to-r from-blue-50 to-cyan-50 border-b border-blue-100 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-slate-900">
                          {group.name}
                        </h2>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            group.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {group.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {group.services.length} service
                        {group.services.length !== 1 ? "s" : ""} configured
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleGroup(group)}
                        disabled={!group._id}
                        className={group.isActive
                          ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                          : "border-slate-300 hover:bg-slate-50 text-slate-600"
                        }
                      >
                        {group.isActive ? (
                          <>
                            <ToggleRight className="h-4 w-4 mr-1.5" />
                            <span className="text-xs font-semibold">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 mr-1.5" />
                            <span className="text-xs font-semibold">Activate</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(group)}
                        className="border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                      >
                        <Edit className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-semibold">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(group._id)}
                        className="border-red-300 bg-red-50 hover:bg-red-100 text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-semibold">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Services Table */}
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Service Name
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Duration
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Price per Unit
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Promotion
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Final Price
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                            Status
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.services.map((service, index) => {
                          const finalPrice = calculateFinalPrice(service);
                          const hasPromotion =
                            service.promotionType && service.promotionValue;
                          return (
                            <tr
                              key={service._id}
                              className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                                index === group.services.length - 1
                                  ? "border-b-0"
                                  : ""
                              }`}
                            >
                              <td className="py-4 px-4">
                                <span className="font-medium text-slate-900">
                                  {service.name}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-slate-700">
                                  {service.duration} {service.durationUnit}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-col">
                                  <span className="text-xs text-slate-500">
                                    {service.price.toLocaleString()} MMK × {service.duration}
                                  </span>
                                  <span
                                    className={`text-slate-700 ${
                                      hasPromotion ? "line-through text-sm" : "font-semibold"
                                    }`}
                                  >
                                    {(service.price * service.duration).toLocaleString()} MMK
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                {hasPromotion ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-semibold">
                                    -{service.promotionValue}
                                    {service.promotionType === "percentage"
                                      ? "%"
                                      : " MMK"}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-sm">
                                    No promotion
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-lg font-bold text-slate-900">
                                  {finalPrice.toLocaleString()} MMK
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    service.isActive
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {service.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleToggleItem(group._id, service._id)
                                  }
                                  className={service.isActive
                                    ? "border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700"
                                    : "border-slate-300 hover:bg-slate-100 text-slate-600"
                                  }
                                >
                                  {service.isActive ? (
                                    <>
                                      <ToggleRight className="h-4 w-4 mr-1.5" />
                                      <span className="text-xs font-semibold">Active</span>
                                    </>
                                  ) : (
                                    <>
                                      <ToggleLeft className="h-4 w-4 mr-1.5" />
                                      <span className="text-xs font-semibold">Inactive</span>
                                    </>
                                  )}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {isEditDialogOpen ? "Edit" : "Create"} Service Group
            </DialogTitle>
            <DialogDescription className="text-base">
              Configure additional services like sauna, pool, and other
              amenities
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Group Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Extra Services 2026"
                className="border-slate-300"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
              />
              <Label
                htmlFor="isActive"
                className="font-semibold cursor-pointer"
              >
                Set as Active Group
              </Label>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">
                  Services ({formData.services.length})
                </Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={addServiceRow}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Service
                </Button>
              </div>

              <div className="space-y-3">
                {formData.services.map((service, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700">
                        Service {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeServiceRow(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600">
                        Service Name *
                      </Label>
                      <Input
                        value={service.name}
                        onChange={(e) =>
                          updateServiceRow(index, "name", e.target.value)
                        }
                        placeholder="e.g., Sauna, Swimming Pool"
                        className="border-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600">
                          Duration *
                        </Label>
                        <Input
                          type="number"
                          value={service.duration}
                          onChange={(e) =>
                            updateServiceRow(
                              index,
                              "duration",
                              parseInt(e.target.value),
                            )
                          }
                          className="border-slate-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600">
                          Unit *
                        </Label>
                        <Select
                          value={service.durationUnit}
                          onValueChange={(value: DurationUnit) =>
                            updateServiceRow(index, "durationUnit", value)
                          }
                        >
                          <SelectTrigger className="border-slate-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                            <SelectItem value="years">Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600">
                        Price per {service.durationUnit === 'months' ? 'Month' : service.durationUnit === 'days' ? 'Day' : 'Year'} (MMK) *
                      </Label>
                      <Input
                        type="number"
                        value={service.price}
                        onChange={(e) =>
                          updateServiceRow(
                            index,
                            "price",
                            parseFloat(e.target.value),
                          )
                        }
                        placeholder="50000"
                        className="border-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600">
                          Promotion Type
                        </Label>
                        <Select
                          value={service.promotionType || "none"}
                          onValueChange={(value) =>
                            updateServiceRow(
                              index,
                              "promotionType",
                              value === "none"
                                ? null
                                : (value as PromotionType),
                            )
                          }
                        >
                          <SelectTrigger className="border-slate-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Promotion</SelectItem>
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
                        <Label className="text-xs font-semibold text-slate-600">
                          Discount Value
                        </Label>
                        <Input
                          type="number"
                          value={service.promotionValue || ""}
                          onChange={(e) =>
                            updateServiceRow(
                              index,
                              "promotionValue",
                              parseFloat(e.target.value) || null,
                            )
                          }
                          placeholder={
                            service.promotionType === "percentage"
                              ? "10"
                              : "5000"
                          }
                          disabled={!service.promotionType}
                          className="border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`active-${index}`}
                          checked={service.isActive}
                          onChange={(e) =>
                            updateServiceRow(
                              index,
                              "isActive",
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
                        />
                        <Label
                          htmlFor={`active-${index}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          Active
                        </Label>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 mb-0.5">
                          {service.price.toLocaleString()} × {service.duration} {service.durationUnit}
                          {service.promotionType && service.promotionValue && ` - ${service.promotionValue}${service.promotionType === 'percentage' ? '%' : ' MMK'}`}
                        </div>
                        <div className="text-xs text-slate-600 mb-1">
                          Total Price
                        </div>
                        <div className="text-lg font-bold text-slate-900">
                          {calculateFinalPrice(service).toLocaleString()} MMK
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.services.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p>No services added yet. Click "Add Service" to start.</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={isEditDialogOpen ? handleUpdate : handleCreate}
              disabled={!formData.name || formData.services.length === 0}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {isEditDialogOpen ? "Update Group" : "Create Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

