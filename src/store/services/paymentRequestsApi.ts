import { api } from "./baseApi";

export interface PaymentRequest {
  _id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string | null;
  subscriptionId: string | { _id: string; grandTotal: number; paidAmount: number; paymentStatus: string };
  amount: number;
  proofImage?: string | null;
  note?: string | null;
  status: "pending" | "approved" | "rejected";
  reviewNote?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: { _id: string; name: string; avatar?: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequestsResponse {
  data: PaymentRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const paymentRequestsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentRequests: builder.query<
      PaymentRequestsResponse,
      { page?: number; limit?: number; status?: string; customerId?: string; gymId?: string }
    >({
      query: (params = {}) => {
        const search = new URLSearchParams();
        if (params.page !== undefined) search.set("page", String(params.page));
        if (params.limit !== undefined) search.set("limit", String(params.limit));
        if (params.status) search.set("status", params.status);
        if (params.customerId) search.set("customerId", params.customerId);
        if (params.gymId) search.set("gymId", params.gymId);
        const qs = search.toString();
        return `/payment-requests${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["PaymentRequest"],
    }),

    getPendingCount: builder.query<{ count: number }, void>({
      query: () => "/payment-requests/pending-count",
      providesTags: ["PaymentRequest"],
    }),

    approvePaymentRequest: builder.mutation<
      PaymentRequest,
      { id: string; reviewNote?: string }
    >({
      query: ({ id, reviewNote }) => ({
        url: `/payment-requests/${id}/approve`,
        method: "PATCH",
        body: { reviewNote },
      }),
      invalidatesTags: ["PaymentRequest", "Subscription", "Notification"],
    }),

    rejectPaymentRequest: builder.mutation<
      PaymentRequest,
      { id: string; reviewNote?: string }
    >({
      query: ({ id, reviewNote }) => ({
        url: `/payment-requests/${id}/reject`,
        method: "PATCH",
        body: { reviewNote },
      }),
      invalidatesTags: ["PaymentRequest"],
    }),

    getImageViewUrl: builder.query<{ viewUrl: string | null }, string>({
      query: (url) => `/upload/view-url?url=${encodeURIComponent(url)}`,
    }),
  }),
});

export const {
  useGetPaymentRequestsQuery,
  useGetPendingCountQuery,
  useApprovePaymentRequestMutation,
  useRejectPaymentRequestMutation,
  useGetImageViewUrlQuery,
} = paymentRequestsApi;
