"use client";

import { Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import type { Faq } from "@/src/types/extended-types";

interface FaqListProps {
  faqs: Faq[];
  isLoading: boolean;
  onEdit: (faq: Faq) => void;
  onDelete: (faq: Faq) => void;
  onToggle: (faq: Faq) => void;
}

export function FaqList({
  faqs,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
}: FaqListProps) {
  if (isLoading) {
    return <div className="p-6 text-center text-slate-500">Loading...</div>;
  }

  if (faqs.length === 0) {
    return <div className="p-6 text-center text-slate-500">No FAQs found</div>;
  }

  return (
    <div className="divide-y divide-black/10">
      {faqs.map((faq) => (
        <div
          key={faq._id}
          className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between"
        >
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900">{faq.question}</div>
            <div className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">
              {faq.answer}
            </div>
            <div className="mt-1">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  faq.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {faq.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggle(faq)}
              title={faq.isActive ? "Deactivate" : "Activate"}
              className="border border-black/10 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              {faq.isActive ? (
                <ToggleRight className="h-4 w-4" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(faq)}
              className="border border-black/10 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(faq)}
              className="border border-black/10 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
