"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
} from "@/src/store/services/notificationsApi";

export function NotificationToaster() {
  const { data: notifications } = useGetNotificationsQuery({
    page: 1,
    limit: 5,
  });
  const { data: unreadData } = useGetUnreadCountQuery();
  const prevUnread = useRef(unreadData?.count ?? 0);

  useEffect(() => {
    if (unreadData && unreadData.count > prevUnread.current) {
      const latest = notifications?.data?.[0];
      if (latest) {
        if (latest.type === "payment_overdue") {
          toast(
            `Payment left: ${latest.remainingAmount?.toLocaleString()} MMK`,
          );
        } else if (latest.type === "subscription_end") {
          if (latest.offDayDaysAdded) {
            toast(
              `Subscription extended by ${latest.offDayDaysAdded} day(s)${latest.offDayName ? `: ${latest.offDayName}` : ""}`,
            );
          } else {
            const allDays = [
              latest.subscriptionDaysLeft,
              latest.gymFeeDaysLeft,
              latest.trainerDaysLeft,
              ...(latest.serviceDaysLeft?.map((s) => s.daysLeft) ?? []),
            ].filter((value): value is number => typeof value === "number");

            const nearest = allDays.length > 0 ? Math.min(...allDays) : latest.daysLeft;
            toast(`Ends in ${nearest} day(s): Subscription timeline updated`);
          }
        } else if (["gym_fee_end", "trainer_end", "service_end"].includes(latest.type)) {
          toast(`Ends in ${latest.daysLeft} days: ${latest.targetName || latest.type}`);
        } else if (
          ["payment_approved", "payment_rejected"].includes(
            latest.type as string,
          )
        ) {
          const typeStr = latest.type as string;
          toast(
            typeStr === "payment_approved"
              ? "Your payment request was approved!"
              : "Your payment request was rejected.",
          );
        }
      }
    }
    prevUnread.current = unreadData?.count ?? 0;
  }, [unreadData, notifications]);

  return null;
}
