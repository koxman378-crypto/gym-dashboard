import { api } from "./baseApi";
import type {
  ExpiryPreset,
  CreateExpiryPresetDto,
  UpdateExpiryPresetDto,
} from "@/src/types/extended-types";

const normalizePreset = (item: any): ExpiryPreset => ({
  _id: item?._id,
  label: item?.label ?? "",
  days: Number(item?.days ?? 0),
  isActive: Boolean(item?.isActive ?? true),
  createdAt: item?.createdAt,
  updatedAt: item?.updatedAt,
});

export const expiryPresetsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getExpiryPresets: builder.query<ExpiryPreset[], { active?: boolean }>({
      query: ({ active } = {}) => ({
        url: "/expiry-presets",
        params: active !== undefined ? { active: active.toString() } : {},
      }),
      providesTags: ["ExpiryPreset"],
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response.map(normalizePreset);
        return [];
      },
    }),

    createExpiryPreset: builder.mutation<ExpiryPreset, CreateExpiryPresetDto>({
      query: (data) => ({
        url: "/expiry-presets",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ExpiryPreset"],
      transformResponse: (response: any) => normalizePreset(response),
    }),

    updateExpiryPreset: builder.mutation<
      ExpiryPreset,
      { id: string; data: UpdateExpiryPresetDto }
    >({
      query: ({ id, data }) => ({
        url: `/expiry-presets/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ExpiryPreset"],
      transformResponse: (response: any) => normalizePreset(response),
    }),

    toggleExpiryPreset: builder.mutation<ExpiryPreset, string>({
      query: (id) => ({
        url: `/expiry-presets/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["ExpiryPreset"],
      transformResponse: (response: any) => normalizePreset(response),
    }),

    deleteExpiryPreset: builder.mutation<void, string>({
      query: (id) => ({
        url: `/expiry-presets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExpiryPreset"],
    }),
  }),
});

export const {
  useGetExpiryPresetsQuery,
  useCreateExpiryPresetMutation,
  useUpdateExpiryPresetMutation,
  useToggleExpiryPresetMutation,
  useDeleteExpiryPresetMutation,
} = expiryPresetsApi;
