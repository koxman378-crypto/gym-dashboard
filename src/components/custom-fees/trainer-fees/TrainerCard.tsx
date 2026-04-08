"use client";

import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import type { User } from "@/src/types/type";

const lightSurfaceClassName =
  "border border-black/15 bg-white text-slate-900 shadow-sm";
const lightButtonClassName =
  "border border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-sm";

interface TrainerCardProps {
  trainer: User;
  onEdit: (trainer: User) => void;
  onToggleFee: (trainerId: string, feeId: string) => void;
}

export function TrainerCard({
  trainer,
  onEdit,
  onToggleFee,
}: TrainerCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl transition-shadow hover:shadow-md ${lightSurfaceClassName}`}
    >
      {/* Trainer Header */}
      <div className="border-b border-black/10 bg-slate-50 p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {trainer.avatar ? (
              <img
                src={trainer.avatar}
                alt={trainer.name}
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-slate-100 text-base font-semibold uppercase select-none text-slate-900">
                {trainer.name.trim().charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {trainer.name}
                </h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    (trainer.trainerFees?.length ?? 0) > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {trainer.trainerFees?.length ?? 0} fee
                  {(trainer.trainerFees?.length ?? 0) !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-sm text-slate-600">{trainer.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(trainer)}
            className={`cursor-pointer ${lightButtonClassName}`}
          >
            <Edit className="h-4 w-4 mr-1.5" />
            <span className="text-xs font-semibold">
              {(trainer.trainerFees?.length ?? 0) > 0
                ? "Edit Fees"
                : "Add Fees"}
            </span>
          </Button>
        </div>
      </div>

      {/* Fee Table */}
      <div className="p-6">
        {trainer.trainerFees && trainer.trainerFees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {trainer.trainerFees.map((fee, index) => (
                  <tr
                    key={fee._id}
                    className={`border-b border-black/10 transition-colors hover:bg-slate-50 ${
                      index === trainer.trainerFees!.length - 1
                        ? "border-b-0"
                        : ""
                    }`}
                  >
                    <td className="py-4 px-4">
                      <span className="font-semibold text-green-400">
                        {fee.amount.toLocaleString()} MMK
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          fee.isActive
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {fee.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleFee(trainer._id, fee._id!)}
                        disabled={!fee._id}
                        className={
                          fee.isActive
                            ? "border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700"
                            : "border-black/20 bg-white text-slate-700 hover:bg-slate-100"
                        }
                      >
                        {fee.isActive ? (
                          <>
                            <ToggleRight className="h-4 w-4 mr-1.5" />
                            <span className="text-xs font-semibold">
                              Active
                            </span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 mr-1.5" />
                            <span className="text-xs font-semibold">
                              Inactive
                            </span>
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-black/20 py-8 text-center">
            <p className="mb-3 text-slate-500">No fee items configured yet.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(trainer)}
              className={`cursor-pointer${lightButtonClassName}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fees
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
