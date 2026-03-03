# DataTable Component - Universal Usage Guide

The `DataTable` component is a fully reusable, type-safe table component that can be used for **any data type**: users, plans, subscriptions, transactions, etc.

## Features

✅ **Type-Safe** - Full TypeScript support with generics  
✅ **Server-Side Pagination** - Built-in pagination support  
✅ **Row Selection** - Optional checkbox selection  
✅ **Loading States** - Hard and soft loading indicators  
✅ **Click Handlers** - Row click events  
✅ **Customizable** - Fully customizable columns and styling  
✅ **Responsive** - Mobile-friendly design

---

## Basic Usage

### 1. Define Your Data Type

```typescript
// src/types/plan.ts
export interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
  isActive: boolean;
  createdAt: string;
}
```

### 2. Create Column Definitions

```typescript
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Plan } from "@/src/types/plan";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export const planColumns: ColumnDef<Plan>[] = [
  {
    accessorKey: "name",
    header: "Plan Name",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => `${row.getValue("duration")} days`,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "success" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    },
  },
];
```

### 3. Use in Your Page

```typescript
"use client";

import { useState } from "react";
import { DataTable } from "@/src/components/data-table/table-data";
import { planColumns } from "./columns";
import { useGetPlansQuery } from "@/src/store/services/plansApi";

export default function PlansPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useGetPlansQuery({ page, limit: pageSize });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Plans</h1>
      
      <DataTable
        columns={planColumns}
        data={data?.plans || []}
        isLoading={isLoading}
        pagination={{
          meta: {
            page: data?.page || 1,
            limit: data?.limit || 10,
            total: data?.total || 0,
            totalPages: data?.totalPages || 1,
          },
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
          isLoading,
        }}
        getRowId={(row) => row._id}
        emptyMessage="No plans found."
      />
    </div>
  );
}
```

---

## Advanced Examples

### With Row Selection

```typescript
const [selectedPlans, setSelectedPlans] = useState<Plan[]>([]);

<DataTable
  columns={planColumns}
  data={plans}
  enableRowSelection={true}
  onRowSelectionChange={setSelectedPlans}
  getRowId={(row) => row._id}
/>

// Use selectedPlans for bulk actions
<Button onClick={() => console.log(selectedPlans)}>
  Delete Selected ({selectedPlans.length})
</Button>
```

### With Row Click Handler

```typescript
const router = useRouter();

<DataTable
  columns={planColumns}
  data={plans}
  onRowClick={(plan) => {
    router.push(`/plans/${plan._id}`);
  }}
/>
```

### With Soft Loading (Skeleton State)

```typescript
const { data, isLoading, isFetching } = useGetPlansQuery({ page });

<DataTable
  columns={planColumns}
  data={data?.plans || []}
  isLoading={isLoading} // Initial load
  isSoftLoading={isFetching && !isLoading} // Refetch without blocking UI
  pagination={...}
/>
```

---

## Real-World Examples

### Subscriptions Table

```typescript
// types/subscription.ts
export interface Subscription {
  _id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
}

// columns/subscriptionColumns.tsx
export const subscriptionColumns: ColumnDef<Subscription>[] = [
  {
    accessorKey: "userId",
    header: "User",
    cell: ({ row }) => <UserCell userId={row.getValue("userId")} />,
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => format(new Date(row.getValue("startDate")), "PPP"),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => format(new Date(row.getValue("endDate")), "PPP"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = {
        active: "success",
        expired: "destructive",
        cancelled: "secondary",
      }[status];
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];
```

### Transactions Table

```typescript
// types/transaction.ts
export interface Transaction {
  _id: string;
  amount: number;
  type: 'payment' | 'refund';
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

// Usage
<DataTable
  columns={transactionColumns}
  data={transactions}
  emptyMessage="No transactions yet."
/>
```

---

## API Structure

### Props Reference

```typescript
interface DataTableProps<TData> {
  // Required
  columns: ColumnDef<TData, any>[];
  data: TData[];
  
  // Optional
  isLoading?: boolean;              // Show loading state
  isSoftLoading?: boolean;          // Show overlay loading
  pagination?: {                    // Enable pagination
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    isLoading?: boolean;
  };
  onRowClick?: (row: TData) => void;              // Row click handler
  enableRowSelection?: boolean;                    // Enable checkboxes
  onRowSelectionChange?: (rows: TData[]) => void; // Selection callback
  emptyMessage?: string;                          // Custom empty state
  getRowId?: (row: TData) => string;              // Custom row ID
}
```

---

## Tips & Best Practices

### 1. **Memoize Columns**
Columns are already memoized inside the component, but you can define them outside your component:

```typescript
// ✅ Good - defined outside component
const columns = [...];

function MyPage() {
  return <DataTable columns={columns} ... />;
}
```

### 2. **Use getRowId for Optimization**
Always provide `getRowId` for better React key management:

```typescript
<DataTable
  getRowId={(row) => row._id} // or row.id
  ...
/>
```

### 3. **Server-Side Pagination**
The table expects server-side pagination. Your API should return:

```typescript
{
  data: T[],
  page: number,
  limit: number,
  total: number,
  totalPages: number
}
```

### 4. **Loading States**
- `isLoading`: Full table skeleton (initial load)
- `isSoftLoading`: Overlay spinner (refetch/pagination)

```typescript
const { data, isLoading, isFetching } = useQuery(...);

<DataTable
  isLoading={isLoading}
  isSoftLoading={isFetching && !isLoading}
/>
```

---

## Styling Customization

### Custom Row Styles

```typescript
columns: [
  {
    id: "status",
    cell: ({ row }) => {
      const isExpired = row.original.status === 'expired';
      return (
        <div className={isExpired ? "text-red-500" : ""}>
          {row.original.status}
        </div>
      );
    }
  }
]
```

### Conditional Row Colors
The component applies `data-state="selected"` to selected rows. Add custom styles:

```css
/* In your globals.css */
[data-state="selected"] {
  @apply bg-primary/10;
}
```

---

## Complete File Structure

```
src/
├── components/
│   ├── data-table/
│   │   ├── table-data.tsx          # ✅ Universal table component
│   │   └── data-table-pagination.tsx
│   └── loading/
│       └── index.tsx
├── types/
│   ├── table.ts                    # Table types
│   ├── plan.ts                     # Plan types
│   └── subscription.ts             # Subscription types
└── app/
    ├── plans/
    │   ├── page.tsx                # Plans page
    │   └── columns.tsx             # Plan columns
    └── subscriptions/
        ├── page.tsx                # Subscriptions page
        └── columns.tsx             # Subscription columns
```

---

## Sample API Integration

```typescript
// src/store/services/plansApi.ts
import { api } from './baseApi';

interface Plan {
  _id: string;
  name: string;
  price: number;
}

interface PlansResponse {
  plans: Plan[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const plansApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<PlansResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => `/plans?page=${page}&limit=${limit}`,
      providesTags: ['Plans'],
    }),
  }),
});

export const { useGetPlansQuery } = plansApi;
```

---

**That's it!** The DataTable component is now ready to use for any data type in your application. Just define your types, create columns, and plug it in! 🚀
