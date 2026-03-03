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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  useGetAllGymPriceGroupsQuery,
  useCreateGymPriceGroupMutation,
  useUpdateGymPriceGroupMutation,
  useDeleteGymPriceGroupMutation,
  useToggleGymPriceGroupMutation,
  useToggleGymPriceItemMutation,
} from "@/src/store/services/customFeesApi";
import type {
  GymPriceGroup,
  GymPriceItem,
  CreateGymPriceDto,
  DurationUnit,
  PromotionType,
} from "@/src/types/extended-types";

export default function GymPricesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GymPriceGroup | null>(
    null,
  );
  const [formData, setFormData] = useState<CreateGymPriceDto>({
    name: "",
    prices: [],
    isActive: false,
  });

  const { data: gymPriceGroups = [], isLoading } = useGetAllGymPriceGroupsQuery(
    {},
  );
  const [createGroup] = useCreateGymPriceGroupMutation();
  const [updateGroup] = useUpdateGymPriceGroupMutation();
  const [deleteGroup] = useDeleteGymPriceGroupMutation();
  const [toggleGroup] = useToggleGymPriceGroupMutation();
  const [toggleItem] = useToggleGymPriceItemMutation();

  const calculateFinalPrice = (item: Omit<GymPriceItem, "_id">) => {
    if (!item.promotionType || !item.promotionValue) return item.amount;
    if (item.promotionType === "percentage") {
      return item.amount - (item.amount * item.promotionValue) / 100;
    }
    return item.amount - item.promotionValue;
  };

  const addPriceRow = () => {
    setFormData({
      ...formData,
      prices: [
        ...formData.prices,
        {
          duration: 1,
          durationUnit: "months" as DurationUnit,
          amount: 0,
          promotionType: null,
          promotionValue: null,
          isActive: true,
        },
      ],
    });
  };

  const updatePriceRow = (
    index: number,
    field: keyof GymPriceItem,
    value: any,
  ) => {
    const newPrices = [...formData.prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setFormData({ ...formData, prices: newPrices });
  };

  const removePriceRow = (index: number) => {
    setFormData({
      ...formData,
      prices: formData.prices.filter((_, i) => i !== index),
    });
  };

  const handleCreate = async () => {
    try {
      await createGroup(formData).unwrap();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create gym price group:", error);
    }
  };

  const handleEdit = (group: GymPriceGroup) => {
    if (!group._id) {
      console.error("❌ Cannot edit group without ID:", group);
      alert("Cannot edit group - ID is missing");
      return;
    }

    setSelectedGroup(group);
    setFormData({
      name: group.name,
      prices: group.prices.map((p) => ({
        duration: p.duration,
        durationUnit: p.durationUnit,
        amount: p.amount,
        promotionType: p.promotionType,
        promotionValue: p.promotionValue,
        isActive: p.isActive,
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
      console.error("❌ Failed to update gym price group:", error);
      alert(error?.data?.message || "Failed to update gym price group");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    try {
      await deleteGroup(id).unwrap();
    } catch (error) {
      console.error("Failed to delete gym price group:", error);
    }
  };

  const handleToggleGroup = async (group: GymPriceGroup) => {
    if (!group?._id) {
      console.error("❌ Gym price group ID is missing:", group);
      alert("Invalid gym price group - ID is missing");
      return;
    }

    // If trying to activate this group, check if another is already active
    if (!group.isActive) {
      const activeGroup = gymPriceGroups.find((g) => g._id !== group._id && g.isActive);
      if (activeGroup) {
        const confirmActivate = confirm(
          `Only one gym price group can be active at a time.\n\nCurrently active: "${activeGroup.name}"\n\nDo you want to deactivate "${activeGroup.name}" and activate "${group.name}" instead?`
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
      console.error("❌ Failed to toggle gym price group:", error);
      alert(error?.data?.message || "Failed to toggle gym price group");
    }
  };

  const handleToggleItem = async (groupId: string, itemId: string) => {
    if (!groupId || !itemId) {
      console.error("❌ Group ID or Item ID is missing:", { groupId, itemId });
      alert("Invalid price item");
      return;
    }

    try {
      await toggleItem({ groupId, itemId }).unwrap();
    } catch (error: any) {
      console.error("❌ Failed to toggle gym price item:", error);
      alert(error?.data?.message || "Failed to toggle gym price item");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      prices: [],
      isActive: false,
    });
    setSelectedGroup(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Sort groups: active ones first, then by creation date
  const sortedGymPriceGroups = [...gymPriceGroups].sort((a, b) => {
    // Active groups come first
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    // Then sort by creation date (newest first)
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Gym Pricing Plans
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-base">
                Configure membership pricing tiers and promotions
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-sm font-semibold px-6 py-6"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Group
            </Button>
          </div>
        </div>

        {/* Price Groups Grid */}
        <div className="grid gap-6">
          {sortedGymPriceGroups.length === 0 ? (
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="rounded-full bg-slate-100 dark:bg-slate-900 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No Price Groups Yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Create your first gym pricing group to get started
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Group
                </Button>
              </div>
            </div>
          ) : (
            sortedGymPriceGroups.map((group) => (
              <div
                key={group._id}
                className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Group Header */}
                <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          {group.name}
                        </h2>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            group.isActive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {group.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {group.prices.length} pricing tier
                        {group.prices.length !== 1 ? "s" : ""} configured
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleGroup(group)}
                        disabled={!group._id}
                        className={group.isActive
                          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
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
                        className="border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                      >
                        <Edit className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-semibold">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(group._id)}
                        className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-semibold">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Pricing Table */}
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Duration
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Base Amount
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Promotion
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Final Price
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Status
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.prices.map((price, index) => {
                          const finalPrice = calculateFinalPrice(price);
                          const hasPromotion =
                            price.promotionType && price.promotionValue;
                          return (
                            <tr
                              key={price._id}
                              className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                                index === group.prices.length - 1
                                  ? "border-b-0"
                                  : ""
                              }`}
                            >
                              <td className="py-4 px-4">
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {price.duration} {price.durationUnit}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`text-slate-700 dark:text-slate-300 ${
                                    hasPromotion ? "line-through text-sm" : ""
                                  }`}
                                >
                                  {price.amount.toLocaleString()} MMK
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {hasPromotion ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-semibold">
                                    -{price.promotionValue}
                                    {price.promotionType === "percentage"
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
                                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                  {finalPrice.toLocaleString()} MMK
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    price.isActive
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  {price.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleToggleItem(group._id, price._id)
                                  }
                                  className="hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  {price.isActive ? (
                                    <ToggleRight className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4 text-slate-400" />
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
              {isEditDialogOpen ? "Edit" : "Create"} Gym Price Group
            </DialogTitle>
            <DialogDescription className="text-base">
              Configure your gym pricing tiers and promotional offers
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
                placeholder="e.g., Standard Pricing 2026"
                className="border-slate-300 dark:border-slate-600"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
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
                  Price Tiers ({formData.prices.length})
                </Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={addPriceRow}
                  className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Tier
                </Button>
              </div>

              <div className="space-y-3">
                {formData.prices.map((price, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 bg-slate-50 dark:bg-slate-900/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Tier {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePriceRow(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Duration *
                        </Label>
                        <Input
                          type="number"
                          value={price.duration}
                          onChange={(e) =>
                            updatePriceRow(
                              index,
                              "duration",
                              parseInt(e.target.value),
                            )
                          }
                          className="border-slate-300 dark:border-slate-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Unit *
                        </Label>
                        <Select
                          value={price.durationUnit}
                          onValueChange={(value: DurationUnit) =>
                            updatePriceRow(index, "durationUnit", value)
                          }
                        >
                          <SelectTrigger className="border-slate-300 dark:border-slate-600">
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
                      <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Amount (MMK) *
                      </Label>
                      <Input
                        type="number"
                        value={price.amount}
                        onChange={(e) =>
                          updatePriceRow(
                            index,
                            "amount",
                            parseFloat(e.target.value),
                          )
                        }
                        placeholder="50000"
                        className="border-slate-300 dark:border-slate-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Promotion Type
                        </Label>
                        <Select
                          value={price.promotionType || "none"}
                          onValueChange={(value) =>
                            updatePriceRow(
                              index,
                              "promotionType",
                              value === "none"
                                ? null
                                : (value as PromotionType),
                            )
                          }
                        >
                          <SelectTrigger className="border-slate-300 dark:border-slate-600">
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
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Discount Value
                        </Label>
                        <Input
                          type="number"
                          value={price.promotionValue || ""}
                          onChange={(e) =>
                            updatePriceRow(
                              index,
                              "promotionValue",
                              parseFloat(e.target.value) || null,
                            )
                          }
                          placeholder={
                            price.promotionType === "percentage" ? "10" : "5000"
                          }
                          disabled={!price.promotionType}
                          className="border-slate-300 dark:border-slate-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`active-${index}`}
                          checked={price.isActive}
                          onChange={(e) =>
                            updatePriceRow(index, "isActive", e.target.checked)
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
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          Final Price
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {calculateFinalPrice(price).toLocaleString()} MMK
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.prices.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p>No pricing tiers added yet. Click "Add Tier" to start.</p>
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
              disabled={!formData.name || formData.prices.length === 0}
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
            >
              {isEditDialogOpen ? "Update Group" : "Create Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
