"use client";

import { useReducer, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import {
  CheckCircle,
  Clock,
  Sparkles,
  UserRound,
  Wallet,
  XCircle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { useAppSelector } from "@/src/store/hooks";
import {
  Role,
  type PaymentRequestStatusFilter,
  type PaymentRequestStatusFilterAction,
} from "@/src/types/type";
import {
  useGetPaymentRequestsQuery,
  useGetPendingCountQuery,
  useApprovePaymentRequestMutation,
  useRejectPaymentRequestMutation,
  useGetImageViewUrlQuery,
  type PaymentRequest,
} from "@/src/store/services/paymentRequestsApi";
import { DataTablePagination } from "@/src/components/data-table/data-table-pagination";
import { useOwnerBranchFilter } from "@/src/components/layout/OwnerBranchFilterContext";
import { PageLoadingState } from "@/src/components/ui/page-loading-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

const DEFAULT_PAGE_SIZE = 12;
function statusFilterReducer(
  _state: PaymentRequestStatusFilter,
  action: PaymentRequestStatusFilterAction,
): PaymentRequestStatusFilter {
  if (action.type === "set") return action.value;
  return "";
}

function AnimatedRequestItem({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: false });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="mb-3 last:mb-0"
    >
      {children}
    </motion.div>
  );
}

