"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { ComponentProps } from "react";
import {
  ArrowLeft,
  User,
  Calendar,
  Package,
  Activity,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { SubscriptionDetailsDialog } from "@/src/components/subscriptions/SubscriptionDetailsDialog";
import { useGetCustomerHistoryQuery } from "@/src/store/services/subscriptionsApi";
import { Subscription } from "@/src/types/extended-types";
import { Separator } from "@/src/components/ui/seperator";

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>;

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, BadgeVariant> = {
    active: "active",
    expired: "inactive",
    cancelled: "destructive",
    pending: "warning",
  };
  return (
    <Badge variant={variants[status] || "secondary"}>
      {status.toUpperCase()}
    </Badge>
  );
};

const PaymentBadge = ({ status }: { status: string }) => {
  const variants: Record<string, BadgeVariant> = {
    paid: "success",
    pending: "warning",
    partial: "warning",
    unpaid: "destructive",
  };
  return (
    <Badge variant={variants[status] || "secondary"}>
      {status.toUpperCase()}
    </Badge>
  );
};

const lightSurfaceClassName =
  "border border-gray-200 bg-slate-50/90 shadow-sm text-card-foreground";
const gymInnerCardClassName =
  "rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-foreground shadow-sm";
const serviceInnerCardClassName =
  "rounded-xl border border-violet-200 bg-violet-50/80 p-3 text-foreground shadow-sm";
const trainerInnerCardClassName =
  "rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-foreground shadow-sm";
const lightButtonClassName =
  "border border-gray-200 bg-white text-foreground hover:bg-gray-50 hover:text-foreground shadow-sm";

interface SubscriptionCardProps {
  subscription: Subscription;
  onViewDetails: (subscription: Subscription) => void;
}

const SubscriptionCard = ({
  subscription,
  onViewDetails,
}: SubscriptionCardProps) => {
  const gymPrice = subscription.gymPriceGroup;
  const servicesCount =
    subscription.otherServiceGroups?.reduce(
      (acc, group) => acc + (group.selectedServices?.length || 0),
      0,
    ) || 0;

  const isExpired = new Date(subscription.endDate) < new Date();

  return (
    <div
      className={`rounded-2xl p-6 transition-shadow hover:shadow-lg ${lightSurfaceClassName}`}
    >
      {/* Header with ID and Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-muted-foreground">
            #{subscription._id.slice(-8).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={subscription.status} />
          <PaymentBadge status={subscription.paymentStatus} />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Subscription Package Details */}
      <div className="space-y-4">
        {/* Gym Package */}
        {gymPrice && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Package className="h-4 w-4" />
              Gym Package
            </div>
            <div className={gymInnerCardClassName}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-black/80">
                    {gymPrice.groupName}
                  </div>
                  <div className="text-sm text-slate-500">
                    {gymPrice.selectedPrice.duration}{" "}
                    {gymPrice.selectedPrice.durationUnit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-emerald-700">
                    {gymPrice.selectedPrice.finalPrice.toLocaleString()} MMK
                  </div>
                  {gymPrice.selectedPrice.promotionType &&
                    gymPrice.selectedPrice.promotionValue && (
                      <div className="text-xs font-medium text-orange-700">
                        {gymPrice.selectedPrice.promotionType === "percentage"
                          ? `${gymPrice.selectedPrice.promotionValue}% off`
                          : `${Number(gymPrice.selectedPrice.promotionValue).toLocaleString()} MMK off`}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Services */}
        {servicesCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Package className="h-4 w-4" />
              Additional Services ({servicesCount})
            </div>
            <div className={serviceInnerCardClassName}>
              <div className="text-sm font-semibold text-black/80">
                {Number(subscription.otherServiceTotal ?? 0).toLocaleString()}{" "}
                MMK
              </div>
            </div>
          </div>
        )}

        {/* Trainer */}
        {subscription.trainer && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="h-4 w-4" />
              Trainer
            </div>
            <div className={trainerInnerCardClassName}>
              <div className="flex justify-between">
                <div className="text-sm font-medium text-emerald-700">
                  {subscription.trainer.trainerName}
                </div>
                <div className="text-sm font-semibold text-emerald-700">
                  {Number(
                    subscription.trainer.finalPrice ?? 0,
                  ).toLocaleString()}{" "}
                  MMK
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Date Range */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(subscription.startDate)}</span>
          </div>
          <span className="text-muted-foreground">→</span>
          <div
            className={`flex items-center gap-2 ${isExpired ? "text-zinc-700" : "text-muted-foreground"}`}
          >
            <Calendar className="h-4 w-4" />
            <span>{formatDate(subscription.endDate)}</span>
          </div>
        </div>

        <Separator />

        {/* Payment Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Grand Total:</span>
            <span className="text-lg font-bold text-emerald-700">
              {Number(subscription.grandTotal ?? 0).toLocaleString()} MMK
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Paid Amount:</span>
            <span className="text-sm font-semibold text-green-500">
              {Number(subscription.paidAmount ?? 0).toLocaleString()} MMK
            </span>
          </div>
          {subscription.paidAmount < subscription.grandTotal && (
            <div className="flex items-center justify-between text-red-600">
              <span className="text-sm font-medium">Outstanding:</span>
              <span className="text-sm font-semibold">
                {(
                  Number(subscription.grandTotal ?? 0) -
                  Number(subscription.paidAmount ?? 0)
                ).toLocaleString()}{" "}
                MMK
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <Button
          onClick={() => onViewDetails(subscription)}
          variant="outline"
          className={`mt-4 w-full cursor-pointer ${lightButtonClassName}`}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Full Details
        </Button>
      </div>
    </div>
  );
};

export default function CustomerSubscriptionsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Fetch subscription history for this customer
  const {
    data: subscriptions = [],
    isLoading,
    error,
  } = useGetCustomerHistoryQuery(customerId, {
    skip: !customerId,
  });

  const handleViewDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsDialogOpen(false);
    setSelectedSubscription(null);
  };

  const customer = subscriptions?.[0]?.customer;
  const customerData = typeof customer === "object" ? customer : null;

  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className={`mb-4 cursor-pointer ${lightButtonClassName}`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="mb-2 h-8 w-64 rounded bg-zinc-200"></div>
              <div className="h-4 w-48 rounded bg-zinc-200"></div>
            </div>
          ) : customerData ? (
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">
                {customerData.name}&apos;s Subscriptions
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{customerData.email}</span>
                {customerData.phone && (
                  <>
                    <span>•</span>
                    <span>{customerData.phone}</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <h1 className="text-3xl font-bold text-foreground">
              Customer Subscriptions
            </h1>
          )}
        </div>

        {/* Subscription Count */}
        {!isLoading && subscriptions && subscriptions.length > 0 && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-700">
              <Activity className="h-4 w-4" />
              <span className="font-semibold">{subscriptions.length}</span>
              <span>
                Total Subscription{subscriptions.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center">
            <p className="text-zinc-700">
              Failed to load subscriptions. Please try again.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading &&
          !error &&
          subscriptions &&
          subscriptions.length === 0 && (
            <div
              className={`rounded-lg p-12 text-center ${lightSurfaceClassName}`}
            >
              <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                No Subscriptions Found
              </h2>
              <p className="text-muted-foreground">
                This customer doesn&apos;t have any subscriptions yet.
              </p>
            </div>
          )}

        {/* Subscriptions Grid */}
        {!isLoading && !error && subscriptions && subscriptions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription._id}
                subscription={subscription}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <SubscriptionDetailsDialog
        subscription={selectedSubscription}
        isOpen={isDetailsDialogOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
}
