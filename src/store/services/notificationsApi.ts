import { api } from "./baseApi";

export type NotificationType =
  | "subscription_end"
  | "gym_fee_end"
  | "service_end"
  | "trainer_end"
  | "payment_overdue"
  | "subscription_extended"
  | "payment_approved"
  | "payment_rejected";

export interface ServiceDaysLeftItem {
  name: string;
  daysLeft: number;
}

export interface GymNotification {
  _id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string | null;
  subscriptionId: string;
  type: NotificationType;
  targetId: string | null;
  targetName: string | null;
  daysLeft: number;
  subscriptionDaysLeft?: number | null;
  gymFeeDaysLeft?: number | null;
  trainerDaysLeft?: number | null;
  serviceDaysLeft?: ServiceDaysLeftItem[];
  offDayName?: string | null;
  offDayDaysAdded?: number | null;
  offDayAppliedAt?: string | null;
  isRead: boolean;
  remainingAmount: number | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: GymNotification[];
  total: number;
  page: number;
  totalPages: number;
}

export interface QueryNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  gymId?: string;
  group?: "payment" | "expiry" | "all";
}

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsResponse,
      QueryNotificationsParams
    >({
      query: (params = {}) => {
        const search = new URLSearchParams();
        if (params.page !== undefined) search.set("page", String(params.page));
        if (params.limit !== undefined)
          search.set("limit", String(params.limit));
        if (params.isRead !== undefined)
          search.set("isRead", String(params.isRead));
        if (params.gymId) search.set("gymId", params.gymId);
        if (params.group) search.set("group", params.group);
        const qs = search.toString();
        return `/notifications${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Notification"],
    }),

    getUnreadCount: builder.query<{ count: number }, { gymId?: string } | void>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params && "gymId" in params && params.gymId) {
          search.set("gymId", params.gymId);
        }
        const qs = search.toString();
        return `/notifications/unread-count${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Notification"],
    }),

    markRead: builder.mutation<void, string[]>({
      query: (ids) => ({
        url: "/notifications/mark-read",
        method: "PATCH",
        body: { ids },
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: builder.mutation<
      void,
      { id: string; gymId?: string | null }
    >({
      query: ({ id, gymId }) => {
        const search = new URLSearchParams();
        if (gymId) search.set("gymId", gymId);
        const qs = search.toString();
        return {
          url: `/notifications/${id}${qs ? `?${qs}` : ""}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
