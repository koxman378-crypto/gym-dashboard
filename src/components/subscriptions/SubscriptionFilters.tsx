"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Filter, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { User } from "@/src/types/type";

const lightSelectTriggerClassName =
  "border-border bg-background text-foreground hover:border-ring focus:border-slate-900 focus:ring-ring/20";
const lightSelectContentClassName =
  "border-border bg-background text-foreground shadow-xl ring-ring/20";
const lightSelectItemClassName =
  "text-foreground focus:bg-muted hover:bg-muted";

interface SubscriptionFiltersProps {
  statusFilter: string;
  customers: User[];
  isLoadingCustomers: boolean;
  onStatusChange: (value: string) => void;
}

export function SubscriptionFilters({
  statusFilter,
  customers,
  isLoadingCustomers,
  onStatusChange,
}: SubscriptionFiltersProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="rounded-xl border border-border bg-muted p-2.5">
          <Filter className="h-5 w-5 text-muted-foreground" />
        </div>
        <span className="text-sm font-semibold text-foreground">
          Filter by Status:
        </span>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger
            className={`w-48 cursor-pointer${lightSelectTriggerClassName}`}
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className={lightSelectContentClassName}>
            <SelectItem
              value="all"
              className={`cursor-pointer${lightSelectItemClassName}`}
            >
              All Statuses
            </SelectItem>
            <SelectItem
              value="active"
              className={`cursor-pointer${lightSelectItemClassName}`}
            >
              Active
            </SelectItem>
            <SelectItem
              value="expired"
              className={`cursor-pointer${lightSelectItemClassName}`}
            >
              Expired
            </SelectItem>
            <SelectItem
              value="cancelled"
              className={`cursor-pointer${lightSelectItemClassName}`}
            >
              Cancelled
            </SelectItem>
            <SelectItem
              value="pending"
              className={`cursor-pointer${lightSelectItemClassName}`}
            >
              Pending
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-border bg-muted p-2.5">
          <History className="h-5 w-5 text-muted-foreground" />
        </div>
        <span className="text-sm font-semibold text-foreground">
          View History:
        </span>
        <Select
          value=""
          onValueChange={(customerId) => {
            if (customerId) {
              router.push(`/subscriptions/customer/${customerId}`);
            }
          }}
        >
          <SelectTrigger
            className={`w-64 cursor-pointer ${lightSelectTriggerClassName}`}
          >
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent className={`cursor-pointer{lightSelectItemClassName}`}>
            {isLoadingCustomers ? (
              <SelectItem
                value="loading"
                disabled
                className={`cursor-pointer${lightSelectItemClassName}`}
              >
                Loading customers...
              </SelectItem>
            ) : customers.length === 0 ? (
              <SelectItem
                value="empty"
                disabled
                className={lightSelectItemClassName}
              >
                No customers found
              </SelectItem>
            ) : (
              customers.map((customer) => (
                <SelectItem
                  key={customer._id}
                  value={customer._id}
                  className={`cursor-pointer${lightSelectItemClassName}`}
                >
                  {customer.name} ({customer.email})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
