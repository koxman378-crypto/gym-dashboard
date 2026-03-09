"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  User,
  Calendar,
  CreditCard,
  DollarSign,
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

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, any> = {
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
  const variants: Record<string, any> = {
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
    <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header with ID and Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-slate-600">
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
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Package className="h-4 w-4" />
              Gym Package
            </div>
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{gymPrice.groupName}</div>
                  <div className="text-sm text-muted-foreground">
                    {gymPrice.selectedPrice.duration}{" "}
                    {gymPrice.selectedPrice.durationUnit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-emerald-600">
                    {gymPrice.selectedPrice.finalPrice.toLocaleString()} MMK
                  </div>
                  {gymPrice.selectedPrice.promotionType &&
                    gymPrice.selectedPrice.promotionValue && (
                      <div className="text-xs text-green-600">
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
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Package className="h-4 w-4" />
              Additional Services ({servicesCount})
            </div>
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="text-sm text-emerald-600 font-semibold">
                {subscription.otherServiceTotal.toLocaleString()} MMK
              </div>
            </div>
          </div>
        )}

        {/* Trainer */}
        {subscription.trainer && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User className="h-4 w-4" />
              Trainer
            </div>
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="flex justify-between">
                <div className="text-sm">
                  {subscription.trainer.trainerName}
                </div>
                <div className="text-sm font-semibold text-emerald-600">
                  {subscription.trainer.finalPrice.toLocaleString()} MMK
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
            className={`flex items-center gap-2 ${isExpired ? "text-red-600" : "text-muted-foreground"}`}
          >
            <Calendar className="h-4 w-4" />
            <span>{formatDate(subscription.endDate)}</span>
          </div>
        </div>

        <Separator />

        {/* Payment Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Grand Total:</span>
            <span className="text-lg font-bold text-green-600">
              {subscription.grandTotal.toLocaleString()} MMK
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Paid Amount:</span>
            <span className="text-sm font-semibold">
              {subscription.paidAmount.toLocaleString()} MMK
            </span>
          </div>
          {subscription.paidAmount < subscription.grandTotal && (
            <div className="flex justify-between items-center text-red-600">
              <span className="text-sm font-medium">Outstanding:</span>
              <span className="text-sm font-semibold">
                {(
                  subscription.grandTotal - subscription.paidAmount
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
          className="w-full mt-4"
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-48"></div>
            </div>
          ) : customerData ? (
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {customerData.name}'s Subscriptions
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
            <h1 className="text-3xl font-bold text-slate-900">
              Customer Subscriptions
            </h1>
          )}
        </div>

        {/* Subscription Count */}
        {!isLoading && subscriptions && subscriptions.length > 0 && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
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
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">
              Failed to load subscriptions. Please try again.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading &&
          !error &&
          subscriptions &&
          subscriptions.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
              <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                No Subscriptions Found
              </h2>
              <p className="text-muted-foreground">
                This customer doesn't have any subscriptions yet.
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
