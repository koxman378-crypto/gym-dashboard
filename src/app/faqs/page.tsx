"use client";

import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useToggleFaqMutation,
  useDeleteFaqMutation,
} from "@/src/store/services/faqsApi";
import type { Faq } from "@/src/types/extended-types";
import { FaqFormDialog } from "@/src/components/faqs/FaqFormDialog";
import { FaqList } from "@/src/components/faqs/FaqList";
import { useFaqsState } from "@/src/store/hooks/useFaqsState";

const lightSurfaceClassName =
  "border border-black/15 bg-white text-slate-900 shadow-sm";
const lightButtonClassName =
  "border border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-sm";

export default function FaqsPage() {
  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedFaqId,
    formData,
    openCreateDialog,
    openEditDialog,
    closeCreateDialog,
    closeEditDialog,
    setFormData,
  } = useFaqsState();

  const { data: faqs = [], isLoading } = useGetFaqsQuery({});
  const selectedFaq = faqs.find((f) => f._id === selectedFaqId) ?? null;

  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [toggleFaq] = useToggleFaqMutation();
  const [deleteFaq] = useDeleteFaqMutation();

  const handleCreate = async () => {
    try {
      await createFaq({
        question: formData.question.trim(),
        answer: formData.answer.trim(),
      }).unwrap();
      closeCreateDialog();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to create FAQ");
    }
  };

  const handleUpdate = async () => {
    if (!selectedFaq?._id) return;
    try {
      await updateFaq({
        id: selectedFaq._id,
        data: {
          question: formData.question.trim(),
          answer: formData.answer.trim(),
        },
      }).unwrap();
      closeEditDialog();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to update FAQ");
    }
  };

  const handleDelete = async (faq: Faq) => {
    if (!faq._id || !confirm(`Delete this FAQ?\n\n"${faq.question}"`)) return;
    try {
      await deleteFaq(faq._id).unwrap();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to delete FAQ");
    }
  };

  const handleToggle = async (faq: Faq) => {
    if (!faq._id) return;
    try {
      await toggleFaq(faq._id).unwrap();
    } catch (error: any) {
      alert(error?.data?.message || "Failed to toggle FAQ");
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 text-slate-900">
      <div
        className={`mb-6 flex items-center justify-between rounded-2xl p-6 ${lightSurfaceClassName}`}
      >
        <div>
          <h1 className="text-3xl font-bold">FAQs</h1>
          <p className="mt-1 text-slate-600">
            Manage frequently asked questions displayed to gym members.
          </p>
        </div>
        <Button
          onClick={() => openCreateDialog()}
          className={`cursor-pointer px-6 py-6 text-base font-semibold ${lightButtonClassName}`}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <div className={`rounded-2xl ${lightSurfaceClassName}`}>
        <FaqList
          faqs={faqs}
          isLoading={isLoading}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      </div>

      <FaqFormDialog
        open={isCreateDialogOpen || isEditDialogOpen}
        isEdit={isEditDialogOpen}
        formData={formData}
        isLoading={isCreating || isUpdating}
        onOpenChange={(open) => {
          if (!open) {
            if (isEditDialogOpen) closeEditDialog();
            else closeCreateDialog();
          }
        }}
        onChange={setFormData}
        onSubmit={isEditDialogOpen ? handleUpdate : handleCreate}
      />
    </div>
  );
}
