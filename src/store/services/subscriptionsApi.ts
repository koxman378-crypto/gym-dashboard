import { api } from "./baseApi";
import type {
  Subscription,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from "@/src/types/extended-types";

export const subscriptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ============ SUBSCRIPTION MANAGEMENT (Custom Fees System) ============
    createSubscription: builder.mutation<Subscription, CreateSubscriptionDto>({
      query: (data) => ({
        url: "/subscriptions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription", "Statistics"],
    }),

    getAllSubscriptions: builder.query<
      Subscription[],
      {
        page?: number;
        limit?: number;
        status?: string;
        customer?: string;
        trainerId?: string;
      }
    >({
      query: (params) => ({
        url: "/subscriptions",
        params,
      }),
      transformResponse: (response: any) => {
        // Handle both array and paginated response
        if (Array.isArray(response)) {
          return response;
        }
        // If paginated response with data/results field
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (response?.results && Array.isArray(response.results)) {
          return response.results;
        }
        return [];
      },
      providesTags: ["Subscription"],
    }),

    getSubscriptionById: builder.query<Subscription, string>({
      query: (id) => `/subscriptions/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Subscription", id }],
    }),

    getCustomerActiveSubscriptions: builder.query<Subscription[], string>({
      query: (customerId) => `/subscriptions/customer/${customerId}/active`,
      providesTags: ["Subscription"],
    }),

    getCustomerSpendingSummary: builder.query<any, string>({
      query: (customerId) => `/subscriptions/customer/${customerId}/summary`,
      providesTags: ["Subscription", "Statistics"],
    }),

    getCustomerHistory: builder.query<Subscription[], string>({
      query: (customerId) => `/subscriptions/customer/${customerId}/history`,
      providesTags: ["Subscription"],
    }),

    updateSubscription: builder.mutation<
      Subscription,
      { id: string; data: UpdateSubscriptionDto }
    >({
      query: ({ id, data }) => ({
        url: `/subscriptions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Subscription", id },
        "Subscription",
        "Statistics",
      ],
    }),

    cancelSubscription: builder.mutation<Subscription, string>({
      query: (id) => ({
        url: `/subscriptions/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Subscription", id },
        "Subscription",
        "Statistics",
      ],
    }),

    deleteSubscription: builder.mutation<void, string>({
      query: (id) => ({
        url: `/subscriptions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subscription", "Statistics"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateSubscriptionMutation,
  useGetAllSubscriptionsQuery,
  useGetSubscriptionByIdQuery,
  useGetCustomerActiveSubscriptionsQuery,
  useGetCustomerSpendingSummaryQuery,
  useGetCustomerHistoryQuery,
  useUpdateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useDeleteSubscriptionMutation,
} = subscriptionsApi;
