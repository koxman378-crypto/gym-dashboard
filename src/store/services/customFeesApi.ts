import { api } from "./baseApi";
import type {
  GymPriceGroup,
  OtherServiceGroup,
  CreateGymPriceDto,
  UpdateGymPriceDto,
  CreateOtherServiceDto,
  UpdateOtherServiceDto,
} from "@/src/types/extended-types";

export const customFeesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ============ GYM PRICE GROUPS ============
    createGymPriceGroup: builder.mutation<GymPriceGroup, CreateGymPriceDto>({
      query: (data) => ({
        url: "/custom-fees/gym-prices",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["GymPrice"],
    }),

    getAllGymPriceGroups: builder.query<GymPriceGroup[], { active?: boolean }>({
      query: ({ active } = {}) => ({
        url: "/custom-fees/gym-prices",
        params: active !== undefined ? { active: active.toString() } : {},
      }),
      providesTags: ["GymPrice"],
    }),

    getGymPriceGroupById: builder.query<GymPriceGroup, string>({
      query: (id) => `/custom-fees/gym-prices/${id}`,
      providesTags: (_result, _error, id) => [{ type: "GymPrice", id }],
    }),

    updateGymPriceGroup: builder.mutation<
      GymPriceGroup,
      { id: string; data: UpdateGymPriceDto }
    >({
      query: ({ id, data }) => ({
        url: `/custom-fees/gym-prices/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "GymPrice", id },
        "GymPrice",
      ],
    }),

    toggleGymPriceGroup: builder.mutation<GymPriceGroup, string>({
      query: (id) => ({
        url: `/custom-fees/gym-prices/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "GymPrice", id },
        "GymPrice",
      ],
    }),

    deleteGymPriceGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/custom-fees/gym-prices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GymPrice"],
    }),

    toggleGymPriceItem: builder.mutation<
      GymPriceGroup,
      { groupId: string; itemId: string }
    >({
      query: ({ groupId, itemId }) => ({
        url: `/custom-fees/gym-prices/${groupId}/items/${itemId}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "GymPrice", id: groupId },
        "GymPrice",
      ],
    }),

    // ============ OTHER SERVICE GROUPS ============
    createOtherServiceGroup: builder.mutation<
      OtherServiceGroup,
      CreateOtherServiceDto
    >({
      query: (data) => ({
        url: "/custom-fees/other-services",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["OtherService"],
    }),

    getAllOtherServiceGroups: builder.query<
      OtherServiceGroup[],
      { active?: boolean }
    >({
      query: ({ active } = {}) => ({
        url: "/custom-fees/other-services",
        params: active !== undefined ? { active: active.toString() } : {},
      }),
      providesTags: ["OtherService"],
    }),

    getOtherServiceGroupById: builder.query<OtherServiceGroup, string>({
      query: (id) => `/custom-fees/other-services/${id}`,
      providesTags: (_result, _error, id) => [{ type: "OtherService", id }],
    }),

    updateOtherServiceGroup: builder.mutation<
      OtherServiceGroup,
      { id: string; data: UpdateOtherServiceDto }
    >({
      query: ({ id, data }) => ({
        url: `/custom-fees/other-services/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "OtherService", id },
        "OtherService",
      ],
    }),

    toggleOtherServiceGroup: builder.mutation<OtherServiceGroup, string>({
      query: (id) => ({
        url: `/custom-fees/other-services/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "OtherService", id },
        "OtherService",
      ],
    }),

    deleteOtherServiceGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/custom-fees/other-services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OtherService"],
    }),

    toggleOtherServiceItem: builder.mutation<
      OtherServiceGroup,
      { groupId: string; itemId: string }
    >({
      query: ({ groupId, itemId }) => ({
        url: `/custom-fees/other-services/${groupId}/items/${itemId}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "OtherService", id: groupId },
        "OtherService",
      ],
    }),
  }),
});

export const {
  // Gym Price Groups
  useCreateGymPriceGroupMutation,
  useGetAllGymPriceGroupsQuery,
  useGetGymPriceGroupByIdQuery,
  useUpdateGymPriceGroupMutation,
  useToggleGymPriceGroupMutation,
  useDeleteGymPriceGroupMutation,
  useToggleGymPriceItemMutation,

  // Other Service Groups
  useCreateOtherServiceGroupMutation,
  useGetAllOtherServiceGroupsQuery,
  useGetOtherServiceGroupByIdQuery,
  useUpdateOtherServiceGroupMutation,
  useToggleOtherServiceGroupMutation,
  useDeleteOtherServiceGroupMutation,
  useToggleOtherServiceItemMutation,
} = customFeesApi;
