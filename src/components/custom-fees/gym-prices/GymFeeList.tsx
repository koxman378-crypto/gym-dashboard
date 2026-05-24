"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Check, Pencil, Trash2 } from "lucide-react";
import type { GymFeeRecord } from "@/src/types/extended-types";
import { DeleteAlertDialog } from "@/src/components/ui/delete-alert-dialog";
import { useAnimatedListState } from "@/src/store/hooks/useAnimatedListState";

const AnimatedItem: React.FC<{
  children: React.ReactNode;
  delay?: number;
  index: number;
}> = ({ children, delay = 0, index }) => {
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

interface GymFeeListProps {
  fees: GymFeeRecord[];
  isLoading: boolean;
  onEdit: (fee: GymFeeRecord) => void;
  onDelete: (fee: GymFeeRecord) => void;
  onToggle: (fee: GymFeeRecord) => void;
}

export function GymFeeList({
  fees,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
}: GymFeeListProps) {
  // Filter state: 'all', 'days', 'months', 'years'
  const [filter, setFilter] = useState<'all' | 'days' | 'months' | 'years'>('all');
  const { listRef, state, dispatch, handleScroll } =
    useAnimatedListState<GymFeeRecord>(fees.length);
  const {
    selectedIndex,
    topGradientOpacity,
    bottomGradientOpacity,
    pendingDelete,
  } = state;

  // Filtered fees
  const filteredFees = filter === 'all' ? fees : fees.filter(fee => fee.durationUnit === filter);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-gray-100 bg-[#FCFCFC] px-4 py-4 shadow-sm"
          >
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="h-2.5 w-1/2 animate-pulse rounded bg-gray-100" />
              <div className="h-2.5 w-1/4 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-16 animate-pulse rounded-full bg-gray-100" />
              <div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" />
              <div className="h-7 w-16 animate-pulse rounded-full bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (fees.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-[#FCFCFC] px-6 py-14 text-center shadow-sm">
        <p className="text-sm font-medium text-gray-400">No gym fees found</p>
      </div>
    );
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <span className="font-medium text-sm mr-2">Filter:</span>
        <button
          className={`px-3 py-1 rounded-full border text-sm transition-all ${filter === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`px-3 py-1 rounded-full border text-sm transition-all ${filter === 'days' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
          onClick={() => setFilter('days')}
        >
          Days
        </button>
        <button
          className={`px-3 py-1 rounded-full border text-sm transition-all ${filter === 'months' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
          onClick={() => setFilter('months')}
        >
          Months
        </button>
        <button
          className={`px-3 py-1 rounded-full border text-sm transition-all ${filter === 'years' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
          onClick={() => setFilter('years')}
        >
          Years
        </button>
      </div>

      <div className="relative w-full">
        <div
          ref={listRef}
          className="max-h-150 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-border"
          onScroll={handleScroll}
          style={{ scrollbarWidth: "thin" }}
        >
          {filteredFees.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-[#FCFCFC] px-6 py-14 text-center shadow-sm">
              <p className="text-sm font-medium text-gray-400">No gym fees found for this filter</p>
            </div>
          ) : (
            filteredFees.map((fee, index) => (
              <AnimatedItem key={fee._id} delay={0.05} index={index}>
                <div
                  onMouseEnter={() =>
                    dispatch({ type: "selectIndex", payload: index })
                  }
                  onClick={() =>
                    dispatch({ type: "selectIndex", payload: index })
                  }
                  className={`cursor-pointer rounded-xl border p-4 transition-colors duration-150 ${
                    selectedIndex === index
                      ? "border-gray-300 bg-gray-100"
                      : "border-gray-200 bg-[#F5F5F5]"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">
                        {fee.name}
                      </div>
                      <div className="text-sm text-emerald-600">
                        {fee.amount.toLocaleString()} MMK · {fee.duration}{" "}
                        {fee.durationUnit}
                      </div>
                      <div className="text-xs italic text-muted-foreground">
                        {fee.promotionType && fee.promotionValue !== null
                          ? fee.promotionType === "percentage"
                            ? `${fee.promotionValue}% off`
                            : `${Number(fee.promotionValue).toLocaleString()} MMK off`
                          : "No promotion"}
                      </div>
                      {/* Total Amount Row */}
                      <div className="text-xs font-semibold text-indigo-700">
                        Total:{" "}
                        {(() => {
                          const amount =
                            typeof fee.amount === "number" ? fee.amount : 0;
                          const promoValue =
                            typeof fee.promotionValue === "number"
                              ? fee.promotionValue
                              : 0;
                          let total = amount;
                          if (
                            fee.promotionType === "percentage" &&
                            promoValue > 0
                          ) {
                            total = amount - (amount * promoValue) / 100;
                          } else if (
                            fee.promotionType === "mmk" &&
                            promoValue > 0
                          ) {
                            total = Math.max(amount - promoValue, 0);
                          }
                          return total.toLocaleString();
                        })()} {" "}
                        MMK
                      </div>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          fee.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {fee.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(fee);
                        }}
                        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 transition-all duration-150 hover:bg-gray-100 active:scale-95"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggle(fee);
                        }}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all duration-150 active:scale-95 ${
                          fee.isActive
                            ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />{" "}
                        {fee.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: "setPendingDelete", payload: fee });
                        }}
                        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 transition-all duration-150 hover:bg-red-100 active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedItem>
            ))
          )}
        </div>
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 h-12.5 bg-linear-to-b from-[#FCFCFC] to-transparent transition-opacity duration-300"
          style={{ opacity: topGradientOpacity }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-25 bg-linear-to-t from-[#FCFCFC] to-transparent transition-opacity duration-300"
          style={{ opacity: bottomGradientOpacity }}
        />
      </div>

      <DeleteAlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: "setPendingDelete", payload: null });
        }}
        title="Delete Gym Fee"
        description={
          pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this gym fee?"
        }
        onConfirm={() => {
          if (pendingDelete) {
            onDelete(pendingDelete);
            dispatch({ type: "setPendingDelete", payload: null });
          }
        }}
      />
    </>
  );
}
