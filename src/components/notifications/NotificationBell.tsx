"use client";

import Link from "next/link";
import { Bell, BellDot } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  useGetUnreadCountQuery,
} from "@/src/store/services/notificationsApi";

export function NotificationBell() {
  const { data: countData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 5 * 60 * 1000,
  });

  const unread = countData?.count ?? 0;

  return (
    <Button variant="ghost" size="icon" className="relative h-9 w-9" asChild>
      <Link href="/notifications" aria-label="Open notifications">
        {unread > 0 ? (
          <BellDot className="h-5 w-5 text-orange-400" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unread > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center px-1 text-[10px]"
          >
            {unread > 99 ? "99+" : unread}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
