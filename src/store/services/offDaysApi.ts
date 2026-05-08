import { api } from "./baseApi";

export interface OffDay {
  _id: string;
  gymId: string;
  name: string;
  note: string | null;
  daysCount: number;
  affectedCount: number;
  createdBy: { _id: string; name: string; email: string } | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOffDayDto {
  gymId?: string; // optional — omit to apply to all gyms
  name: string;
  note?: string;
  daysCount: number;
}

const normalizeOffDay = (item: any): OffDay => ({
  _id: item?._id ?? "",
  gymId: item?.gymId ?? "",
  name: item?.name ?? "",
  note: item?.note ?? null,
  daysCount: item?.daysCount ?? 0,
  affectedCount: item?.affectedCount ?? 0,
  createdBy: item?.createdBy ?? "",
  createdAt: item?.createdAt ?? "",
  updatedAt: item?.updatedAt ?? "",
});

export const offDaysApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOffDays: builder.query<OffDay[], string | undefined>({
      query: (gymId) => ({
        url: "/off-days",
        params: gymId ? { gymId } : {},
      }),
      providesTags: ["OffDay"],
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response.map(normalizeOffDay);
        return [];
      },
    }),

    createOffDay: builder.mutation<OffDay, CreateOffDayDto>({
      query: (data) => ({ url: "/off-days", method: "POST", body: data }),
      invalidatesTags: ["OffDay"],
      transformResponse: (response: any) => normalizeOffDay(response),
    }),

    deleteOffDay: builder.mutation<void, { id: string; gymId?: string }>({
      query: ({ id, gymId }) => ({
        url: `/off-days/${id}`,
        method: "DELETE",
        params: gymId ? { gymId } : {},
      }),
      invalidatesTags: ["OffDay"],
    }),
  }),
});

export const {
  useGetOffDaysQuery,
  useCreateOffDayMutation,
  useDeleteOffDayMutation,
} = offDaysApi;
