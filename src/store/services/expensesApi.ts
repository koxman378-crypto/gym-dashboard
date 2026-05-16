import { api } from "./baseApi";

export type ExpenseStatus = "pending" | "approved" | "rejected";
export type ExpenseCategory =
  | "maintenance"
  | "utilities"
  | "equipment"
  | "salary"
  | "rent"
  | "other";

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  note?: string | null;
  proofImages: string[];
  salaryItems?: {
    staffId: string;
    name: string;
    email: string;
    avatar?: string | null;
    amount: number;
    proofImage?: string | null;
  }[];
  status: ExpenseStatus;
  submittedBy: { _id: string; name: string; avatar?: string } | string;
  submittedByName: string;
  reviewedBy?: { _id: string; name: string } | string | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  gymId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpensesResponse {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateExpenseDto {
  title: string;
  amount: number;
  category: ExpenseCategory;
  note?: string;
  proofImages?: string[];
  gymId?: string;
  salaryItems?: {
    staffId: string;
    name: string;
    email: string;
    avatar?: string | null;
    amount: number;
    proofImage: string;
  }[];
}

export interface ReviewExpenseDto {
  reviewNote?: string;
}

export interface ExpenseSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;
}

export interface MonthlyExpense {
  year: number;
  month: number;
  total: number;
  count: number;
}

export const expensesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getExpenses: build.query<
      ExpensesResponse,
      {
        gymId?: string;
        status?: string;
        category?: string;
        submittedBy?: string;
        from?: string;
        to?: string;
        months?: number;
        page?: number;
        limit?: number;
      }
    >({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.gymId) qs.set("gymId", params.gymId);
        if (params.status) qs.set("status", params.status);
        if (params.category) qs.set("category", params.category);
        if (params.submittedBy) qs.set("submittedBy", params.submittedBy);
        if (params.from) qs.set("from", params.from);
        if (params.to) qs.set("to", params.to);
        if (params.months !== undefined) qs.set("months", String(params.months));
        if (params.page !== undefined) qs.set("page", String(params.page));
        if (params.limit !== undefined) qs.set("limit", String(params.limit));
        const s = qs.toString();
        return `/expenses${s ? `?${s}` : ""}`;
      },
      providesTags: ["Expense"],
    }),

    getExpensePendingCount: build.query<{ count: number }, string | undefined>({
      query: (gymId) =>
        gymId
          ? `/expenses/pending-count?gymId=${encodeURIComponent(gymId)}`
          : `/expenses/pending-count`,
      providesTags: ["Expense"],
    }),

    getExpenseSummary: build.query<
      ExpenseSummary,
      { gymId?: string; from?: string; to?: string; months?: number }
    >({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.gymId) qs.set("gymId", params.gymId);
        if (params.from) qs.set("from", params.from);
        if (params.to) qs.set("to", params.to);
        if (params.months !== undefined) qs.set("months", String(params.months));
        const s = qs.toString();
        return `/expenses/summary${s ? `?${s}` : ""}`;
      },
      providesTags: ["Expense"],
    }),

    createExpense: build.mutation<Expense, CreateExpenseDto>({
      query: (body) => ({ url: "/expenses", method: "POST", body }),
      invalidatesTags: ["Expense"],
    }),

    approveExpense: build.mutation<
      Expense,
      { id: string; reviewNote?: string }
    >({
      query: ({ id, reviewNote }) => ({
        url: `/expenses/${id}/approve`,
        method: "PATCH",
        body: { reviewNote },
      }),
      invalidatesTags: ["Expense"],
    }),

    rejectExpense: build.mutation<Expense, { id: string; reviewNote?: string }>(
      {
        query: ({ id, reviewNote }) => ({
          url: `/expenses/${id}/reject`,
          method: "PATCH",
          body: { reviewNote },
        }),
        invalidatesTags: ["Expense"],
      },
    ),

    getExpenseImageUrl: build.query<{ viewUrl: string | null }, string>({
      query: (url) => `/upload/view-url?url=${encodeURIComponent(url)}`,
    }),

    getExpenseProofUploadUrl: build.mutation<
      { uploadUrl: string; objectKey: string; publicUrl?: string },
      { fileName: string; contentType: string }
    >({
      query: (body) => ({
        url: "/upload/expense-proof",
        method: "POST",
        body,
      }),
    }),

    getExpensesMonthlyHistory: build.query<
      MonthlyExpense[],
      { gymId?: string; year?: number }
    >({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.gymId) qs.set("gymId", params.gymId);
        if (params.year !== undefined) qs.set("year", String(params.year));
        const s = qs.toString();
        return `/expenses/monthly-history${s ? `?${s}` : ""}`;
      },
      providesTags: ["Expense"],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetExpensePendingCountQuery,
  useGetExpenseSummaryQuery,
  useCreateExpenseMutation,
  useApproveExpenseMutation,
  useRejectExpenseMutation,
  useGetExpenseImageUrlQuery,
  useGetExpenseProofUploadUrlMutation,
  useGetExpensesMonthlyHistoryQuery,
} = expensesApi;
