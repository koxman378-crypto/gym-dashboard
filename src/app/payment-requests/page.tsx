"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { CheckCircle, XCircle, Clock, Wallet, UserRound } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
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

const PAGE_SIZE = 20;
type StatusFilter = "" | "pending" | "approved" | "rejected";

type StatusFilterAction = { type: "set"; value: StatusFilter };

function statusFilterReducer(
  _state: StatusFilter,
  action: StatusFilterAction,
): StatusFilter {
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

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase();
}

function Avatar({ name, avatar }: { name: string; avatar?: string | null }) {
  return avatar ? (
    <img
      src={avatar}
      alt={name}
      className="h-11 w-11 rounded-2xl object-cover ring-1 ring-black/5"
    />
  ) : (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 ring-1 ring-black/5">
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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        <CheckCircle className="h-3 w-3" /> Payment Approved
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
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

function RequestRow({ request }: { request: PaymentRequest }) {
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
  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  const handleConfirm = async (note: string) => {
    if (!reviewAction) return;
    if (reviewAction === "approve") {
      console.log("[PaymentReview] approve clicked", {
        requestId: request._id,
        customerName: request.customerName,
        amount: request.amount,
        subscriptionId:
          typeof request.subscriptionId === "object"
            ? request.subscriptionId._id
            : request.subscriptionId,
        note,
      });
      const result = await approve({
        id: request._id,
        reviewNote: note || undefined,
      }).unwrap();
      console.log("[PaymentReview] approve done", result);
    } else {
      console.log("[PaymentReview] reject clicked", {
        requestId: request._id,
        customerName: request.customerName,
        amount: request.amount,
        note,
      });
      const result = await reject({
        id: request._id,
        reviewNote: note || undefined,
      }).unwrap();
      console.log("[PaymentReview] reject done", result);
    }
    setReviewAction(null);
  };

  const sub =
    typeof request.subscriptionId === "object" ? request.subscriptionId : null;

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-xl border shadow-lg border-gray-100 transition-all",
          isPending
            ? "bg-[#F8F8F8]"
            : isApproved
              ? "bg-[#F8F8F8]"
              : isRejected
                ? "bg-red-50/60"
                : "",
        )}
      >
        <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
          {/* Top row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                name={request.customerName}
                avatar={request.customerAvatar}
              />
              <div>
                <p className="font-semibold text-foreground">
                  {request.customerName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(request.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={status} />

              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full 
                  bg-linear-to-r from-orange-50 to-orange-100 
                  border border-orange-200 shadow-sm
                  dark:from-orange-950/30 dark:to-orange-900/20 dark:border-orange-800"
              >
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full 
                    bg-orange-500 text-white shadow-sm"
                >
                  <Wallet className="h-3.5 w-3.5" />
                </div>

                <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                  {request.amount.toLocaleString()} MMK
                </span>
              </div>
            </div>
          </div>

          {/* Subscription summary */}
          {sub && (
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="font-semibold text-black">
                Total: {sub.grandTotal.toLocaleString()} MMK
              </span>
              <span className="font-semibold italic text-green-500">
                Paid: {sub.paidAmount.toLocaleString()} MMK
              </span>
              <span className="text-red-400">
                Remaining: {(sub.grandTotal - sub.paidAmount).toLocaleString()}{" "}
                MMK
              </span>
            </div>
          )}

          {request.proofImage && (
            <button
              type="button"
              className="overflow-hidden rounded-2xl border border-gray-200 bg-muted/20 text-left"
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              {isPending && (
                <>
                  <Button
                    size="sm"
                    className="h-8 rounded-full bg-blue-600 px-4 hover:bg-emerald-700"
                    onClick={() => setReviewAction("approve")}
                  >
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Approve Payment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full border-red-200 px-4 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
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
      </div>

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
  const [statusFilter, dispatchStatusFilter] = useReducer(
    statusFilterReducer,
    "",
  );

  const { isOwner, selectedGymId, setSelectedGymId, branches } =
    useOwnerBranchFilter();
  const branchQuery = isOwner ? (selectedGymId ?? undefined) : undefined;

  const { data: countData } = useGetPendingCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const { data, isLoading } = useGetPaymentRequestsQuery(
    {
      page,
      limit: PAGE_SIZE,
      status: statusFilter || undefined,
      gymId: branchQuery,
    },
    { pollingInterval: 30000 },
  );

  const pendingCount = countData?.count ?? 0;
  const requests = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  useEffect(() => {
    setPage(1);
  }, [statusFilter, requests]);

  if (isLoading && requests.length === 0) {
    return <PageLoadingState headerActionCount={isOwner ? 2 : 1} />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="rounded-3xl border border-gray-100 bg-[#F8F8F8] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Wallet className="h-6 w-6 text-gray-700" />
              Payment Requests
              {pendingCount > 0 && (
                <Badge className="bg-red-500 text-white text-xs">
                  {pendingCount}
                </Badge>
              )}
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Review and approve customer payment submissions.
            </p>
          </div>

          {pendingCount > 0 && (
            <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {pendingCount} pending review
              </span>
            </div>
          )}
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
                  value: f.value as StatusFilter,
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
      {/* List */}
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
        <div>
          {requests.map((req, index) => (
            <AnimatedRequestItem key={req._id} index={index}>
              <RequestRow request={req} />
            </AnimatedRequestItem>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <DataTablePagination
          meta={{ page, limit: PAGE_SIZE, total, totalPages }}
          onPageChange={setPage}
          onPageSizeChange={() => {}}
        />
      )}
    </div>
  );
}
