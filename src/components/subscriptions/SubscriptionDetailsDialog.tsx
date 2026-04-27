"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Subscription } from "@/src/types/extended-types";
import type { ComponentProps } from "react";
import {
  User,
  CreditCard,
  Calendar,
  Activity,
  Hash,
  FileText,
  Receipt,
  UserCheck,
  Banknote,
  Package,
} from "lucide-react";
import { Separator } from "@/src/components/ui/seperator";

interface SubscriptionDetailsDialogProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
}

const detailMutedTextClassName = "text-sm text-slate-500";
const detailCardBaseClassName =
  "rounded-2xl border p-4 text-foreground shadow-sm";
const customerCardClassName = `${detailCardBaseClassName} border-sky-200 bg-sky-50/80`;
const gymCardClassName = `${detailCardBaseClassName} border-blue-200 bg-blue-50/80`;
const serviceCardClassName = `${detailCardBaseClassName} border-violet-200 bg-violet-50/80`;
const trainerCardClassName = `${detailCardBaseClassName} border-emerald-200 bg-emerald-50/80`;
const periodCardClassName = `${detailCardBaseClassName} border-slate-200 bg-slate-50/80`;
const feeCardClassName = `${detailCardBaseClassName} border-amber-200 bg-amber-50/80`;
const paymentCardClassName = `${detailCardBaseClassName} border-rose-200 bg-rose-50/80`;
const infoCardClassName = `${detailCardBaseClassName} border-indigo-200 bg-indigo-50/80`;

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (dateString: string | Date | null | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>;

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, BadgeVariant> = {
    active: "active",
    expired: "inactive",
    cancelled: "destructive",
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
  };
  return (
    <Badge variant={variants[status] || "secondary"}>
      {status.toUpperCase()}
    </Badge>
  );
};

