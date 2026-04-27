"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import type { MultiGymItem } from "@/src/types/type";

const LIGHT_INPUT_CN =
  "mt-1 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus-visible:border-gray-300 focus-visible:ring-0 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:hover:border-gray-200";

export function MultiGymCrudBox({
  branches,
  disabled,
  onChange,
}: {
  branches: MultiGymItem[];
  disabled: boolean;
  onChange: (branches: MultiGymItem[]) => void;
}) {
  const updateBranch = (
    index: number,
    patch: Partial<MultiGymItem>,
  ) => {
    onChange(
      branches.map((branch, branchIndex) =>
        branchIndex === index ? { ...branch, ...patch } : branch,
      ),
    );
  };

  const addBranch = () => {
    onChange([
      ...branches,
      {
        name: "",
        description: "",
        isActive: true,
      },
    ]);
  };

  const removeBranch = (index: number) => {
    onChange(branches.filter((_, branchIndex) => branchIndex !== index));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-[#F8F8F8] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Branches</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage Gym A, Gym B, Gym C under the main gym profile.
          </p>
        </div>
        <Button
          type="button"
          onClick={addBranch}
          disabled={disabled}
          className="cursor-pointer gap-2 border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </Button>
      </div>

      {branches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
          No branches yet. Add your first branch.
        </div>
      ) : (
        <div className="space-y-4">
          {branches.map((branch, index) => (
            <div
              key={branch._id ?? `new-${index}`}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Branch Name
                  </Label>
                  <Input
                    value={branch.name}
                    onChange={(e) =>
                      updateBranch(index, { name: e.target.value })
                    }
                    placeholder="Gym A"
                    className={LIGHT_INPUT_CN}
                    disabled={disabled}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Input
                    value={branch.description ?? ""}
                    onChange={(e) =>
                      updateBranch(index, { description: e.target.value })
                    }
                    placeholder="Downtown branch"
                    className={LIGHT_INPUT_CN}
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  Branch ID: {branch._id ?? "Will be generated on save"}
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={branch.isActive ?? true}
                      onChange={(e) =>
                        updateBranch(index, { isActive: e.target.checked })
                      }
                      disabled={disabled}
                      className="h-4 w-4 rounded border-gray-300 bg-white"
                    />
                    Active
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeBranch(index)}
                    disabled={disabled}
                    className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}