"use client";

import { Edit, Trash2, User as UserIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import type { User } from "@/src/types/type";

const lightSurfaceClassName =
  "border border-black/15 bg-white text-slate-900 shadow-sm";
const lightButtonClassName =
  "border border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-sm";

interface TrainerCardProps {
  trainer: User;
  onEdit: (trainer: User) => void;
  onDelete: (trainerId: string, feeId: string) => Promise<void> | void;
}

export function TrainerCard({ trainer, onEdit, onDelete }: TrainerCardProps) {
  const currentFee = trainer.trainerFees?.[0] ?? null;

  return (
    <div
      className={`overflow-hidden rounded-2xl transition-shadow hover:shadow-md ${lightSurfaceClassName}`}
    >
      <div className="border-b border-black/10 bg-slate-50 p-6">
        <div className="flex items-start justify-between gap-4">
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
                    currentFee
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {currentFee ? "1 fee" : "No fee"}
                </span>
              </div>
              <p className="text-sm text-slate-600">{trainer.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(trainer)}
              className={`cursor-pointer ${lightButtonClassName}`}
            >
              <Edit className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-semibold">
                {currentFee ? "Edit Fee" : "Add Fee"}
              </span>
            </Button>
            {currentFee?._id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(trainer._id, currentFee._id)}
                className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 shadow-sm"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                <span className="text-xs font-semibold">Delete</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {currentFee ? (
          <div className="rounded-xl border border-black/10 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Current fee amount</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {currentFee.amount.toLocaleString()} MMK
            </p>
            <div className="mt-4">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  currentFee.isActive
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {currentFee.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-black/20 py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-slate-100 p-4">
              <UserIcon className="h-7 w-7 text-slate-500" />
            </div>
            <p className="mb-3 text-slate-500">No fee configured yet.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(trainer)}
              className={`cursor-pointer ${lightButtonClassName}`}
            >
              <Edit className="h-4 w-4 mr-2" />
              Add Fee
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
