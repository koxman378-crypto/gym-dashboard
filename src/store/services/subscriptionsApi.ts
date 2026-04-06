import { api } from "./baseApi";
import type {
  Subscription,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from "@/src/types/extended-types";

const normalizeSubscription = (sub: any): Subscription => {
  const normalizedServices = Array.isArray(sub?.services)
    ? sub.services.map((service: any) => ({
        serviceId: service.serviceId,
        name: service.name ?? "",
        amount: Number(service.amount ?? 0),
        duration: Number(service.duration ?? 1),
        durationUnit: service.durationUnit ?? "months",
        totalAmount: Number(service.totalAmount ?? service.finalAmount ?? 0),
        promotionType: service.promotionType ?? null,
        promotionValue:
          service.promotionValue === undefined ? null : service.promotionValue,
        discountAmount: Number(service.discountAmount ?? 0),
        finalAmount: Number(service.finalAmount ?? service.totalAmount ?? 0),
        endDate: service.endDate,
        serviceRowId: service.serviceRowId ?? service.serviceId,
        price: Number(service.price ?? service.amount ?? 0),
        finalPrice: Number(service.finalPrice ?? service.finalAmount ?? 0),
      }))
    : [];

  const servicesTotal = normalizedServices.reduce(
    (sum: number, item: any) => sum + Number(item.finalAmount ?? item.finalPrice ?? 0),
    0,
  );

  const gymFee = sub?.gymFee
    ? {
        feeId: sub.gymFee.feeId,
        name: sub.gymFee.name,
        amount: Number(sub.gymFee.amount ?? 0),
        duration: Number(sub.gymFee.duration ?? 1),
        durationUnit: sub.gymFee.durationUnit ?? "months",
        totalAmount: Number(sub.gymFee.totalAmount ?? 0),
        promotionType: sub.gymFee.promotionType ?? null,
        promotionValue:
          sub.gymFee.promotionValue === undefined
            ? null
            : sub.gymFee.promotionValue,
        discountAmount: Number(sub.gymFee.discountAmount ?? 0),
        finalAmount: Number(sub.gymFee.finalAmount ?? 0),
        endDate: sub.gymFee.endDate,
        priceRowId: sub.gymFee.feeId,
        finalPrice: Number(sub.gymFee.finalAmount ?? 0),
      }
    : null;

  const gymPriceGroup = gymFee
    ? {
        groupId: gymFee.feeId,
        groupName: gymFee.name,
        selectedPrice: {
          priceRowId: gymFee.feeId,
          duration: gymFee.duration,
          durationUnit: gymFee.durationUnit,
          amount: gymFee.amount,
          promotionType: gymFee.promotionType,
          promotionValue: gymFee.promotionValue,
          finalPrice: gymFee.finalPrice,
        },
      }
    : null;

  const otherServiceGroups = normalizedServices.length
    ? normalizedServices.map((service: any) => ({
        groupId: service.serviceId,
        groupName: service.name,
        selectedServices: [
          {
            serviceRowId: service.serviceId,
            name: service.name,
            duration: Number(service.duration ?? 1),
            durationUnit: service.durationUnit ?? "months",
            price: Number(service.amount ?? 0),
            promotionType: service.promotionType ?? null,
            promotionValue:
              service.promotionValue === undefined
                ? null
                : service.promotionValue,
            finalPrice: Number(service.finalPrice ?? service.finalAmount ?? 0),
          },
        ],
      }))
    : [];

  const trainer = sub?.trainer
    ? {
        trainerId: sub.trainer.trainerId,
        trainerName: sub.trainer.trainerName,
        trainerEmail: sub.trainer.trainerEmail,
        trainerAvatar: sub.trainer.trainerAvatar,
        feeId: sub.trainer.feeId,
        duration: Number(sub.trainer.duration ?? 1),
        durationUnit: sub.trainer.durationUnit ?? "months",
        amount: Number(sub.trainer.amount ?? 0),
        totalAmount: Number(sub.trainer.totalAmount ?? 0),
        promotionType: sub.trainer.promotionType ?? null,
        promotionValue:
          sub.trainer.promotionValue === undefined
            ? null
            : sub.trainer.promotionValue,
        discountAmount: Number(sub.trainer.discountAmount ?? 0),
        finalAmount: Number(sub.trainer.finalAmount ?? 0),
        endDate: sub.trainer.endDate,
        feeRowId: sub.trainer.feeId,
        finalPrice: Number(sub.trainer.finalAmount ?? 0),
      }
    : null;

  return {
    ...sub,
    gymFee,
    services: normalizedServices,
    gymPriceGroup,
    otherServiceGroups,
    trainer,
    subtotal: Number(
      sub?.subtotal ??
        (gymFee?.totalAmount ?? 0) +
          servicesTotal +
          (trainer?.totalAmount ?? 0),
    ),
    discountAmount: Number(
      sub?.discountAmount ??
        (gymFee?.discountAmount ?? 0) +
          normalizedServices.reduce(
            (sum: number, item: any) => sum + Number(item.discountAmount ?? 0),
            0,
          ) +
          (trainer?.discountAmount ?? 0),
    ),
    grandTotal: Number(
      sub?.grandTotal ??
        (gymFee?.finalAmount ?? 0) +
          servicesTotal +
          (trainer?.finalAmount ?? 0),
    ),
    gymPriceTotal: Number(sub?.gymPriceTotal ?? gymFee?.finalAmount ?? 0),
    otherServiceTotal: Number(sub?.otherServiceTotal ?? servicesTotal),
    trainerFeeTotal: Number(sub?.trainerFeeTotal ?? trainer?.finalAmount ?? 0),
  };
};

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
      transformResponse: (response: any) => normalizeSubscription(response),
    }),

    getAllSubscriptions: builder.query<
      {
        data: Subscription[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      },
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
      transformResponse: (response: any, _meta, arg) => {
        // Normalise any backend shape into { data, total, page, limit, totalPages }
        let data: Subscription[] = [];
        let total = 0;
        const page = arg.page ?? 1;
        const limit = arg.limit ?? 10;

        if (Array.isArray(response)) {
          data = response.map(normalizeSubscription);
          total = response.length;
        } else if (response?.data && Array.isArray(response.data)) {
          data = response.data.map(normalizeSubscription);
          total = response.total ?? response.data.length;
        } else if (response?.results && Array.isArray(response.results)) {
          data = response.results.map(normalizeSubscription);
          total =
            response.totalResults ?? response.total ?? response.results.length;
        }

        const resolvedTotal =
          response?.totalResults ?? response?.total ?? total;
        const resolvedLimit = response?.limit ?? limit;
        const computedTotalPages =
          resolvedLimit > 0 ? Math.ceil(resolvedTotal / resolvedLimit) : 1;

        return {
          data,
          total: resolvedTotal,
          page: response?.page ?? page,
          limit: resolvedLimit,
          totalPages: response?.totalPages ?? computedTotalPages,
        };
      },
      providesTags: ["Subscription"],
    }),

    getSubscriptionById: builder.query<Subscription, string>({
      query: (id) => `/subscriptions/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Subscription", id }],
      transformResponse: (response: any) => normalizeSubscription(response),
    }),

    getCustomerActiveSubscriptions: builder.query<Subscription[], string>({
      query: (customerId) => `/subscriptions/customer/${customerId}/active`,
      providesTags: ["Subscription"],
      transformResponse: (response: any) =>
        Array.isArray(response)
          ? response.map(normalizeSubscription)
          : response?.results && Array.isArray(response.results)
            ? response.results.map(normalizeSubscription)
            : [],
    }),

    getCustomerSpendingSummary: builder.query<any, string>({
      query: (customerId) => `/subscriptions/customer/${customerId}/summary`,
      providesTags: ["Subscription", "Statistics"],
    }),

    getCustomerHistory: builder.query<Subscription[], string>({
      query: (customerId) => `/subscriptions/customer/${customerId}/history`,
      providesTags: ["Subscription"],
      transformResponse: (response: any) =>
        Array.isArray(response)
          ? response.map(normalizeSubscription)
          : response?.results && Array.isArray(response.results)
            ? response.results.map(normalizeSubscription)
            : [],
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
