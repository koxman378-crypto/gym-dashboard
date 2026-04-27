"use client";

import { useState } from "react";
import { Pencil, Trash2, User as UserIcon } from "lucide-react";
import type { User } from "@/src/types/type";
import { DeleteAlertDialog } from "@/src/components/ui/delete-alert-dialog";

const lightSurfaceClassName =
  "border border-gray-100 bg-white text-foreground shadow-sm";

interface TrainerCardProps {
  trainer: User;
  onEdit: (trainer: User) => void;
  onDelete: (trainerId: string, feeId: string) => Promise<void> | void;
}

export function TrainerCard({ trainer, onEdit, onDelete }: TrainerCardProps) {
  const currentFee = trainer.trainerFees?.[0] ?? null;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!currentFee?._id) return;
    setIsDeleting(true);
    try {
      await onDelete(trainer._id, currentFee._id);
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <div className={`overflow-hidden rounded-2xl transition-shadow hover:shadow-md ${lightSurfaceClassName}`}>
        <div className="border-b border-gray-100 bg-gray-50 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {trainer.avatar ? (
                <img
                  src={trainer.avatar}
                  alt={trainer.name}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                  <UserIcon className="h-5 w-5" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{trainer.name}</h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    currentFee ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-foreground"}`}>
                    {currentFee ? "1 fee" : "No fee"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{trainer.email}</p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button type="button" onClick={() => onEdit(trainer)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 transition-all duration-150 hover:bg-gray-100 active:scale-95">
                <Pencil className="h-3.5 w-3.5" />
                {currentFee ? "Edit Fee" : "Add Fee"}
              </button>
              {currentFee?._id && (
                <button type="button" onClick={() => setDeleteOpen(true)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 transition-all duration-150 hover:bg-red-100 active:scale-95">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {currentFee ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
              <p className="text-sm text-muted-foreground">Current fee amount</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {currentFee.amount.toLocaleString()} MMK
              </p>
              <div className="mt-4">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  currentFee.isActive ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-foreground"}`}>
                  {currentFee.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-gray-50 p-4">
                <UserIcon className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mb-3 text-muted-foreground">No fee configured yet.</p>
              <button type="button" onClick={() => onEdit(trainer)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 transition-all duration-150 hover:bg-gray-100 active:scale-95 mx-auto">
                <Pencil className="h-3.5 w-3.5" />
                Add Fee
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        isLoading={isDeleting}
        title="Delete Trainer Fee"
        description={`Are you sure you want to delete the fee for "${trainer.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
