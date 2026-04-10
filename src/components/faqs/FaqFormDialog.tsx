"use client";

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
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import type { FaqFormState } from "@/src/store/slices/faqsSlice";

const lightDialogContentClassName =
  "border border-black/15 bg-white text-slate-900 shadow-2xl ring-black/10";
const lightInputClassName =
  "border-black/20 bg-white text-slate-900 placeholder:text-slate-500 hover:border-black/40 focus-visible:border-slate-900 focus-visible:ring-black/10";
const lightButtonClassName =
  "border border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-sm";

interface FaqFormDialogProps {
  open: boolean;
  isEdit: boolean;
  formData: FaqFormState;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (data: Partial<FaqFormState>) => void;
  onSubmit: () => void;
}

export function FaqFormDialog({
  open,
  isEdit,
  formData,
  isLoading,
  onOpenChange,
  onChange,
  onSubmit,
}: FaqFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={lightDialogContentClassName}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the FAQ question and answer."
              : "Create a new frequently asked question."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="faq-question" className="text-slate-900">
              Question
            </Label>
            <Input
              id="faq-question"
              value={formData.question}
              onChange={(e) => onChange({ question: e.target.value })}
              placeholder="Enter the question..."
              className={lightInputClassName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faq-answer" className="text-slate-900">
              Answer
            </Label>
            <Textarea
              id="faq-answer"
              value={formData.answer}
              onChange={(e) => onChange({ answer: e.target.value })}
              placeholder="Enter the answer..."
              rows={5}
              className={lightInputClassName}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={lightButtonClassName}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isLoading || !formData.question.trim() || !formData.answer.trim()
            }
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            {isLoading ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
