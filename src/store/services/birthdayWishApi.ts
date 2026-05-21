import { api } from "./baseApi";

export interface BirthdayWishHistoryEntry {
  message: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface BirthdayWish {
  _id?: string;
  gymId: string;
  message: string;
  autoSend: boolean;
  history: BirthdayWishHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertBirthdayWishDto {
  gymId?: string;
  message: string;
}

export interface ToggleAutoSendDto {
  gymId?: string;
  autoSend: boolean;
}

export interface BirthdayUser {
  _id: string;
  name: string;
  avatar: string | null;
  birthday: string;
  sendStatus: "pending" | "manual" | "auto";
  sendDetails?: {
    message: string;
    imageUrl?: string;
    sentAt: string;
    sentBy?: string;
  };
}

export interface ManualSendBirthdayWishDto {
  userId: string;
  message: string;
  imageUrl?: string;
}

export const birthdayWishApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBirthdayWish: build.query<BirthdayWish | null, string | undefined>({
      query: (gymId) =>
        gymId
          ? `/birthday-wish?gymId=${encodeURIComponent(gymId)}`
          : `/birthday-wish`,
      providesTags: ["BirthdayWish"],
    }),

    upsertBirthdayWish: build.mutation<BirthdayWish, UpsertBirthdayWishDto>({
      query: (body) => ({
        url: `/birthday-wish`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["BirthdayWish"],
    }),

    getTodayBirthdays: build.query<BirthdayUser[], string | undefined>({
      query: (gymId) =>
        gymId
          ? `/birthday-wish/today?gymId=${encodeURIComponent(gymId)}`
          : `/birthday-wish/today`,
      providesTags: ["BirthdayUser"],
    }),

    manualSendBirthdayWish: build.mutation<
      { success: boolean; message: string },
      ManualSendBirthdayWishDto
    >({
      query: (body) => ({
        url: `/birthday-wish/manual-send`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["BirthdayUser"],
    }),

    toggleAutoSend: build.mutation<BirthdayWish, ToggleAutoSendDto>({
      query: (body) => ({
        url: `/birthday-wish/auto-send`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["BirthdayWish"],
    }),
  }),
});

export const {
  useGetBirthdayWishQuery,
  useUpsertBirthdayWishMutation,
  useGetTodayBirthdaysQuery,
  useManualSendBirthdayWishMutation,
  useToggleAutoSendMutation,
} = birthdayWishApi;
