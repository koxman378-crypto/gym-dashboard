"use client";

import React, { useRef, useState, useEffect, UIEvent } from "react";
import { motion, useInView } from "motion/react";
import { Check, Pencil, Trash2 } from "lucide-react";
import type { ExpiryPreset } from "@/src/types/extended-types";
import { DeleteAlertDialog } from "@/src/components/ui/delete-alert-dialog";

const AnimatedItem: React.FC<{ children: React.ReactNode; delay?: number; index: number }> = ({
  children, delay = 0, index,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.25, delay }}
      className="mb-4"
    >
      {children}
    </motion.div>
  );
};

interface ExpiryPresetListProps {
  presets: ExpiryPreset[];
  isLoading: boolean;
  onEdit: (preset: ExpiryPreset) => void;
  onDelete: (preset: ExpiryPreset) => void;
  onToggle: (preset: ExpiryPreset) => void;
}

export function ExpiryPresetList({
  presets,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
}: ExpiryPresetListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ExpiryPreset | null>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault(); setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, presets.length - 1));
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault(); setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [presets.length]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const el = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
    if (el) {
      const extra = 50;
      const top = el.offsetTop, bottom = top + el.offsetHeight;
      const cTop = container.scrollTop, cH = container.clientHeight;
      if (top < cTop + extra) container.scrollTo({ top: top - extra, behavior: "smooth" });
      else if (bottom > cTop + cH - extra) container.scrollTo({ top: bottom - cH + extra, behavior: "smooth" });
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (presets.length === 0) return <div className="p-6 text-center text-muted-foreground">No expiry presets found</div>;

  return (
    <>
      <div className="relative w-full">
        <div
          ref={listRef}
          className="max-h-150 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-border"
          onScroll={handleScroll}
          style={{ scrollbarWidth: "thin" }}
        >
          {presets.map((preset, index) => (
            <AnimatedItem key={preset._id} delay={0.05} index={index}>
              <div
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => setSelectedIndex(index)}
                className={`cursor-pointer rounded-xl border p-4 transition-colors duration-150 ${
                  selectedIndex === index
                    ? "border-gray-300 bg-gray-100"
                    : "border-gray-200 bg-[#F5F5F5]"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">{preset.label}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {preset.days} {preset.days === 1 ? "day" : "days"}
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          preset.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {preset.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(preset);
                      }}
                      className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 transition-all duration-150 hover:bg-gray-100 active:scale-95"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(preset);
                      }}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all duration-150 active:scale-95 ${
                        preset.isActive
                          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {preset.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(preset);
                      }}
                      className="flex cursor-pointer items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 transition-all duration-150 hover:bg-red-100 active:scale-95"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </div>
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-12.5 bg-linear-to-b from-[#FCFCFC] to-transparent transition-opacity duration-300" style={{ opacity: topGradientOpacity }} />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-25 bg-linear-to-t from-[#FCFCFC] to-transparent transition-opacity duration-300" style={{ opacity: bottomGradientOpacity }} />
      </div>

      <DeleteAlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete Expiry Preset"
        description={
          pendingDelete
            ? `Are you sure you want to delete the preset "${pendingDelete.label}"? This action cannot be undone.`
            : "Are you sure you want to delete this expiry preset? This action cannot be undone."
        }
        onConfirm={() => {
          if (pendingDelete) {
            onDelete(pendingDelete);
            setPendingDelete(null);
          }
        }}
      />
    </>
  );
}


