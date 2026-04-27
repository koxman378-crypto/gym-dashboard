import { api } from "./baseApi";
import type {
  GymPriceGroup,
  GymPriceItem,
  CreateGymPriceDto,
  UpdateGymPriceDto,
  GymFeeRecord,
  CreateGymFeeRecordDto,
  UpdateGymFeeRecordDto,
  OtherServiceItem,
  CreateOtherServiceDto,
  UpdateOtherServiceDto,
} from "@/src/types/extended-types";

const normalizeGymFeeRecord = (item: any): GymFeeRecord => ({
  _id: item?._id,
  name: item?.name ?? "",
  gymId: item?.gymId ?? null,
  amount: Number(item?.amount ?? 0),
  duration: Number(item?.duration ?? 1),
  durationUnit: item?.durationUnit ?? "months",
  promotionType: item?.promotionType ?? null,
  promotionValue:
    item?.promotionValue === undefined ? null : item?.promotionValue,
  isActive: Boolean(item?.isActive ?? true),
  createdAt: item?.createdAt,
  updatedAt: item?.updatedAt,
});

const normalizeOtherServiceItem = (item: any): OtherServiceItem => ({
  _id: item?._id,
  name: item?.name ?? "",
  gymId: item?.gymId ?? null,
  amountDays: Number(item?.amountDays ?? item?.amount ?? 0),
  amountMonths: Number(item?.amountMonths ?? item?.amount ?? 0),
  amountYears: Number(item?.amountYears ?? item?.amount ?? 0),
  isActive: Boolean(item?.isActive ?? true),
  createdAt: item?.createdAt,
  updatedAt: item?.updatedAt,
});