function Avatar({ name, avatar }: { name: string; avatar?: string | null }) {
  const safeAvatar = avatar ?? "";
  const { data } = useGetImageViewUrlQuery(safeAvatar, {
    skip: !safeAvatar,
  });
  const avatarSrc = data?.viewUrl ?? safeAvatar;

  return avatarSrc ? (
    <img
      src={avatarSrc}
      alt={name}
      className="h-12 w-12 rounded-2xl object-cover ring-1 ring-black/5"
      referrerPolicy="no-referrer"
    />
  ) : (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 ring-1 ring-black/5">
      <UserRound className="h-5 w-5" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
        <Clock className="h-3 w-3" /> Payment Submitted
      </span>
    );
  if (normalized === "approved")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-2.5 py-1 text-xs h-7 font-semibold text-white">
        <CheckCircle className="h-3 w-3" /> Payment Approved
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-xs h-7 font-semibold text-white">
      <XCircle className="h-3 w-3" /> Payment Rejected
    </span>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReviewModal({
  request,
  action,
  onConfirm,
  onCancel,
  loading,
}: {
  request: PaymentRequest;
  action: "approve" | "reject";
  onConfirm: (note: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl">
        <div className="mb-5 flex items-start gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
              action === "approve"
                ? "bg-emerald-100 dark:bg-blue-900/30"
                : "bg-red-100 dark:bg-red-900/30",
            )}
          >
            {action === "approve" ? (
              <CheckCircle className="h-6 w-6 text-blue-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {action === "approve" ? "Approve Payment" : "Reject Payment"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {action === "approve"
                ? `Confirm ${request.amount.toLocaleString()} MMK from ${request.customerName}`
                : `Reject payment request from ${request.customerName}`}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Review note (optional)
          </label>
          <textarea
            className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
            placeholder={
              action === "approve"
                ? "e.g. Payment confirmed via KBZPay"
                : "e.g. Proof image unclear, please resubmit"
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className={cn(
              "flex-1 rounded-full",
              action === "approve"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700",
            )}
            onClick={() => onConfirm(note)}
            disabled={loading}
          >
            {loading
              ? "Processing…"
              : action === "approve"
                ? "Approve"
                : "Reject"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RequestRow({
  request,
  canReview,
}: {
  request: PaymentRequest;
  canReview: boolean;
}) {
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
    null,
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  const [approve, { isLoading: approving }] =
    useApprovePaymentRequestMutation();
  const [reject, { isLoading: rejecting }] = useRejectPaymentRequestMutation();

  // Fetch presigned view URL so private S3 objects can render in the dashboard.
  const { data: viewUrlData, isFetching: fetchingViewUrl } =
    useGetImageViewUrlQuery(request.proofImage ?? "", {
      skip: !request.proofImage,
    });
  const proofSrc = viewUrlData?.viewUrl ?? request.proofImage ?? undefined;

  const status = request.status.trim().toLowerCase();
  const isPending = status === "pending";

  const handleConfirm = async (note: string) => {
    if (!reviewAction) return;
    if (reviewAction === "approve") {
      await approve({
        id: request._id,
        reviewNote: note || undefined,
      }).unwrap();
    } else {
      await reject({
        id: request._id,
        reviewNote: note || undefined,
      }).unwrap();
    }
    setReviewAction(null);
  };

  const sub =
    typeof request.subscriptionId === "object" ? request.subscriptionId : null;

  return (
    <>
      <article className="overflow-hidden rounded-[1.7rem] border border-gray-100 bg-white shadow-sm shadow-gray-100/80 transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
          {/* Top row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                name={request.customerName}
                avatar={request.customerAvatar}
              />
              <div>
                <p className="text-base font-semibold text-foreground">
                  {request.customerName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {request.customerEmail}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(request.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={status} />
            </div>
          </div>

          {/* Subscription summary */}
          {sub && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl italic px-4 py-3 text-sm">
              <p className="font-semibold text-gray-900">
                Total:{" "}
                <span className="font-bold">
                  {sub.grandTotal.toLocaleString()} MMK
                </span>
              </p>
              <p className="font-semibold text-red-700">
                Remaining:{" "}
                <span className="font-bold">
                  {(sub.grandTotal - sub.paidAmount).toLocaleString()} MMK
                </span>
              </p>
              <p className="font-semibold text-green-500">
                Paid:{" "}
                <span className="font-bold">
                  {sub.paidAmount.toLocaleString()} MMK
                </span>
              </p>
            </div>
          )}

          {request.proofImage && (
            <button
              type="button"
              className="overflow-hidden rounded-2xl border border-gray-200 bg-[#fcfcf9] text-left"
              onClick={() => {
                if (proofSrc) setPreviewOpen(true);
              }}
              disabled={fetchingViewUrl && !proofSrc}
            >
              <div className="px-3 py-2">
                <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  Payment Proof
                </span>
                {request.note && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Customer&apos;s Note: &ldquo;{request.note}&rdquo;
                  </p>
                )}
                {request.reviewNote && (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Your Note: {request.reviewNote}
                  </span>
                )}
              </div>
              <div className="rounded-b-2xl bg-black/5 dark:bg-black/10">
                {proofSrc ? (
                  <img
                    src={proofSrc}
                    alt="Payment proof"
                    className="max-h-56 w-full cursor-pointer object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex min-h-40 w-full items-center justify-center px-4 py-8 text-sm text-muted-foreground">
                    Proof image is loading or unavailable.
                  </div>
                )}
              </div>
            </button>
          )}

          {/* Actions row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <div className="text-xs font-medium text-gray-500">
              {canReview
                ? "Review this request or inspect the uploaded proof."
                : "History only view. Open the proof image to inspect details."}
            </div>
            <div className="flex gap-2">
              {isPending && canReview && (
                <>
                  <Button
                    size="sm"
                    className="h-9 rounded-full bg-emerald-600 px-4 hover:bg-emerald-700"
                    onClick={() => setReviewAction("approve")}
                  >
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Approve Payment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-full border-red-200 px-4 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                    onClick={() => setReviewAction("reject")}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    Reject Payment
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </article>

      {previewOpen && proofSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </button>
            <img
              src={proofSrc}
              alt="Payment proof preview"
              className="max-h-[90vh] w-full object-contain"
            />
          </div>
        </div>
      )}

      {reviewAction && (
        <ReviewModal
          request={request}
          action={reviewAction}
          onConfirm={handleConfirm}
          onCancel={() => setReviewAction(null)}
          loading={approving || rejecting}
        />
      )}
    </>
  );
}

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export default function PaymentRequestsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [statusFilter, dispatchStatusFilter] = useReducer(
    statusFilterReducer,
    "",
  );
  const user = useAppSelector((state) => state.auth.user);
  const canReview = user?.role === Role.OWNER;

  const { isOwner, selectedGymId, setSelectedGymId, branches } =
    useOwnerBranchFilter();
  const branchQuery = isOwner ? (selectedGymId ?? undefined) : undefined;

  const { data: countData } = useGetPendingCountQuery(undefined, {
    pollingInterval: 30000,
    skip: !canReview,
  });
  const { data, isLoading } = useGetPaymentRequestsQuery(
    {
      page,
      limit: pageSize,
      status: statusFilter || undefined,
      gymId: branchQuery,
    },
    { pollingInterval: 30000 },
  );

  const pendingCount = countData?.count ?? 0;
  const requests = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const rangeStart = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(page * pageSize, total);

  if (isLoading && requests.length === 0) {
    return <PageLoadingState headerActionCount={isOwner ? 2 : 1} />;
  }

  return (
    <div className="space-y-6 p-6">
      <section className="overflow-hidden rounded-[1.9rem] border border-gray-100 bg-white shadow-sm shadow-gray-100/70">
        <div className="border-b border-gray-100 bg-[radial-gradient(circle_at_top_left,rgba(254,240,138,0.22),transparent_35%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_28%),#fcfcf9] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700 shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                History Board
              </div>
              <h1 className="mt-3 flex items-center gap-2 text-2xl font-black text-gray-900 sm:text-3xl">
                <Wallet className="h-6 w-6 text-gray-700" />
                Payment Requests
                {pendingCount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs">
                    {pendingCount}
                  </Badge>
                )}
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {canReview
                  ? "Review and approve customer payment submissions."
                  : "View customer payment request history."}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {isOwner && branches.length > 0 && (
              <Select
                value={selectedGymId ?? "all"}
                onValueChange={(v) => {
                  setSelectedGymId(v === "all" ? null : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-44 rounded-full border border-gray-100 bg-white text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                  <SelectValue placeholder="All Gyms" />
                </SelectTrigger>

                <SelectContent className="z-50 bg-white border border-gray-100 shadow-md rounded-xl">
                  <SelectItem
                    value="all"
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    All Gyms
                  </SelectItem>
                  {branches.map((b) => (
                    <SelectItem
                      key={b._id}
                      value={b._id!}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-all border cursor-pointer",
                  statusFilter === f.value
                    ? "bg-white text-gray-900 border-gray-200 shadow-sm"
                    : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50",
                )}
                onClick={() => {
                  dispatchStatusFilter({
                    type: "set",
                    value: f.value as PaymentRequestStatusFilter,
                  });
                  setPage(1);
                }}
              >
                {f.label}

                {f.value === "pending" && pendingCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-semibold text-white">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="rounded-3xl border border-border/70 bg-background px-6 py-16 text-center text-sm text-muted-foreground shadow-sm">
              Loading payment requests…
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-background px-6 py-16 text-center text-sm text-muted-foreground">
              {statusFilter === "pending"
                ? "No pending payment requests. You&apos;re all caught up!"
                : "No payment requests found."}
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req, index) => (
                <AnimatedRequestItem key={req._id} index={index}>
                  <RequestRow request={req} canReview={canReview} />
                </AnimatedRequestItem>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 rounded-3xl border border-gray-100 bg-[#fafaf6] p-3 shadow-inner shadow-white/60">
              <DataTablePagination
                meta={{ page, limit: pageSize, total, totalPages }}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                tone="light"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string;
  value: string;
  caption?: string;
  tone?: "default" | "accent" | "warning";
}) {
  const toneClass =
    tone === "accent"
      ? "border-emerald-100 bg-emerald-50"
      : tone === "warning"
        ? "border-amber-100 bg-amber-50"
        : "border-gray-100 bg-white/90";

  return (
    <div className={`min-w-35 rounded-2xl border px-4 py-3 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-base font-bold text-gray-900">{value}</p>
      {caption ? <p className="mt-1 text-xs text-gray-500">{caption}</p> : null}
    </div>
  );
}