export const SubscriptionDetailsDialog = ({
  subscription,
  isOpen,
  onClose,
}: SubscriptionDetailsDialogProps) => {
  if (!subscription) return null;

  const customer =
    typeof subscription.customer === "object" ? subscription.customer : null;
  const createdBy =
    typeof subscription.createdBy === "object" ? subscription.createdBy : null;
  const trainer = subscription.trainer;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border border-gray-200 bg-slate-50/95 text-foreground shadow-2xl ring-ring/20 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Subscription Details
          </DialogTitle>
          <DialogDescription>
            Complete subscription information and fee breakdown
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription ID & Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono font-semibold">
                {subscription._id.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={subscription.status} />
              <PaymentBadge status={subscription.paymentStatus} />
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h3>
            <div className={`${customerCardClassName} space-y-2`}>
              <div className="flex justify-between gap-4">
                <span className={detailMutedTextClassName}>Name:</span>
                <span className="font-semibold text-black/60">
                  {customer?.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className={detailMutedTextClassName}>Email:</span>
                <span className="font-medium text-slate-700">
                  {customer?.email || "N/A"}
                </span>
              </div>
              {customer?.phone && (
                <div className="flex justify-between gap-4">
                  <span className={detailMutedTextClassName}>Phone:</span>
                  <span className="font-medium text-slate-700">
                    {customer.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Gym Price Package */}
          {subscription.gymPriceGroup && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Gym Price Package
              </h3>
              <div className={`${gymCardClassName} space-y-2`}>
                <div className="flex justify-between gap-4">
                  <span className={detailMutedTextClassName}>
                    Package Name:
                  </span>
                  <span className="font-semibold text-black/60">
                    {subscription.gymPriceGroup.groupName}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className={detailMutedTextClassName}>Duration:</span>
                  <span className="font-medium text-slate-700">
                    {subscription.gymPriceGroup.selectedPrice.duration}{" "}
                    {subscription.gymPriceGroup.selectedPrice.durationUnit}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className={detailMutedTextClassName}>Base Amount:</span>
                  <span className="font-semibold text-green-500">
                    {subscription.gymPriceGroup.selectedPrice.amount.toLocaleString()}{" "}
                    MMK
                  </span>
                </div>
                {subscription.gymPriceGroup.selectedPrice.promotionType &&
                  subscription.gymPriceGroup.selectedPrice.promotionValue && (
                    <div className="flex justify-between gap-4">
                      <span className={detailMutedTextClassName}>
                        Promotion:
                      </span>
                      <span className="font-semibold text-orange-700">
                        {subscription.gymPriceGroup.selectedPrice
                          .promotionType === "percentage"
                          ? `${subscription.gymPriceGroup.selectedPrice.promotionValue}% off`
                          : `${Number(subscription.gymPriceGroup.selectedPrice.promotionValue).toLocaleString()} MMK off`}
                      </span>
                    </div>
                  )}
                <div className="flex justify-between gap-4 font-semibold">
                  <span className="text-sm text-slate-600">Final Price:</span>
                  <span className="text-emerald-700">
                    {subscription.gymPriceGroup.selectedPrice.finalPrice.toLocaleString()}{" "}
                    MMK
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Other Services */}
          {subscription.otherServiceGroups &&
            subscription.otherServiceGroups.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Services
                </h3>
                {subscription.otherServiceGroups.map((group, idx) => (
                  <div
                    key={idx}
                    className={`${serviceCardClassName} space-y-2`}
                  >
                    <div className="border-b border-violet-200 pb-1 text-sm font-semibold text-black/80">
                      {group.groupName}
                    </div>
                    {group.selectedServices.map((service, sIdx) => (
                      <div key={sIdx} className="ml-2 space-y-1 pb-2">
                        <div className="flex justify-between gap-4">
                          <span className={detailMutedTextClassName}>
                            Service:
                          </span>
                          <span className="font-semibold text-black/60">
                            {service.name}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className={detailMutedTextClassName}>
                            Duration:
                          </span>
                          <span className="text-sm text-slate-700">
                            {service.duration} {service.durationUnit}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className={detailMutedTextClassName}>
                            Base Price:
                          </span>
                          <span className="text-sm font-medium text-green-500">
                            {service.price.toLocaleString()} MMK
                          </span>
                        </div>
                        {service.promotionType && service.promotionValue && (
                          <div className="flex justify-between gap-4">
                            <span className={detailMutedTextClassName}>
                              Promotion:
                            </span>
                            <span className="text-sm font-semibold text-orange-700">
                              {service.promotionType === "percentage"
                                ? `${service.promotionValue}% off`
                                : `${Number(service.promotionValue).toLocaleString()} MMK off`}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between gap-4 font-semibold">
                          <span className="text-sm text-slate-600">
                            Final Price:
                          </span>
                          <span className="text-sm text-emerald-700">
                            {service.finalPrice.toLocaleString()} MMK
                          </span>
                        </div>
                        {sIdx < group.selectedServices.length - 1 && (
                          <Separator className="my-1" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

          {/* Trainer Information */}
          {trainer && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Trainer Assignment
              </h3>
              <div className={`${trainerCardClassName} space-y-2`}>
                <div className="flex justify-between gap-4">
                  <span className={detailMutedTextClassName}>
                    Trainer Name:
                  </span>
                  <span className="font-semibold text-black/60">
                    {trainer.trainerName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className={detailMutedTextClassName}>Duration:</span>
                  <span className="font-medium text-slate-700">
                    {trainer.duration && trainer.durationUnit
                      ? `${trainer.duration} ${trainer.durationUnit}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className={detailMutedTextClassName}>Base Amount:</span>
                  <span className="font-semibold text-green-500">
                    {typeof trainer.amount === "number"
                      ? `${trainer.amount.toLocaleString()} MMK`
                      : "N/A"}
                  </span>
                </div>
                {trainer.promotionType && trainer.promotionValue && (
                  <div className="flex justify-between gap-4">
                    <span className={detailMutedTextClassName}>Promotion:</span>
                    <span className="font-semibold text-orange-700">
                      {trainer.promotionType === "percentage"
                        ? `${trainer.promotionValue}% off`
                        : `${Number(trainer.promotionValue).toLocaleString()} MMK off`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4 font-semibold">
                  <span className="text-sm text-slate-600">Trainer Fee:</span>
                  <span className="text-emerald-700">
                    {typeof trainer.finalPrice === "number"
                      ? `${trainer.finalPrice.toLocaleString()} MMK`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Subscription Period
            </h3>
            <div className={`${periodCardClassName} space-y-2`}>
              <div className="flex justify-between gap-4">
                <span className={detailMutedTextClassName}>Start Date:</span>
                <span className="font-medium text-slate-700">
                  {formatDate(subscription.startDate)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className={detailMutedTextClassName}>End Date:</span>
                <span className="font-medium text-slate-700">
                  {formatDate(subscription.endDate)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className={detailMutedTextClassName}>Created At:</span>
                <span className="font-medium text-sm text-slate-700">
                  {formatDateTime(subscription.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Fee Breakdown
            </h3>
            <div className={`${feeCardClassName} space-y-2`}>
              <div className="flex justify-between gap-4">
                <span className={detailMutedTextClassName}>
                  Gym Package Total:
                </span>
                <span className="font-semibold text-black/80">
                  {subscription.gymPriceTotal.toLocaleString()} MMK
                </span>
              </div>
              {subscription.otherServiceTotal > 0 && (
                <div className="flex justify-between gap-4">
                  <span className={detailMutedTextClassName}>
                    Additional Services Total:
                  </span>
                  <span className="font-semibold text-black/80">
                    {subscription.otherServiceTotal.toLocaleString()} MMK
                  </span>
                </div>
              )}
              {subscription.trainerFeeTotal > 0 && (
                <div className="flex justify-between gap-4">
                  <span className={detailMutedTextClassName}>Trainer Fee:</span>
                  <span className="font-semibold text-black/70">
                    {subscription.trainerFeeTotal.toLocaleString()} MMK
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between gap-4 text-lg font-bold">
                <span className="text-slate-700">Grand Total:</span>
                <span className="text-emerald-700">
                  {subscription.grandTotal.toLocaleString()} MMK
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Information
            </h3>
            <div className={`${paymentCardClassName} space-y-2`}>
              <div className="flex justify-between gap-4">
                <span className={detailMutedTextClassName}>
                  Payment Status:
                </span>
                <PaymentBadge status={subscription.paymentStatus} />
              </div>
              <div className="flex justify-between gap-4">
                <span className={detailMutedTextClassName}>Paid Amount:</span>
                <span className="font-semibold text-black/70">
                  {subscription.paidAmount.toLocaleString()} MMK
                </span>
              </div>
              {subscription.paidAmount < subscription.grandTotal && (
                <div className="flex justify-between gap-4 text-red-600">
                  <span className="text-sm font-medium">
                    Outstanding Balance:
                  </span>
                  <span className="font-semibold">
                    {(
                      subscription.grandTotal - subscription.paidAmount
                    ).toLocaleString()}{" "}
                    MMK
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(subscription.notes || createdBy) && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Additional Information
              </h3>
              <div className={`${infoCardClassName} space-y-2`}>
                {createdBy && (
                  <div className="flex justify-between gap-4">
                    <span className={detailMutedTextClassName}>
                      Created By:
                    </span>
                    <span className="font-semibold text-blck/80">
                      {createdBy.name || "N/A"}
                    </span>
                  </div>
                )}
                {subscription.notes && (
                  <div className="pt-2">
                    <span className={detailMutedTextClassName}>Notes:</span>
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {subscription.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-border bg-muted">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-border bg-background text-foreground hover:bg-muted hover:text-foreground"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