export const customFeesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ============ GYM PRICE GROUPS ============
    createGymFeeRecord: builder.mutation<
      GymFeeRecord,
      { data: CreateGymFeeRecordDto; gymId?: string }
    >({
      query: ({ data, gymId }) => ({
        url: "/custom-fees/gym-fees",
        method: "POST",
        body: data,
        params: gymId ? { gymId } : {},
      }),
      invalidatesTags: ["GymPrice"],
      transformResponse: (response: any) => normalizeGymFeeRecord(response),
    }),

    getAllGymFeeRecords: builder.query<
      GymFeeRecord[],
      { active?: boolean; gymId?: string }
    >({
      query: ({ active, gymId } = {}) => ({
        url: "/custom-fees/gym-fees",
        params: {
          ...(active !== undefined ? { active: active.toString() } : {}),
          ...(gymId ? { gymId } : {}),
        },
      }),
      providesTags: ["GymPrice"],
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response.map(normalizeGymFeeRecord);
        }
        if (response?.data && Array.isArray(response.data)) {
          return response.data.map(normalizeGymFeeRecord);
        }
        if (response?.results && Array.isArray(response.results)) {
          return response.results.map(normalizeGymFeeRecord);
        }
        return [];
      },
    }),

    getGymFeeRecordById: builder.query<GymFeeRecord, string>({
      query: (id) => `/custom-fees/gym-fees/${id}`,
      providesTags: (_result, _error, id) => [{ type: "GymPrice", id }],
      transformResponse: (response: any) => normalizeGymFeeRecord(response),
    }),

    updateGymFeeRecord: builder.mutation<
      GymFeeRecord,
      { id: string; data: UpdateGymFeeRecordDto }
    >({
      query: ({ id, data }) => ({
        url: `/custom-fees/gym-fees/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "GymPrice", id },
        "GymPrice",
      ],
      transformResponse: (response: any) => normalizeGymFeeRecord(response),
    }),

    deleteGymFeeRecord: builder.mutation<void, string>({
      query: (id) => ({
        url: `/custom-fees/gym-fees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GymPrice"],
    }),

    createGymPriceGroup: builder.mutation<GymPriceGroup, CreateGymPriceDto>({
      query: (data) => ({
        url: "/custom-fees/gym-fees",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["GymPrice"],
    }),

    getAllGymPriceGroups: builder.query<
      GymPriceGroup[],
      { active?: boolean; gymId?: string }
    >({
      query: ({ active, gymId } = {}) => ({
        url: "/custom-fees/gym-fees",
        params: {
          ...(active !== undefined ? { active: active.toString() } : {}),
          ...(gymId ? { gymId } : {}),
        },
      }),
      providesTags: ["GymPrice"],
    }),

    getGymPriceGroupById: builder.query<GymPriceGroup, string>({
      query: (id) => `/custom-fees/gym-fees/${id}`,
      providesTags: (_result, _error, id) => [{ type: "GymPrice", id }],
    }),

    updateGymPriceGroup: builder.mutation<
      GymPriceGroup,
      { id: string; data: UpdateGymPriceDto }
    >({
      query: ({ id, data }) => ({
        url: `/custom-fees/gym-fees/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "GymPrice", id },
        "GymPrice",
      ],
    }),

    deleteGymPriceGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/custom-fees/gym-fees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GymPrice"],
    }),

    toggleGymPriceGroup: builder.mutation<GymPriceGroup, string>({
      query: (id) => ({
        url: `/custom-fees/gym-fees/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["GymPrice"],
    }),

    toggleGymPriceItem: builder.mutation<
      GymPriceGroup,
      { groupId: string; itemId: string }
    >({
      query: ({ groupId, itemId }) => ({
        url: `/custom-fees/gym-fees/${groupId}/items/${itemId}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["GymPrice"],
    }),

    // ============ OTHER SERVICE ITEMS ============
    createOtherServiceItem: builder.mutation<
      OtherServiceItem,
      { data: CreateOtherServiceDto; gymId?: string }
    >({
      query: ({ data, gymId }) => ({
        url: "/custom-fees/services",
        method: "POST",
        body: data,
        params: gymId ? { gymId } : {},
      }),
      invalidatesTags: ["OtherService"],
      transformResponse: (response: any) => normalizeOtherServiceItem(response),
    }),

    getAllOtherServiceItems: builder.query<
      OtherServiceItem[],
      { active?: boolean; gymId?: string }
    >({
      query: ({ active, gymId } = {}) => ({
        url: "/custom-fees/services",
        params: {
          ...(active !== undefined ? { active: active.toString() } : {}),
          ...(gymId ? { gymId } : {}),
        },
      }),
      providesTags: ["OtherService"],
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response.map(normalizeOtherServiceItem);
        }
        if (response?.data && Array.isArray(response.data)) {
          return response.data.map(normalizeOtherServiceItem);
        }
        if (response?.results && Array.isArray(response.results)) {
          return response.results.map(normalizeOtherServiceItem);
        }
        return [];
      },
    }),

    getOtherServiceItemById: builder.query<OtherServiceItem, string>({
      query: (id) => `/custom-fees/services/${id}`,
      providesTags: (_result, _error, id) => [{ type: "OtherService", id }],
      transformResponse: (response: any) => normalizeOtherServiceItem(response),
    }),

    updateOtherServiceItem: builder.mutation<
      OtherServiceItem,
      { id: string; data: UpdateOtherServiceDto }
    >({
      query: ({ id, data }) => ({
        url: `/custom-fees/services/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "OtherService", id },
        "OtherService",
      ],
      transformResponse: (response: any) => normalizeOtherServiceItem(response),
    }),

    toggleOtherServiceItem: builder.mutation<OtherServiceItem, string>({
      query: (id) => ({
        url: `/custom-fees/services/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["OtherService"],
      transformResponse: (response: any) => normalizeOtherServiceItem(response),
    }),

    deleteOtherServiceItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/custom-fees/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OtherService"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateGymFeeRecordMutation,
  useGetAllGymFeeRecordsQuery,
  useGetGymFeeRecordByIdQuery,
  useUpdateGymFeeRecordMutation,
  useDeleteGymFeeRecordMutation,
  useCreateGymPriceGroupMutation,
  useGetAllGymPriceGroupsQuery,
  useGetGymPriceGroupByIdQuery,
  useUpdateGymPriceGroupMutation,
  useDeleteGymPriceGroupMutation,
  useToggleGymPriceGroupMutation,
  useToggleGymPriceItemMutation,
  useCreateOtherServiceItemMutation,
  useGetAllOtherServiceItemsQuery,
  useGetOtherServiceItemByIdQuery,
  useUpdateOtherServiceItemMutation,
  useToggleOtherServiceItemMutation,
  useDeleteOtherServiceItemMutation,
} = customFeesApi;

// Backward-compatible aliases used by some existing screens
export const useGetAllGymFeesQuery = useGetAllGymPriceGroupsQuery;
export const useCreateGymFeeMutation = useCreateGymPriceGroupMutation;
export const useUpdateGymFeeMutation = useUpdateGymPriceGroupMutation;
export const useDeleteGymFeeMutation = useDeleteGymPriceGroupMutation;
export const useGetAllServiceItemsQuery = useGetAllOtherServiceItemsQuery;
export const useCreateServiceItemMutation = useCreateOtherServiceItemMutation;
export const useUpdateServiceItemMutation = useUpdateOtherServiceItemMutation;
export const useDeleteServiceItemMutation = useDeleteOtherServiceItemMutation;
