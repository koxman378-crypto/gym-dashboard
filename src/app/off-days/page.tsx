"use client";

import { useState } from "react";
import { CalendarOff, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useAppSelector } from "@/src/store/hooks";
import {
  useGetOffDaysQuery,
  useCreateOffDayMutation,
  useDeleteOffDayMutation,
} from "@/src/store/services/offDaysApi";
import { useLanguage } from "@/src/components/language/LanguageContext";
import { PageLoadingState } from "@/src/components/ui/page-loading-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";

export default function OffDaysPage() {
  const { t } = useLanguage();
  const { user } = useAppSelector((state) => state.auth);
  const gymId: string | undefined = (user as any)?.gymId || undefined;

  // Pass gymId to scope results, but it's optional — all gyms shown when omitted
  const { data: offDays = [], isLoading } = useGetOffDaysQuery(gymId);

  const [createOffDay, { isLoading: isCreating }] = useCreateOffDayMutation();
  const [deleteOffDay, { isLoading: isDeleting }] = useDeleteOffDayMutation();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", note: "", daysCount: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async () => {
    const days = parseInt(form.daysCount);
    if (!form.name.trim() || !days || days < 1) return;
    try {
      const result = await createOffDay({
        ...(gymId ? { gymId } : {}),
        name: form.name.trim(),
        note: form.note.trim() || undefined,
        daysCount: days,
      }).unwrap();
      toast.success(
        `✅ "${result.name}" added. ${result.affectedCount} subscription(s) extended by ${result.daysCount} day(s).`,
      );
      setForm({ name: "", note: "", daysCount: "" });
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add off days");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("offDays.deleteConfirm"))) return;
    setDeletingId(id);
    try {
      await deleteOffDay({ id, gymId: gymId ?? "" }).unwrap();
      toast.success("Off day removed and subscriptions reversed.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to remove off day");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <PageLoadingState />;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <CalendarOff className="w-6 h-6" />
            {t("offDays.title")}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{t("offDays.subtitle")}</p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 cursor-pointer bg-gray-100"
        >
          <Plus className="w-4 h-4" />
          {t("offDays.addOffDay")}
        </Button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {offDays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <CalendarOff className="w-12 h-12 mb-3 opacity-40" />
            <p>{t("offDays.noData")}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  {t("offDays.name")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  {t("offDays.note")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-zinc-600">
                  {t("offDays.daysCount")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-zinc-600">
                  <span className="flex items-center justify-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {t("offDays.affected")}
                  </span>
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  {t("offDays.createdBy")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Date
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {offDays.map((od) => (
                <tr key={od._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-zinc-800">
                    {od.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{od.note ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium text-xs">
                      +{od.daysCount} {t("offDays.days")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-700 font-medium">
                    {od.affectedCount}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {typeof od.createdBy === "object" ? od.createdBy.name : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {new Date(od.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(od._id)}
                      disabled={isDeleting && deletingId === od._id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setForm({ name: "", note: "", daysCount: "" });
          }
          setOpen(v);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarOff className="w-5 h-5" />
              {t("offDays.addOffDay")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">
                {t("offDays.name")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. သင်္ကြန်, တန်ဆောင်တိုင်း"
                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">
                {t("offDays.daysCount")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={form.daysCount}
                placeholder="e.g. 5"
                onChange={(e) =>
                  setForm((f) => ({ ...f, daysCount: e.target.value }))
                }
                onBlur={(e) => {
                  const v = parseInt(e.target.value);
                  if (e.target.value !== "" && (!v || v < 1)) {
                    setForm((f) => ({ ...f, daysCount: "1" }));
                  }
                }}
                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-zinc-400">
                All active subscriptions will be extended by this many days.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">
                {t("offDays.note")}
              </label>
              <textarea
                value={form.note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
                placeholder="Optional note..."
                rows={3}
                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setForm({ name: "", note: "", daysCount: "" });
                setOpen(false);
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                isCreating ||
                !form.name.trim() ||
                !form.daysCount ||
                parseInt(form.daysCount) < 1
              }
            >
              {isCreating ? "Adding..." : t("offDays.addOffDay")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
