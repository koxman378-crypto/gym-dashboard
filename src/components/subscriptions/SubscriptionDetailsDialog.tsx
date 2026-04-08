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
import {
  User,
  DollarSign,
  Calendar,
  CreditCard,
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

const detailCardClassName =
  "rounded-lg border border-black/10 bg-slate-50 p-4 text-slate-900";
const detailMutedTextClassName = "text-sm text-slate-500";

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

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, any> = {
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
  const variants: Record<string, any> = {
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border border-black/15 bg-white text-slate-900 shadow-2xl ring-black/10">
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
            <div className={`${detailCardClassName} space-y-1`}>
              <div className="flex justify-between">
                <span className={detailMutedTextClassName}>Name:</span>
                <span className="font-medium">{customer?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className={detailMutedTextClassName}>Email:</span>
                <span className="font-medium">{customer?.email || "N/A"}</span>
              </div>
              {customer?.phone && (
                <div className="flex justify-between">
                  <span className={detailMutedTextClassName}>Phone:</span>
                  <span className="font-medium">{customer.phone}</span>
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
              <div className={`${detailCardClassName} space-y-1`}>
                <div className="flex justify-between">
                  <span className={detailMutedTextClassName}>
                    Package Name:
                  </span>
                  <span className="font-medium">
                    {subscription.gymPriceGroup.groupName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={detailMutedTextClassName}>Duration:</span>
                  <span className="font-medium">
                    {subscription.gymPriceGroup.selectedPrice.duration}{" "}
                    {subscription.gymPriceGroup.selectedPrice.durationUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={detailMutedTextClassName}>Base Amount:</span>
                  <span className="font-medium">
                    {subscription.gymPriceGroup.selectedPrice.amount.toLocaleString()}{" "}
                    MMK
                  </span>
                </div>
                {subscription.gymPriceGroup.selectedPrice.promotionType &&
                  subscription.gymPriceGroup.selectedPrice.promotionValue && (
                    <div className="flex justify-between">
                      <span className={detailMutedTextClassName}>
                        Promotion:
                      </span>
                      <span className="font-medium text-green-600">
                        {subscription.gymPriceGroup.selectedPrice
                          .promotionType === "percentage"
                          ? `${subscription.gymPriceGroup.selectedPrice.promotionValue}% off`
                          : `${Number(subscription.gymPriceGroup.selectedPrice.promotionValue).toLocaleString()} MMK off`}
                      </span>
                    </div>
                  )}
                <div className="flex justify-between font-semibold">
                  <span className="text-sm">Final Price:</span>
                  <span className="text-emerald-600">
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
                  <div key={idx} className={`${detailCardClassName} space-y-2`}>
                    <div className="border-b border-black/10 pb-1 text-sm font-medium">
                      {group.groupName}
                    </div>
                    {group.selectedServices.map((service, sIdx) => (
                      <div key={sIdx} className="ml-2 space-y-1 pb-2">
                        <div className="flex justify-between">
                          <span className={detailMutedTextClassName}>
                            Service:
                          </span>
                          <span className="font-medium">{service.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={detailMutedTextClassName}>
                            Duration:
                          </span>
                          <span className="text-sm">
                            {service.duration} {service.durationUnit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={detailMutedTextClassName}>
                            Base Price:
                          </span>
                          <span className="text-sm">
                            {service.price.toLocaleString()} MMK
                          </span>
                        </div>
                        {service.promotionType && service.promotionValue && (
                          <div className="flex justify-between">
                            <span className={detailMutedTextClassName}>
                              Promotion:
                            </span>
                            <span className="text-sm text-green-600">
                              {service.promotionType === "percentage"
                                ? `${service.promotionValue}% off`
                                : `${Number(service.promotionValue).toLocaleString()} MMK off`}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold">
                          <span className="text-sm">Final Price:</span>
                          <span className="text-sm text-emerald-600">
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
              <div className={`${detailCardClassName} space-y-1`}>
                <div className="flex justify-between">
                  <span className={detailMutedTextClassName}>
                    Trainer Name:
                  </span>
                  <span className="font-medium">
                    {trainer.trainerName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={detailMutedTextClassName}>Duration:</span>
                  <span className="font-medium">
                    {trainer.duration && trainer.durationUnit
                      ? `${trainer.duration} ${trainer.durationUnit}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={detailMutedTextClassName}>Base Amount:</span>
                  <span className="font-medium">
                    {typeof trainer.amount === "number"
                      ? `${trainer.amount.toLocaleString()} MMK`
                      : "N/A"}
                  </span>
                </div>
                {trainer.promotionType && trainer.promotionValue && (
                  <div className="flex justify-between">
                    <span className={detailMutedTextClassName}>Promotion:</span>
                    <span className="font-medium text-green-600">
                      {trainer.promotionType === "percentage"
                        ? `${trainer.promotionValue}% off`
                        : `${Number(trainer.promotionValue).toLocaleString()} MMK off`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span className="text-sm">Trainer Fee:</span>
                  <span className="text-emerald-600">
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
            <div className={`${detailCardClassName} space-y-1`}>
              <div className="flex justify-between">
                <span className={detailMutedTextClassName}>Start Date:</span>
                <span className="font-medium">
                  {formatDate(subscription.startDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={detailMutedTextClassName}>End Date:</span>
                <span className="font-medium">
                  {formatDate(subscription.endDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={detailMutedTextClassName}>Created At:</span>
                <span className="font-medium text-sm">
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
            <div className={`${detailCardClassName} space-y-2`}>
              <div className="flex justify-between">
                <span className={detailMutedTextClassName}>
                  Gym Package Total:
                </span>
                <span className="font-medium">
                  {subscription.gymPriceTotal.toLocaleString()} MMK
                </span>
              </div>
              {subscription.otherServiceTotal > 0 && (
                <div className="flex justify-between">
                  <span className={detailMutedTextClassName}>
                    Additional Services Total:
                  </span>
                  <span className="font-medium">
                    {subscription.otherServiceTotal.toLocaleString()} MMK
                  </span>
                </div>
              )}
              {subscription.trainerFeeTotal > 0 && (
                <div className="flex justify-between">
                  <span className={detailMutedTextClassName}>Trainer Fee:</span>
                  <span className="font-medium">
                    {subscription.trainerFeeTotal.toLocaleString()} MMK
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total:</span>
                <span className="text-green-600">
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
            <div className={`${detailCardClassName} space-y-1`}>
              <div className="flex justify-between">
                <span className={detailMutedTextClassName}>
                  Payment Status:
                </span>
                <PaymentBadge status={subscription.paymentStatus} />
              </div>
              <div className="flex justify-between">
                <span className={detailMutedTextClassName}>Paid Amount:</span>
                <span className="font-medium">
                  {subscription.paidAmount.toLocaleString()} MMK
                </span>
              </div>
              {subscription.paidAmount < subscription.grandTotal && (
                <div className="flex justify-between text-red-600">
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
              <div className={`${detailCardClassName} space-y-1`}>
                {createdBy && (
                  <div className="flex justify-between">
                    <span className={detailMutedTextClassName}>
                      Created By:
                    </span>
                    <span className="font-medium">
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

        <DialogFooter className="border-black/10 bg-slate-50">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
