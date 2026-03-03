"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { useGetCustomerHistoryQuery } from "@/src/store/services/subscriptionsApi";
import { Subscription } from "@/src/types/extended-types";
import { Calendar, Package, DollarSign, User, Clock } from "lucide-react";
// import Link from "next/link"; // Uncomment when detail page is ready
// import { ExternalLink } from "lucide-react"; // Uncomment when detail page is ready

interface SubscriptionHistoryDialogProps {
  customerId: string | null;
  customerName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionHistoryDialog({
  customerId,
  customerName,
  isOpen,
  onClose,
}: SubscriptionHistoryDialogProps) {
  const {
    data: history = [],
    isLoading,
    error,
  } = useGetCustomerHistoryQuery(customerId!, {
    skip: !customerId || !isOpen,
  });

  const getStatusBadge = (subscription: Subscription) => {
    switch (subscription.status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            Active
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
            Expired
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{subscription.status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
            Pending
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            Partial
          </Badge>
        );
      default:
        return <Badge>{paymentStatus}</Badge>;
    }
  };

  const formatDate = (date: string | Date) => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Subscription History
          </DialogTitle>
          <DialogDescription>
            {customerName && `Purchase history for ${customerName}`}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-600 dark:text-slate-400">
              Loading history...
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-16 w-16 text-red-300 dark:text-red-700 mb-4" />
            <p className="text-red-600 dark:text-red-400">
              Error loading subscription history
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {error && typeof error === "object" && "data" in error
                ? String((error as any).data?.message || "Unknown error")
                : "Failed to load data"}
            </p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              No subscription history found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((subscription) => (
              <div
                key={subscription._id}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                      <Calendar className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(subscription)}
                        {getPaymentStatusBadge(subscription.paymentStatus)}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Purchased on{" "}
                        {formatDate(
                          subscription.createdAt || subscription.startDate,
                        )}
                      </p>
                    </div>
                  </div>
                  {/* Uncomment when subscription details page is ready
                  <Link href={`/subscriptions/${subscription._id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-slate-100 dark:hover:bg-slate-900"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  */}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dates */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Period:
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {formatDate(subscription.startDate)} -{" "}
                        {formatDate(subscription.endDate)}
                      </span>
                    </div>

                    {/* Trainer */}
                    {subscription.trainer && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          Trainer:
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {subscription.trainer.trainerName || "N/A"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Total:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {subscription.grandTotal.toLocaleString()} MMK
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Paid:
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {subscription.paidAmount.toLocaleString()} MMK
                      </span>
                    </div>
                  </div>
                </div>

                {/* Package Details */}
                {subscription.gymPriceGroup && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Gym Package: {subscription.gymPriceGroup.groupName}
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 dark:bg-slate-900"
                    >
                      {subscription.gymPriceGroup.selectedPrice.duration}{" "}
                      {subscription.gymPriceGroup.selectedPrice.durationUnit} -{" "}
                      {subscription.gymPriceGroup.selectedPrice.finalPrice.toLocaleString()}{" "}
                      MMK
                    </Badge>
                  </div>
                )}

                {/* Other Services */}
                {subscription.otherServiceGroups &&
                  subscription.otherServiceGroups.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        Additional Services:
                      </p>
                      <div className="space-y-2">
                        {subscription.otherServiceGroups.map(
                          (serviceGroup, idx) => (
                            <div key={idx} className="ml-4">
                              <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
                                {serviceGroup.groupName}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {serviceGroup.selectedServices.map(
                                  (service) => (
                                    <Badge
                                      key={service.serviceRowId}
                                      variant="outline"
                                      className="bg-slate-50 dark:bg-slate-900"
                                    >
                                      {service.name} -{" "}
                                      {service.finalPrice.toLocaleString()} MMK
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* Notes */}
                {subscription.notes && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Notes:</span>{" "}
                      {subscription.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
