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
  "border-black/20 bg-white text-slate-900 hover:border-black/40 focus:border-slate-900 focus:ring-black/10";
const lightSelectContentClassName =
  "border-black/20 bg-white text-slate-900 shadow-xl ring-black/10";
const lightSelectItemClassName =
  "text-slate-900 focus:bg-slate-100 hover:bg-slate-100";

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
        <div className="rounded-xl border border-black/10 bg-slate-50 p-2.5">
          <Filter className="h-5 w-5 text-slate-500" />
        </div>
        <span className="text-sm font-semibold text-slate-900">
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
        <div className="rounded-xl border border-black/10 bg-slate-50 p-2.5">
          <History className="h-5 w-5 text-slate-500" />
        </div>
        <span className="text-sm font-semibold text-slate-900">
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
