"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  TrendingUp,
  Package2,
} from "lucide-react";
import { calculateGymFinalPrice } from "@/src/lib/priceCalculations";
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
import { Badge } from "@/src/components/ui/badge";

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

  const { data: gymPriceGroups = [], isLoading} = useGetAllGymPriceGroupsQuery({});
  const [createGroup] = useCreateGymPriceGroupMutation();
  const [updateGroup] = useUpdateGymPriceGroupMutation();
  const [deleteGroup] = useDeleteGymPriceGroupMutation();
  const [toggleGroup] = useToggleGymPriceGroupMutation();
  const [toggleItem] = useToggleGymPriceItemMutation();

  const calculateFinalPrice = (item: Omit<GymPriceItem, "_id">) => {
    return calculateGymFinalPrice(item);
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
    }
  };

  const handleEdit = (group: GymPriceGroup) => {
    if (!group._id) {
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
      return;
    }

    if (!selectedGroup._id) {
      alert("Cannot update group - ID is missing");
      return;
    }

    try {
      await updateGroup({ id: selectedGroup._id, data: formData }).unwrap();
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing group?")) return;
    try {
      await deleteGroup(id).unwrap();
    } catch (error) {
    }
  };

  const handleToggleGroup = async (group: GymPriceGroup) => {
    if (!group._id) {
      return;
    }

    // If trying to activate this group, check if another is already active
    if (!group.isActive) {
      const activeGroup = gymPriceGroups.find((g) => g._id !== group._id && g.isActive);
      if (activeGroup) {
        const confirmActivate = confirm(
          `Only one pricing group can be active at a time.\n\nCurrently active: "${activeGroup.name}"\n\nDo you want to deactivate "${activeGroup.name}" and activate "${group.name}" instead?`
        );
        if (!confirmActivate) {
          return;
        }
        // Deactivate the current active group first
        try {
          await toggleGroup(activeGroup._id).unwrap();
        } catch (error) {
          alert("Failed to deactivate current active group. Please try again.");
          return;
        }
      }
    }

    try {
      await toggleGroup(group._id).unwrap();
    } catch (error) {
    }
  };

  const handleToggleItem = async (groupId: string, itemId: string) => {
    try {
      await toggleItem({ groupId, itemId }).unwrap();
    } catch (error) {
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
      <div className="flex items-center justifyContent-center min-h-screen bg-[#0F172B]">
        <div className="text-slate-400">Loading...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <DollarSign className="h-7 w-7 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Gym Prices
              </h1>
              <p className="text-sm text-slate-400">
                Manage membership pricing and subscription plans
              </p>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Price Group
          </Button>
        </div>

        {/* Price Groups Grid */}
        <div className="grid gap-6">
          {sortedGymPriceGroups.length === 0 ? (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
              <Package2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No Price Groups Yet
              </h3>
              <p className="text-slate-400 mb-4">
                Create your first gym pricing group to get started
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Price Group
              </Button>
            </div>
          ) : (
            sortedGymPriceGroups.map((group) => (
              <div
                key={group._id}
                className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Group Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-indigo-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-white">
                          {group.name}
                        </h2>
                        <Badge
                          variant={group.isActive ? "default" : "secondary"}
                          className={
                            group.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-600 text-slate-300"
                          }
                        >
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400">
                        {group.prices.length} pricing tier
                        {group.prices.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleGroup(group)}
                        disabled={!group._id}
                        className={group.isActive 
                          ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                          : "border-slate-600 hover:bg-slate-800 text-slate-400"
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

                {/* Prices Table */}
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                            Duration
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                            Price per Unit
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                            Promotion
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                            Final Price
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                            Status
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.prices.map((price, index) => {
                          const finalPrice = calculateFinalPrice(price);
                          const hasPromotion = price.promotionType && price.promotionValue;

                          return (
                            <tr
                              key={price._id}
                              className={`border-b border-slate-100 hover:bg-slate-800 transition-colors ${
                                index === group.prices.length - 1 ? "border-b-0" : ""
                              }`}
                            >
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0F172B] border border-slate-700 rounded-full text-sm font-semibold text-slate-300">
                                  <TrendingUp className="h-3.5 w-3.5" />
                                  {price.duration} {price.durationUnit}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-col">
                                  <span className="text-xs text-slate-400">
                                    {price.amount.toLocaleString()} MMK × {price.duration}
                                  </span>
                                  <span
                                    className={`text-slate-300 ${
                                      hasPromotion ? "line-through text-sm" : "font-semibold"
                                    }`}
                                  >
                                    {(price.amount * price.duration).toLocaleString()} MMK
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                {hasPromotion ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-semibold">
                                    -{price.promotionValue}
                                    {price.promotionType === "percentage" ? "%" : " MMK"}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-sm">
                                    No promotion
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-lg font-bold text-white">
                                  {finalPrice.toLocaleString()} MMK
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    price.isActive
                                      ? "bg-indigo-100 text-indigo-800"
                                      : "bg-slate-600 text-slate-300"
                                  }`}
                                >
                                  {price.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleItem(group._id, price._id)}
                                  className={price.isActive
                                    ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                    : "border-slate-600 hover:bg-slate-700 text-slate-400"
                                  }
                                >
                                  {price.isActive ? (
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {isEditDialogOpen ? "Edit" : "Create"} Gym Price Group
              </DialogTitle>
              <DialogDescription>
                Configure your gym membership pricing tiers and promotions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Group Name */}
              <div className="space-y-2">
                <Label htmlFor="groupName" className="text-sm font-semibold">
                  Group Name *
                </Label>
                <Input
                  id="groupName"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Standard Membership 2026"
                  className="text-base"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-4 bg-[#0F172B] rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                  Set as active pricing group
                </Label>
              </div>

              {/* Price Tiers */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Pricing Tiers</Label>
                  <Button
                    size="sm"
                    onClick={addPriceRow}
                    variant="outline"
                    className="border-indigo-300 text-indigo-600"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Tier
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.prices.map((price, index) => (
                    <div
                      key={index}
                      className="border-2 border-slate-700 p-5 rounded-xl space-y-4 bg-slate-800"
                    >
                      {/* Duration & Unit */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Duration *</Label>
                          <Input
                            type="number"
                            value={price.duration}
                            onChange={(e) =>
                              updatePriceRow(
                                index,
                                "duration",
                                parseInt(e.target.value) || 1,
                              )
                            }
                            min="1"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Unit *</Label>
                          <Select
                            value={price.durationUnit}
                            onValueChange={(value: DurationUnit) =>
                              updatePriceRow(index, "durationUnit", value)
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
                      </div>

                      {/* Amount */}
                      <div className="space-y-1.5">
                        <Label className="text-xs">Amount per {price.durationUnit === 'months' ? 'Month' : price.durationUnit === 'days' ? 'Day' : 'Year'} (MMK) *</Label>
                        <Input
                          type="number"
                          value={price.amount}
                          onChange={(e) =>
                            updatePriceRow(
                              index,
                              "amount",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          min="0"
                          placeholder="100000"
                        />
                      </div>

                      {/* Promotion */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Promotion Type</Label>
                          <Select
                            value={price.promotionType || "none"}
                            onValueChange={(value) =>
                              updatePriceRow(
                                index,
                                "promotionType",
                                value === "none" ? null : (value as PromotionType),
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Promotion</SelectItem>
                              <SelectItem value="percentage">
                                Percentage (%)
                              </SelectItem>
                              <SelectItem value="mmk">Fixed Amount (MMK)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Discount Value</Label>
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
                            disabled={!price.promotionType}
                            placeholder="10"
                            min="0"
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`tier-active-${index}`}
                            checked={price.isActive}
                            onChange={(e) =>
                              updatePriceRow(index, "isActive", e.target.checked)
                            }
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <Label
                            htmlFor={`tier-active-${index}`}
                            className="text-xs cursor-pointer"
                          >
                            Active Tier
                          </Label>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 mb-0.5">
                              {price.amount.toLocaleString()} × {price.duration} {price.durationUnit}
                              {price.promotionType && price.promotionValue && ` - ${price.promotionValue}${price.promotionType === 'percentage' ? '%' : ' MMK'}`}
                            </div>
                            <div className="text-xs text-slate-400">
                              Total Price
                            </div>
                            <div className="text-lg font-bold text-indigo-600">
                              {calculateFinalPrice(price).toLocaleString()} MMK
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePriceRow(index)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.prices.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      No pricing tiers added yet. Click "Add Tier" to create one.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
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
                onClick={isEditDialogOpen ? handleUpdate : handleCreate}
                disabled={!formData.name || formData.prices.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isEditDialogOpen ? "Update Group" : "Create Group"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

