"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./button";

interface DeleteAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function DeleteAlertDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  title = "Delete Item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}: DeleteAlertDialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange, isLoading]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/20"
            onClick={() => { if (!isLoading) onOpenChange(false); }}
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ scale: 0.96, opacity: 0, y: 6 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 6 }}
            transition={{ type: "spring", stiffness: 380, damping: 30, duration: 0.2 }}
            className="relative z-10 mx-4 w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Trash2 className="h-5 w-5 text-gray-500" />
                </div>
              </div>

              {/* Text */}
              <div className="text-center">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  {description}
                </p>
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-gray-100" />

              {/* Actions */}
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-gray-200 bg-[#F5F5F5] px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-200 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      {confirmLabel}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
